module.exports = {
    apps: [
        {
            name: 'background',
            script: 'yarn workers:background',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                LOG_PATH: '/var/www/output/background',
            },
        },
    ],
};
