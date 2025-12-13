module.exports = {
    apps: [
        {
            name: 'journalist-1',
            script: 'yarn workers:journalist:dev',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                NAME: 'journalist-1',
                LOG_PATH: '/var/www/output/journalist/1',
            },
        },
    ],
};
