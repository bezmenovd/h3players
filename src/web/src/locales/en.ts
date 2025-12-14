export default {
    navigation: {
        lobby: 'Lobby',
        players: 'Players',
        templates: 'Templates',
        performance: 'Performance',
        discussions: 'Discussions',
    },
    links: {
        about: 'About',
        privacy_policy: 'Privacy Policy',
        user_agreement: 'User Agreement',
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
        },
        games: {
            title: 'Games',
        }
    },
    templates: {
        list: {
            title: 'Templates',
            query: {
                text: 'Enter name'
            }
        }
    },
    performance:{
        title: 'Total Load',
    },
    players: {
        search: {
            title: 'Find Player',
            input: {
                text: 'Enter Nickname',
            },
            history: {
                title: 'History',
            },
            popular: {
                title: 'Popular',
            }
        },
        list: {
            title: 'All Players',
        },
        detail: {
            player_rank: {
                text: 'in lobby',
            },
            no_data: 'No games found',
            overview: {
                games_count: 'Games',
                games_count_wins: 'Wins',
                games_count_loses: 'Losses',
                games_count_draws: 'Draws',
                games_count_winrate: 'Winrate',
                rating: {
                    text: 'Rating',
                    hint: 'Change today'
                },
                rank: 'Position',
                max_rating: 'Max. Rating',
                games_duration: {
                    text: 'Time in Games',
                    hint: 'Today',
                }
            },
            tabs: {
                overview: 'Overview',
                games: 'Games',
            },
            rating_chart: {
                formatters: {
                    rating: 'pts',
                }
            }
        }
    },
    about: {
        title: 'About',
    },
    topics: {
        list: {},
        detail: {},
    },
    privacy_policy: {
        title: 'Privacy Policy',
    },
    user_agreement: {
        title: 'User Agreement',
    },
    ui: {
        table: {
            footer: {
                of: 'of'
            }
        }
    }
}