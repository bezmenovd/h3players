import { Injectable } from '@nestjs/common';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { Message, Post, PostWithInfo, Vote } from '../types/mysql/h3players';
import { PlayersService } from './players.service';
import { Player } from '../types/clickhouse/lobby';
import { timestamp } from '../helpers/timestamp';
import { PermissionsService } from './permissions.service';
import { makeSlug } from '../helpers/string';
import { OpenaiService } from './openai.service';
import { als } from '../als';

@Injectable()
export class PostsService {
    constructor(
        private readonly playersService: PlayersService,
        private readonly permissonsService: PermissionsService,
        private readonly openaiService: OpenaiService,
    ) {}

    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });
    
    async getList(sort: string = 'new', query: string = ''): Promise<PostWithInfo[]> {
        let orderBy = {
            'new': 'ORDER BY p.created_at DESC',
            'popular': 'ORDER BY views_count DESC',
            'top': 'ORDER BY rating DESC',
        }[sort] ?? 'ORDER BY p.created_at DESC'

        const params: any[] = [
            als.getStore()!.language, 
            als.getStore()!.language,
        ];

        let whereConditions = []

        if (query) {
            whereConditions.push(`ANY_VALUE(t1.value) LIKE ? OR ANY_VALUE(t2.value) LIKE ?`)
            params.push(`%${query}%`)
            params.push(`%${query}%`)
        }

        let where = whereConditions.join(' AND ')

        const [posts] = await this.mysql.execute<(Post & RowDataPacket)[]>(
            `SELECT 
                p.*,
                ANY_VALUE(t1.value) as title,
                ANY_VALUE(t2.value) as text,
                count(v.post_id) as views_count,
                COALESCE(SUM(CASE WHEN votes.type = 1 THEN 1 WHEN votes.type = 2 THEN -1 ELSE 0 END), 0) as rating
            FROM posts p
            LEFT JOIN texts t1 on t1.entity_id = p.id AND t1.entity_type = 2 AND t1.language = ? AND t1.tag = 'title'
            LEFT JOIN texts t2 on t2.entity_id = p.id AND t2.entity_type = 2 AND t2.language = ? AND t2.tag = 'text'
            LEFT JOIN post_views v on v.post_id = p.id
            LEFT JOIN votes ON votes.entity_id = p.id AND votes.entity_type = 2
            LEFT JOIN reports r ON r.entity_id = p.id AND r.entity_type = 2
            WHERE p.deleted_at IS NULL ${ where ? `AND ${where}` : '' }
            GROUP BY p.id
            HAVING count(r.at) < 3
            ${orderBy}`,
            params
        );

        return this.enrichPosts(posts);
    }

    async getBySlug(slug: string): Promise<PostWithInfo|null> {
        const [posts] = await this.mysql.execute<(Post & RowDataPacket)[]>(
            `SELECT 
                p.*,
                ANY_VALUE(t1.value) as title,
                ANY_VALUE(t2.value) as text,
                count(v.post_id) as views_count
            FROM posts p
            LEFT JOIN texts t1 on t1.entity_id = p.id AND t1.entity_type = 2 AND t1.language = ? AND t1.tag = 'title'
            LEFT JOIN texts t2 on t2.entity_id = p.id AND t2.entity_type = 2 AND t2.language = ? AND t2.tag = 'text'
            LEFT JOIN post_views v on v.post_id = p.id
            WHERE p.slug = ? AND p.deleted_at IS NULL
            GROUP BY p.id
            ORDER BY p.created_at DESC`,
            [als.getStore()!.language, als.getStore()!.language, slug]
        );

        if (posts.length === 0) {
            return null
        }

        return (await this.enrichPosts(posts))[0]
    }
    
    async getDiscussionPostsList(discussionId: number, sort: string = 'new', query: string = ''): Promise<PostWithInfo[]> {
        let orderBy = {
            'new': 'ORDER BY p.created_at DESC',
            'popular': 'ORDER BY views_count DESC',
            'top': 'ORDER BY rating DESC',
        }[sort] ?? 'ORDER BY p.created_at DESC'

        const params: any[] = [
            als.getStore()!.language, 
            als.getStore()!.language, 
            discussionId,
        ];

        let whereConditions = []

        if (query) {
            whereConditions.push(`ANY_VALUE(t1.value) LIKE ? OR ANY_VALUE(t2.value) LIKE ?`)
            params.push(`%${query}%`)
            params.push(`%${query}%`)
        }

        let where = whereConditions.join(' AND ')

        const [posts] = await this.mysql.execute<(Post & RowDataPacket)[]>(
            `SELECT 
                p.*,
                ANY_VALUE(t1.value) as title,
                ANY_VALUE(t2.value) as text,
                count(v.post_id) as views_count,
                COALESCE(SUM(CASE WHEN votes.type = 1 THEN 1 WHEN votes.type = 2 THEN -1 ELSE 0 END), 0) as rating
            FROM posts p
            LEFT JOIN texts t1 on t1.entity_id = p.id AND t1.entity_type = 2 AND t1.language = ? AND t1.tag = 'title'
            LEFT JOIN texts t2 on t2.entity_id = p.id AND t2.entity_type = 2 AND t2.language = ? AND t2.tag = 'text'
            LEFT JOIN post_views v on v.post_id = p.id
            LEFT JOIN votes ON votes.entity_id = p.id AND votes.entity_type = 2
            LEFT JOIN reports r ON r.entity_id = p.id AND r.entity_type = 2
            WHERE p.deleted_at IS NULL AND p.discussion_id = ? ${ where ? `AND ${where}` : '' }
            GROUP BY p.id
            HAVING count(r.at) < 3
            ${orderBy}`,
            params
        );

        return this.enrichPosts(posts);
    }

    async addPost(player: Player, title: string, text: string, discussion_id: number): Promise<Post> {
        let [rows] = await this.mysql.execute<({ count: number } & RowDataPacket)[]>(
            'SELECT count(*) as count FROM `posts` WHERE player_id = ? AND created_at > ?',
            [player.id, timestamp.startOfDay()]
        )

        if (rows[0].count >= 3 && ! await this.permissonsService.authorize(player, 'posts.add.unlimit')) {
            throw new Error('day_limit')
        }

        title = title.trim()

        if (title.length < 5 || title.length > 32) {
            throw new Error('invalid_title')
        }
        if (text.length < 10 || text.length > 10000) {
            throw new Error('invalid_text')
        }

        if ((text.match(new RegExp('\n', 'gi')) || []).length > 100) {
            throw new Error('too_many_lines')
        }
        if ((text.match(new RegExp('![', 'gi')) || []).length > 3) {
            throw new Error('too_many_images')
        }

        const resultTitle = await this.openaiService.moderateAndTranslate(title, als.getStore()!.language)

        if (! resultTitle.isValid) {
            this.permissonsService.handleViolation(player)
            throw new Error(`failed_moderation:${resultTitle.reason}`)
        }

        const resultText = await this.openaiService.moderateAndTranslate(text, als.getStore()!.language)

        if (! resultText.isValid) {
            this.permissonsService.handleViolation(player)
            throw new Error(`failed_moderation:${resultText.reason}`)
        }

        const slug = makeSlug(title)
        const now = timestamp.now()

        await this.mysql.execute(
            'INSERT INTO `posts` (player_id, discussion_id, slug, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [player.id, discussion_id, slug, now, now]
        )
        
        const [postsAdded] = await this.mysql.execute<(Post & RowDataPacket)[]>(
            'SELECT * FROM `posts` WHERE player_id = ? AND created_at = ?',
            [player.id, now]
        )

        if (postsAdded.length === 0) {
            throw new Error('fail')
        }

        await this.mysql.execute(
            `INSERT INTO texts 
            (player_id, entity_type, entity_id, tag, language, value, created_at, updated_at) 
            VALUES
            (?, 2, ?, ?, ?, ?, ?, ?)`,
            [player.id, postsAdded[0].id, 'title', als.getStore()!.language, title, now, now]
        )

        await this.mysql.execute(
            `INSERT INTO texts 
            (player_id, entity_type, entity_id, tag, language, value, created_at, updated_at) 
            VALUES
            (?, 2, ?, ?, ?, ?, ?, ?)`,
            [player.id, postsAdded[0].id, 'text', als.getStore()!.language, text, now, now]
        )

        Promise.all(resultTitle.translations.map(async (t) => {
            await this.mysql.execute(
                `INSERT INTO texts 
                (player_id, entity_type, entity_id, tag, language, value, created_at, updated_at) 
                VALUES
                (?, 2, ?, ?, ?, ?, ?, ?)`,
                [player.id, postsAdded[0].id, 'title', t.lang, t.value, now, now]
            )
        }))

        Promise.all(resultText.translations.map(async (t) => {
            await this.mysql.execute(
                `INSERT INTO texts 
                (player_id, entity_type, entity_id, tag, language, value, created_at, updated_at) 
                VALUES
                (?, 2, ?, ?, ?, ?, ?, ?)`,
                [player.id, postsAdded[0].id, 'text', t.lang, t.value, now, now]
            )
        }))

        return postsAdded[0]
    }

    async registerView(player: Player, id: number): Promise<void> {
        await this.mysql.execute(
            `INSERT IGNORE INTO post_views (post_id, player_id, at)
            SELECT id, ?, ?
            FROM posts 
            WHERE id = ? AND deleted_at IS NULL
            `,
            [player.id, timestamp.now(), id]
        )
    }

    async vote(player: Player, id: number, type: number): Promise<void> {
        await this.mysql.execute(
            `INSERT IGNORE INTO votes (player_id, entity_type, entity_id, type, at)
            SELECT ?, ?, id, ?, ?
            FROM posts 
            WHERE id = ? AND deleted_at IS NULL
            `,
            [player.id, 2, type, timestamp.now(), id]
        )
    }
    
    private async enrichPosts(posts: Post[]): Promise<PostWithInfo[]> {
        if (posts.length === 0) return [];
    
        const postIds = posts.map(p => p.id);
    
        const [messages] = await this.mysql.query<(Message & RowDataPacket)[]>(
            `SELECT m.*, t.value as text
             FROM messages m
             LEFT JOIN texts t on t.entity_id = m.id AND t.entity_type = 3 AND t.language = ?
             WHERE m.deleted_at IS NULL AND m.post_id IN (?) 
             ORDER BY m.created_at ASC`,
            [als.getStore()!.language, postIds]
        );
    
        const messageIds = messages.map(m => m.id);
    
        const [votes] = await this.mysql.query<(Vote & RowDataPacket)[]>(
            `SELECT * FROM votes 
             WHERE (entity_type = 2 AND entity_id IN (?))
                OR (entity_type = 3 AND entity_id IN (?))
            ORDER BY at DESC`,
            [postIds, messageIds.length ? messageIds : [0]]
        );
    
        const allPlayerIds = Array.from(new Set([
            ...posts.map(p => p.player_id),
            ...messages.map(m => m.player_id),
            ...votes.map(v => v.player_id)
        ]));
        const players = await this.playersService.players(allPlayerIds);
        const playerMap = new Map(players.map(p => [p.id, p]));
    
        const votesByEntityMap = new Map<string, any[]>();
    
        for (const vote of votes) {
            const key = `${vote.entity_type}:${vote.entity_id}`;
            if (!votesByEntityMap.has(key)) {
                votesByEntityMap.set(key, []);
            }
            votesByEntityMap.get(key)!.push({
                ...vote,
                player_name: playerMap.get(vote.player_id)?.name || '?'
            });
        }
    
        return posts.map(post => {
            const postVotes = votesByEntityMap.get(`2:${post.id}`) || [];
            
            return {
                ...post,
                player_name: playerMap.get(post.player_id)?.name || '?',
                votes: postVotes,
                comments: messages
                    .filter(m => m.post_id === post.id)
                    .map(message => ({
                        ...message,
                        player_name: playerMap.get(message.player_id)?.name || '?',
                        votes: votesByEntityMap.get(`3:${message.id}`) || []
                    }))
            };
        });
    }
}
