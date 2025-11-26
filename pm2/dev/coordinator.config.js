module.exports = {
    apps: [
        {
            name: 'coordinator',
            script: 'yarn workers:coordinator:dev',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                LOG_PATH: '/var/www/output/coordinator',
            },
        },
    ],
};
