module.exports = {
    apps: [
        {
            name: 'journalist-1',
            script: 'yarn workers:journalist',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                NAME: 'journalist-1',
                LOG_PATH: '/var/www/output/journalist/1',
            },
        },
        {
            name: 'journalist-2',
            script: 'yarn workers:journalist',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                NAME: 'journalist-2',
                LOG_PATH: '/var/www/output/journalist/2',
            },
        },
        {
            name: 'journalist-3',
            script: 'yarn workers:journalist',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                NAME: 'journalist-3',
                LOG_PATH: '/var/www/output/journalist/3',
            },
        },
    ],
};
