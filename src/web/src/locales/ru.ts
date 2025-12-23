export default {
    navigation: {
        lobby: 'Лобби',
        players: 'Игроки',
        templates: 'Шаблоны',
        performance: 'Нагрузка',
        posts: 'Обсуждения',
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
        },
        detail: {
            overview: {
                first_game: 'Первый хост',
                games_count: 'Количество игр',
                games_duration: 'Длительность',
                games_duration_avg: 'В среднем',
                players_count: 'Игроков',
                players_avg_games_count: 'В среднем игр',
                players_avg_duration: 'В среднем в играх',
            },
            tabs: {
                games: 'Игры',
                duration: 'По длительности',
                end_day: 'По длительности (в днях)',
            }
        },
        statistics: {
            title: 'Статистика',
            scenario: 'сценарий',
            default: 'по умолчанию',
        },
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
                rank: {
                    text: 'Позиция',
                    hint: 'Учитываются только игроки, сыгравшие хотя бы одну игру после 27.06.2023',
                },
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
            },
            add_modal: {
                title: 'Новая тема',
                name: 'Название',
                save: 'Создать',
                length: 'От 5 до 32 символов',
                success: 'Обсуждение добавлено',
            },
            info_modal: {
                title: 'Модерация и перевод',
            },
            all: 'Все',
            mot: 'Модерация и перевод',
        },
        discussion: {
            posts_count: 'Число постов по теме',
        },
    },
    posts: {
        filter: {
            query: 'Найти пост',
            sort: {
                items: {
                    new: 'Новые',
                    popular: 'Популярные',
                    top: 'Топовые',
                }
            }
        },
        list: {
            empty: 'Нет постов',
            loading: 'Загрузка..',
        },
        add: 'Новый пост',
        edit: {
            new_post: 'Новый пост',
            title: {
                placeholder: 'Название поста',
                requirements: 'От 5 до 32 символов',
            },
            text: {
                placeholder: 'Текст (можно использовать Markdown)',
                requirements: 'От 10 до 10000 символов',
            },
            save: 'Сохранить',
            success: 'Пост сохранен',
        },
        link_modal: {
            title: 'Переход по внешней ссылке',
            continue: 'Перейти',
        },
        hide_author: 'Скрыть пользователя',
        show_author: 'Перестать скрывать пользователя',
        no_text: 'У поста нет текста на этом языке, похоже, он еще переводится',
        report: 'Сообщить о нарушении',
        blacklist: {
            title: 'Пост скрыт'
        },
        report_modal: {
            title: 'Сообщить о нарушении',
            send: 'Отправить',
            reason: {
                placeholder: 'Причина',
                requirements: 'От 3 до 32 символов',
            },
            success: 'Сообщение о нарушении доставлено',
        },
        comments: {
            title: 'Комментарии',
            sort: {
                new: 'Новые',
                top: 'Топовые',
            },
            reply: 'Ответить',
            reply_hide: 'Скрыть',
        },
        add_comment: {
            text: {
                placeholder: 'Комментарий',
            },
            send: 'Отправить',
        },
        view: {
        },
    },
    content_loader: {
        text: 'Выполняется автоматическая премодерация',
    },
    errors: {
        fallback: 'Неизвестная ошибка',
        failed_moderation: 'Премодерация не пройдена',
        statuses: {
            500: 'При обработке запроса произошла ошибка',
            404: 'Не найдено',
            400: 'Некорректный запрос',
            429: 'Превышено ограничение по количеству запросов этого типа за период времени',
        },
        general: {
            restricted: 'Ваш аккаунт временно переведен в режим чтения',
            no_permission: 'У вас недостаточно прав для выполнения этого действия',
        },
        discussions: {
            add: {
                day_limit: 'Достигнут дневной лимит на количество созданных тем',
                duplicate: 'Тема с таким названием уже существует',
                fail: 'При создании темы произошла ошибка',
                invalid_name: 'Тема с названием такой длины/slug-ом (url) такой длины не может быть создана',
                no_permission: 'У вас недостаточно прав для создания темы',
            },
        },
        posts: {
            add: {
                day_limit: 'Достигнут дневной лимит на количество созданных постов',
                duplicate: 'Пост с таким названием уже существует',
                fail: 'При создании поста произошла ошибка',
                invalid_name: 'Пост с названием такой длины/slug-ом (url) такой длины не может быть создан',
                invalid_text: '',
                too_many_lines: 'В тексте слишком много строк (100 максимум)',
                images_not_available_yet: 'Изображения в тексте пока не реализованы',
            },
            update: {
                day_limit: 'Достигнут дневной лимит на количество созданных постов',
                duplicate: 'Пост с таким названием уже существует',
                fail: 'При создании поста произошла ошибка',
                invalid_name: 'Пост с названием такой длины/slug-ом (url) такой длины не может быть создан',
                invalid_text: '',
                too_many_lines: 'В тексте слишком много строк (100 максимум)',
                images_not_available_yet: 'Изображения в тексте пока не реализованы',
            },
            addMessage: {
                day_limit: 'Достигнут дневной лимит на количество комментариев',
                fail: 'При сохранении комментария произошла ошибка',
                invalid_text: 'Комментарий с таким текстом не может быть создан',
            }
        }
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
