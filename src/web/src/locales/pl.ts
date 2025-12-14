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
        },
        games: {
            title: 'Gry',
        }
    },
    templates: {
        list: {
            title: 'Szablony',
            query: {
                text: 'Wprowadź nazwę'
            }
        }
    },
    performance:{
        title: 'Sumaryczne Obciążenie',
    },
    players: {
        search: {
            title: 'Znajdź Gracza',
            input: {
                text: 'Wpisz Nick',
            },
            history: {
                title: 'Historia',
            },
            popular: {
                title: 'Popularni',
            }
        },
        list: {
            title: 'Wszyscy Gracze',
        },
        detail: {
            player_rank: {
                text: 'w lobby',
            },
            no_data: 'Nie znaleziono żadnej gry',
            overview: {
                games_count: 'Gry',
                games_count_wins: 'Wygrane',
                games_count_loses: 'Przegrane',
                games_count_draws: 'Remisy',
                games_count_winrate: 'Procent wygranych',
                rating: {
                    text: 'Ocena',
                    hint: 'Zmiana dziś'
                },
                rank: 'Pozycja',
                max_rating: 'Maks. ocena',
                games_duration: {
                    text: 'Czas w grach',
                    hint: 'Dziś',
                }
            },
            tabs: {
                overview: 'Główne',
                games: 'Gry',
            },
            rating_chart: {
                formatters: {
                    rating: 'pkt',
                }
            }
        }
    },
    ui: {
        table: {
            footer: {
                of: 'z'
            }
        }
    }
}