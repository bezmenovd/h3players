export default {
    navigation: {
        lobby: 'Lobby',
        players: 'Gracze',
        templates: 'Szablony',
        performance: 'Obciążenie',
    },
    vaa: {
        about: 'O projekcie',
    },
    user: {
        login_btn: 'Zaloguj się przez Lobby',
        auth_modal: {
            title: 'Autoryzacja',
            info: {
                part1: 'Aby się autoryzować, musisz wysłać wiadomość z kodem na konto',
                part2: 'w Lobby',
            },
            input: 'Wprowadź swój nick w Lobby',
            no_code: 'Kod pojawi się po wprowadzeniu nicku',
            message_not_received_yet: 'Wiadomość jeszcze nie odebrana',
            lost_connection: 'Utracono połączenie z serwerem',
            code_invalidated: 'KOD ANULOWANY',
        },
        settings_modal: {
            title: 'Ustawienia',
            settings: {
                language: 'Język',
                account: {
                    text: 'Konto',
                    btn: 'Wyloguj'
                }
            }
        }
    },
    lobby: {
        title: 'Lobby',
        counters: {
            online: 'online',
            games: {
                text: 'gier',
                hint: 'Liczba gier ukończonych dzisiaj'
            },
            visitors: {
                text: 'odwiedzających',
                hint: 'Liczba użytkowników, którzy odwiedzili Lobby dzisiaj'
            },
        },
        last_games: {
            title: 'Ostatnie gry',
            hint: 'Tylko ukończone gry rankingowe'
        },
        daily_top: {
            title: 'Top dnia',
            hint: 'Wg UTC',
            by_rating: {
                title: 'Ranking',
                hint: 'Wszystkie gry'
            },
            by_rating_anti: {
                title: 'Ranking -',
                hint: 'Wszystkie gry',
            },
            by_games_count: {
                title: 'Gry',
                hint: 'Tylko gry rankingowe na losowych mapach'
            }
        }
    }
}