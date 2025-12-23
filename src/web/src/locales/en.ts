export default {
    navigation: {
        lobby: 'Lobby',
        players: 'Players',
        templates: 'Templates',
        performance: 'Performance',
        posts: 'Discussions',
    },
    links: {
        about: 'About',
        privacy_policy: 'Privacy Policy',
        user_agreement: 'User Agreement',
    },
    user: {
        login_btn: 'Login via lobby',
        auth_modal: {
            title: 'Authorization',
            info: {
                part1: 'To authorize, send a message with the code to the account',
                part2: 'in the lobby',
            },
            input: 'Enter your lobby nickname',
            no_code: 'The code will appear after entering the nickname',
            message_not_received_yet: 'Message not received yet',
            lost_connection: 'Connection to server lost',
            code_invalidated: 'CODE INVALIDATED',
        },
        settings_modal: {
            title: 'Settings',
            settings: {
                language: 'Language',
                account: {
                    text: 'Account',
                    btn: 'Logout'
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
            title: 'Last games',
            hint: 'Only completed ranked games'
        },
        daily_top: {
            title: 'Daily top',
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
        },
        detail: {
            overview: {
                first_game: 'First host',
                games_count: 'Games count',
                games_duration: 'Duration',
                games_duration_avg: 'Average',
                players_count: 'Players',
                players_avg_games_count: 'Avg games per player',
                players_avg_duration: 'Avg time in games',
            },
            tabs: {
                games: 'Games',
                duration: 'By duration',
                end_day: 'By duration (days)',
            }
        },
        statistics: {
            title: 'Statistics',
            scenario: 'scenario',
            default: 'default',
        },
        posts: {
            title: 'Template Discussion',
        },
    },
    performance:{
        title: 'Total load',
    },
    players: {
        search: {
            title: 'Find player',
            input: {
                text: 'Enter nickname',
            },
            history: {
                title: 'History',
            },
            popular: {
                title: 'Popular',
            }
        },
        list: {
            title: 'All players',
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
                games_count_winrate: 'Win rate',
                rating: {
                    text: 'Rating',
                    hint: 'Change today'
                },
                rank: {
                    text: 'Rank',
                    hint: 'Only players who played at least one game after 27.06.2023 are counted',
                },
                max_rating: 'Max rating',
                games_duration: {
                    text: 'Time in games',
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
        tabs: {
            overview: 'General',
            load: 'Load',
            api: 'API'
        },
        load: {
            total: {
                title: 'Total load'
            }
        },
        api: {
            authorization: {
                text: 'Requests are authorized via the "Token" header. The token is issued upon authorization via the lobby and can be found in localStorage'
            }
        }
    },
    privacy_policy: {
        title: 'Privacy Policy',
    },
    user_agreement: {
        title: 'User Agreement',
    },
    discussions: {
        list: {
            title: 'Discussions',
            add: {
                text: 'New topic',
            },
            add_modal: {
                title: 'New topic',
                name: 'Title',
                save: 'Create',
                length: 'From 5 to 32 characters',
                success: 'Discussion added',
            },
            info_modal: {
                title: 'Moderation and translation',
            },
            all: 'All',
            mot: 'Moderation and translation',
        },
        discussion: {
            posts_count: 'Number of posts in topic',
        },
    },
    posts: {
        filter: {
            query: 'Find post',
            sort: {
                items: {
                    new: 'New',
                    popular: 'Popular',
                    top: 'Top',
                }
            }
        },
        list: {
            empty: 'No posts',
            loading: 'Loading..',
        },
        add: 'New post',
        edit: {
            new_post: 'New post',
            title: {
                placeholder: 'Post title',
                requirements: 'From 5 to 32 characters',
            },
            text: {
                placeholder: 'Text (Markdown supported)',
                requirements: 'From 10 to 10000 characters',
            },
            save: 'Save',
            success: 'Post saved',
        },
        link_modal: {
            title: 'External link redirect',
            continue: 'Continue',
        },
        hide_author: 'Hide author',
        show_author: 'Show author',
        no_text: 'The post has no text in this language, it seems it is still being translated',
        report: 'Report violation',
        blacklist: {
            title: 'Post hidden'
        },
        report_modal: {
            title: 'Report violation',
            send: 'Send',
            reason: {
                placeholder: 'Reason',
                requirements: 'From 3 to 32 characters',
            },
            success: 'Report delivered',
        },
        comments: {
            title: 'Comments',
            sort: {
                new: 'New',
                top: 'Top',
            },
            reply: 'Reply',
            reply_hide: 'Hide',
        },
        add_comment: {
            text: {
                placeholder: 'Comment',
            },
            send: 'Send',
        },
        view: {
        },
    },
    content_loader: {
        text: 'Automatic pre-moderation in progress',
    },
    errors: {
        fallback: 'Unknown error',
        failed_moderation: 'Pre-moderation failed',
        statuses: {
            404: 'Not found',
            400: 'Bad request',
            401: 'Unauthorized',
            429: 'Too many requests for this period',
            500: 'Internal server error',
        },
        general: {
            restricted: 'Your account is temporarily in read-only mode',
            no_permission: 'You do not have enough permissions to perform this action',
        },
        discussions: {
            add: {
                day_limit: 'Daily limit for created topics reached',
                duplicate: 'A topic with this name already exists',
                fail: 'Error creating topic',
                invalid_name: 'Topic cannot be created with this title/slug length',
                no_permission: 'You do not have permission to create a topic',
            },
        },
        posts: {
            add: {
                day_limit: 'Daily limit for created posts reached',
                duplicate: 'A post with this name already exists',
                fail: 'Error creating post',
                invalid_name: 'Post cannot be created with this title/slug length',
                invalid_text: '',
                too_many_lines: 'Too many lines in text (100 max)',
                images_not_available_yet: 'Images in text are not implemented yet',
            },
            update: {
                day_limit: 'Daily limit for created posts reached',
                duplicate: 'A post with this name already exists',
                fail: 'Error saving post',
                invalid_name: 'Post cannot be created with this title/slug length',
                invalid_text: '',
                too_many_lines: 'Too many lines in text (100 max)',
                images_not_available_yet: 'Images in text are not implemented yet',
            },
            addMessage: {
                day_limit: 'Daily limit for comments reached',
                fail: 'Error saving comment',
                invalid_text: 'Comment with this text cannot be created',
            }
        }
    },
    ui: {
        table: {
            footer: {
                of: 'of'
            }
        }
    },
    error: {
        websocket: {
            onerror: 'WS server connection error',
        }
    }
}