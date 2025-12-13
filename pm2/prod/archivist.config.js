module.exports = {
    apps: [
        {
            name: 'archivist-1',
            script: 'yarn workers:archivist',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                NAME: 'archivist-1',
                LOG_PATH: '/var/www/output/archivist/1',
            },
        },
        {
            name: 'archivist-2',
            script: 'yarn workers:archivist',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                NAME: 'archivist-2',
                LOG_PATH: '/var/www/output/archivist/2',
            },
        },
    ],
};
