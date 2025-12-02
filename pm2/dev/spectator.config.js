module.exports = {
    apps: [
        {
            name: 'spectator',
            script: 'yarn workers:spectator:dev',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                USER: 'h3players_bot2',
                LOG_PATH: '/var/www/output/spectator',
            },
        },
    ],
};
