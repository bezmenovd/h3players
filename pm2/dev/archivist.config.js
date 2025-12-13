module.exports = {
    apps: [
        {
            name: 'archivist-1',
            script: 'yarn workers:archivist:dev',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                NAME: 'archivist-1',
                LOG_PATH: '/var/www/output/archivist/1',
            },
        },
    ],
};
