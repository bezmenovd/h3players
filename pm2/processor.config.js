module.exports = {
    apps: [
        {
            name: 'processor',
            script: 'yarn workers:processor:dev',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                LOG_PATH: '/var/www/output/processor',
            },
        },
    ],
};
