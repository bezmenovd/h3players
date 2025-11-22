module.exports = {
    apps: [
        {
            name: 'journalist-1',
            script: 'yarn workers:journalist:dev',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                USER: 'h3players_bot3',
                LAST_ONLY_MODE: true,
                LOG_PATH: '/var/www/output/journalist/1',
            },
        },
        {
            name: 'journalist-2',
            script: 'yarn workers:journalist:dev',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                USER: 'h3players_bot4',
                LAST_ONLY_MODE: true,
                LOG_PATH: '/var/www/output/journalist/2',
            },
        },
        {
            name: 'journalist-3',
            script: 'yarn workers:journalist:dev',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                USER: 'h3players_bot5',
                LAST_ONLY_MODE: true,
                LOG_PATH: '/var/www/output/journalist/3',
            },
        },
    ],
};
