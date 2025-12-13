export default {
    navigation: {
        lobby: 'Lobby',
        players: 'Players',
        templates: 'Templates',
        performance: 'Performance',
    },
    vaa: {
        about: 'About',
    },
    user: {
        login_btn: 'Log in via Lobby',
        auth_modal: {
            title: 'Authorization',
            info: {
                part1: 'To authorize, you need to send a message with the code to the account',
                part2: 'in the Lobby',
            },
            input: 'Enter your Lobby nickname',
            no_code: 'The code will appear after entering your nickname',
            message_not_received_yet: 'Message not yet received',
            lost_connection: 'Lost connection to the server',
            code_invalidated: 'CODE INVALIDATED',
        },
        settings_modal: {
            title: 'Settings',
            settings: {
                language: 'Language',
                account: {
                    text: 'Account',
                    btn: 'Log out'
                }
            }
        }
    },
    lobby: {
        title: 'Lobby',
        counters: {
            online: 'online',
            games: {
                text: 'games',
                hint: 'Number of games completed today'
            },
            visitors: {
                text: 'visitors',
                hint: 'Number of users who visited the lobby today'
            },
        },
        last_games: {
            title: 'Latest Games',
            hint: 'Only completed ranked games'
        },
        daily_top: {
            title: 'Daily Top',
            hint: 'By UTC',
            by_rating: {
                title: 'Rating',
                hint: 'All games'
            },
            by_rating_anti: {
                title: 'Rating -',
                hint: 'All games',
            },
            by_games_count: {
                title: 'Games',
                hint: 'Only ranked games on random maps'
            }
        }
    },
}