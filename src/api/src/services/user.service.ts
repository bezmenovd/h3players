import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import mysql from 'mysql2/promise';

@Injectable()
export class UserService {
    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });

    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })
    
    async me() {
        
    }
}
