import { Injectable } from '@nestjs/common';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { Message, Post, PostWithInfo } from '../types/mysql/h3players';
import { PlayersService } from './players.service';

@Injectable()
export class PostsService {
    constructor(private readonly playersService: PlayersService) {}

    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });
    
    async getList(): Promise<PostWithInfo[]> {
        const [posts] = await this.mysql.execute<(Post & RowDataPacket)[]>(
            'SELECT * FROM posts WHERE deleted_at IS NULL ORDER BY created_at DESC',
            []
        );

        return this.enrichPosts(posts);
    }
    
    async getDiscussionPostsList(discussionId: number): Promise<PostWithInfo[]> {
        const [posts] = await this.mysql.execute<(Post & RowDataPacket)[]>(
            'SELECT * FROM posts WHERE deleted_at IS NULL AND discussion_id = ? ORDER BY created_at DESC',
            [discussionId]
        );
        
        return this.enrichPosts(posts);
    }
    
    private async enrichPosts(posts: Post[]): Promise<PostWithInfo[]> {
        if (posts.length === 0) return [];
    
        const postIds = posts.map(p => p.id);
    
        const [messages] = await this.mysql.execute<(Message & RowDataPacket)[]>(
            'SELECT * FROM messages WHERE deleted_at IS NULL AND post_id IN (?) ORDER BY created_at ASC',
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
