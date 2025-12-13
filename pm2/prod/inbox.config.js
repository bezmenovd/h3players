module.exports = {
    apps: [
        {
            name: 'inbox',
            script: 'yarn workers:inbox',
            autorestart: true,
            max_restarts: 3,
            restart_delay: 3000,
            env: {
                LOG_PATH: '/var/www/output/inbox',
            },
        },
    ],
};
