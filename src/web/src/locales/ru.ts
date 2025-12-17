export default {
    navigation: {
        lobby: 'Лобби',
        players: 'Игроки',
        templates: 'Шаблоны',
        performance: 'Нагрузка',
        discussions: 'Обсуждения',
    },
    links: {
        about: 'О проекте',
        privacy_policy: 'Политика конфиденциальности',
        user_agreement: 'Пользовательское соглашение',
    },
    user: {
        login_btn: 'Войти через лобби',
        auth_modal: {
            title: 'Авторизация',
            info: {
                part1: 'Для авторизации нужно отправить сообщение с кодом аккаунту',
                part2: 'в лобби',
            },
            input: 'Введите ваш ник в лобби',
            no_code: 'Код появится после ввода ника',
            message_not_received_yet: 'Сообщение пока не получено',
            lost_connection: 'Потеряно соединение с сервером',
            code_invalidated: 'КОД АННУЛИРОВАН',
        },
        settings_modal: {
            title: 'Настройки',
            settings: {
                language: 'Язык',
                account: {
                    text: 'Аккаунт',
                    btn: 'Выйти'
                }
            }
        }
    },
    lobby: {
        title: 'Лобби',
        counters: {
            online: 'онлайн',
            games: {
                text: 'игр',
                hint: 'Число игр, завершённых сегодня'
            },
            visitors: {
                text: 'посетителей',
                hint: 'Число пользователей, посетивших лобби сегодня'
            },
        },
        last_games: {
            title: 'Последние игры',
            hint: 'Только завершенные рейтинговые игры'
        },
        daily_top: {
            title: 'Топ за день',
            hint: 'По UTC',
            by_rating: {
                title: 'Рейтинг',
                hint: 'Все игры'
            },
            by_rating_anti: {
                title: 'Рейтинг -',
                hint: 'Все игры',
            },
            by_games_count: {
                title: 'Игры',
                hint: 'Только рейтинговые игры на случайных картах'
            }
        },
        games: {
            title: 'Игры',
        }
    },
    templates: {
        list: {
            title: 'Шаблоны',
            query: {
                text: 'Введите название'
            }
        }
    },
    performance:{
        title: 'Суммарная нагрузка',
    },
    players: {
        search: {
            title: 'Найти игрока',
            input: {
                text: 'Введите ник',
            },
            history: {
                title: 'История',
            },
            popular: {
                title: 'Популярные',
            }
        },
        list: {
            title: 'Все игроки',
        },
        detail: {
            player_rank: {
                text: 'в лобби',
            },
            no_data: 'Не найдено ни одной игры',
            overview: {
                games_count: 'Игр',
                games_count_wins: 'Побед',
                games_count_loses: 'Поражений',
                games_count_draws: 'Ничьих',
                games_count_winrate: 'Процент побед',
                rating: {
                    text: 'Рейтинг',
                    hint: 'Изменение за сегодня'
                },
                rank: 'Позиция',
                max_rating: 'Макс. рейтинг',
                games_duration: {
                    text: 'Время в играх',
                    hint: 'За сегодня',
                }
            },
            tabs: {
                overview: 'Основное',
                games: 'Игры',
            },
            rating_chart: {
                formatters: {
                    rating: 'птс',
                }
            }
        }
    },
    about: {
        title: 'О проекте',
        tabs: {
            overview: 'Общее',
            load: 'Нагрузка',
            api: 'API'
        },
        load: {
            total: {
                title: 'Общая нагрузка'
            }
        },
        api: {
            authorization: {
                text: 'Авторизация запросов происходит через заголовок "Token". Токен выдается при авторизации через лобби, может быть найден в localStorage'
            }
        }
    },
    topics: {
        list: {},
        detail: {},
    },
    privacy_policy: {
        title: 'Политика конфиденциальности',
    },
    user_agreement: {
        title: 'Пользовательское соглашение',
    },
    discussions: {
        list: {
            title: 'Обсуждения',
            add: {
                text: 'Новая тема',
                authentication_required: 'Требуется авторизация',
            },
            add_modal: {
                title: 'Новая тема',
                name: 'Название',
                save: 'Создать',
                min_length: 'Минимум 5 символов',
                success: 'Обсуждение добавлено',
                errors: {
                    day_limit: 'Достигнут дневной лимит на количество созданных тем',
                    duplicate: 'Тема с таким названием уже существует',
                    fail: 'При создании темы произошла ошибка',
                    invalid_name: 'Тема с названием такой длины/slug-ом (url) такой длины не может быть создана',
                }
            },
        },
        discussion: {
            posts_count: 'Число постов по теме',
        },
    },
    ui: {
        table: {
            footer: {
                of: 'из'
            }
        }
    },
    error: {
        websocket: {
            onerror: 'Ошибка подключения к ws-серверу',
        }
    }
}
