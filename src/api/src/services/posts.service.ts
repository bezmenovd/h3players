import { Injectable } from '@nestjs/common';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { Message, Post, PostWithInfo } from '../types/mysql/h3players';
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
    
    async getList(): Promise<PostWithInfo[]> {
        const [posts] = await this.mysql.execute<(Post & RowDataPacket)[]>(
            `SELECT 
                p.*,
                t.value as text
            FROM posts p
            LEFT JOIN texts t on t.entity_id = p.id AND t.entity_type = 2
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC`,
            []
        );

        return this.enrichPosts(posts);
    }
    
    async getDiscussionPostsList(discussionId: number): Promise<PostWithInfo[]> {
        const [posts] = await this.mysql.execute<(Post & RowDataPacket)[]>(
            `SELECT 
                p.*,
                t.value as text
            FROM posts p
            LEFT JOIN texts t on t.entity_id = p.id AND t.entity_type = 2
            WHERE p.deleted_at IS NULL AND p.discussion_id = ? 
            ORDER BY p.created_at DESC`,
            [discussionId]
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

        if (title.length > 32) {
            throw new Error('invalid_title')
        }

        const result = await this.openaiService.moderateAndTranslate(`${title}: ${text}`, als.getStore()!.language)

        if (! result.isValid) {
            this.permissonsService.handleViolation(player)
            throw new Error(`failed_moderation:${result.reason}`)
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

        Promise.all(result.translations.map(async (t) => {
            await this.mysql.execute(
                `INSERT INTO texts 
                (player_id, entity_type, entity_id, tag, language, value, created_at, updated_at) 
                VALUES
                (?, 2, ?, ?, ?, ?, ?, ?)`,
                [player.id, postsAdded[0].id, 'title', t.lang, t.value, now, now]
            )
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
    
    private async enrichPosts(posts: Post[]): Promise<PostWithInfo[]> {
        if (posts.length === 0) return [];
    
        const postIds = posts.map(p => p.id);
    
        const [messages] = await this.mysql.execute<(Message & RowDataPacket)[]>(
            `SELECT 
                *,
                t.value as text
            FROM messages m
            LEFT JOIN texts t on t.entity_id = m.id AND t.entity_type = 3
            WHERE m.deleted_at IS NULL AND m.post_id IN (?) 
            ORDER BY m.created_at ASC`,
            [postIds]
        );
    
        const allPlayerIds = Array.from(new Set([
            ...posts.map(p => p.player_id),
            ...messages.map(m => m.player_id)
        ]));
    
        const players = await this.playersService.players(allPlayerIds);
        const playerMap = new Map(players.map(p => [p.id, p]));
    
        return posts.map(post => ({
            ...post,
            player_name: playerMap.get(post.player_id)?.name || '?',
            comments: messages
                .filter(m => m.post_id === post.id)
                .map(message => ({
                    ...message,
                    player_name: playerMap.get(message.player_id)?.name || '?',
                }))
        }));
    }
}
