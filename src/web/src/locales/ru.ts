export default {
    navigation: {
        lobby: 'Лобби',
        players: 'Игроки',
        templates: 'Шаблоны',
        performance: 'Нагрузка',
    },
    vaa: {
        about: 'О проекте',
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
        }
    }
}
