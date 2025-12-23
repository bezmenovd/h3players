export default {
    navigation: {
        lobby: 'Lobby',
        players: 'Gracze',
        templates: 'Szablony',
        performance: 'Obciążenie',
        posts: 'Dyskusje',
    },
    links: {
        about: 'O projekcie',
        privacy_policy: 'Polityka prywatności',
        user_agreement: 'Regulamin użytkownika',
    },
    user: {
        login_btn: 'Zaloguj się przez lobby',
        auth_modal: {
            title: 'Autoryzacja',
            info: {
                part1: 'Aby się autoryzować, wyślij wiadomość z kodem do konta',
                part2: 'w lobby',
            },
            input: 'Wpisz swój nick w lobby',
            no_code: 'Kod pojawi się po wpisaniu nicku',
            message_not_received_yet: 'Wiadomość nie została jeszcze odebrana',
            lost_connection: 'Połączenie z serwerem przerwane',
            code_invalidated: 'KOD UNIEWAŻNIONY',
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
                hint: 'Liczba gier zakończonych dzisiaj'
            },
            visitors: {
                text: 'odwiedzających',
                hint: 'Liczba użytkowników, którzy odwiedzili lobby dzisiaj'
            },
        },
        last_games: {
            title: 'Ostatnie gry',
            hint: 'Tylko zakończone gry rankingowe'
        },
        daily_top: {
            title: 'Top dnia',
            hint: 'Według UTC',
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
                text: 'Wpisz nazwę'
            }
        },
        detail: {
            overview: {
                first_game: 'Pierwszy host',
                games_count: 'Liczba gier',
                games_duration: 'Czas trwania',
                games_duration_avg: 'Średnio',
                players_count: 'Graczy',
                players_avg_games_count: 'Średnio gier na gracza',
                players_avg_duration: 'Średni czas w grach',
            },
            tabs: {
                games: 'Gry',
                duration: 'Według czasu trwania',
                end_day: 'Według czasu (dni)',
            }
        },
        statistics: {
            title: 'Statystyki',
            scenario: 'scenariusz',
            default: 'domyślny',
        },
        posts: {
            title: 'Dyskusja o szablonie',
        },
    },
    performance:{
        title: 'Całkowite obciążenie',
    },
    players: {
        search: {
            title: 'Znajdź gracza',
            input: {
                text: 'Wpisz nick',
            },
            history: {
                title: 'Historia',
            },
            popular: {
                title: 'Popularne',
            }
        },
        list: {
            title: 'Wszyscy gracze',
        },
        detail: {
            player_rank: {
                text: 'w lobby',
            },
            no_data: 'Nie znaleziono żadnych gier',
            overview: {
                games_count: 'Gier',
                games_count_wins: 'Wygranych',
                games_count_loses: 'Przegranych',
                games_count_draws: 'Remisów',
                games_count_winrate: 'Procent zwycięstw',
                rating: {
                    text: 'Ranking',
                    hint: 'Zmiana dzisiaj'
                },
                rank: {
                    text: 'Pozycja',
                    hint: 'Uwzględniani są tylko gracze, którzy rozegrali co najmniej jedną grę po 27.06.2023',
                },
                max_rating: 'Maks. ranking',
                games_duration: {
                    text: 'Czas w grach',
                    hint: 'Dzisiaj',
                }
            },
            tabs: {
                overview: 'Podstawowe',
                games: 'Gry',
            },
            rating_chart: {
                formatters: {
                    rating: 'pts',
                }
            }
        }
    },
    about: {
        title: 'O projekcie',
        tabs: {
            overview: 'Ogólne',
            load: 'Obciążenie',
            api: 'API'
        },
        load: {
            total: {
                title: 'Całkowite obciążenie'
            }
        },
        api: {
            authorization: {
                text: 'Autoryzacja zapytań odbywa się poprzez nagłówek „Token”. Token jest wydawany przy autoryzacji przez lobby i można go znaleźć w localStorage'
            }
        }
    },
    privacy_policy: {
        title: 'Polityka prywatności',
    },
    user_agreement: {
        title: 'Regulamin użytkownika',
    },
    discussions: {
        list: {
            title: 'Dyskusje',
            add: {
                text: 'Nowy temat',
            },
            add_modal: {
                title: 'Nowy temat',
                name: 'Nazwa',
                save: 'Utwórz',
                length: 'Od 5 do 32 znaków',
                success: 'Dyskusja dodana',
            },
            info_modal: {
                title: 'Moderacja i tłumaczenie',
            },
            all: 'Wszystkie',
            mot: 'Moderacja i tłumaczenie',
        },
        discussion: {
            posts_count: 'Liczba postów w temacie',
        },
    },
    posts: {
        filter: {
            query: 'Znajdź post',
            sort: {
                items: {
                    new: 'Nowe',
                    popular: 'Popularne',
                    top: 'Najlepsze',
                }
            }
        },
        list: {
            empty: 'Brak postów',
            loading: 'Ładowanie..',
        },
        add: 'Nowy post',
        edit: {
            new_post: 'Nowy post',
            title: {
                placeholder: 'Tytuł posta',
                requirements: 'Od 5 do 32 znaków',
            },
            text: {
                placeholder: 'Tekst (można używać Markdown)',
                requirements: 'Od 10 do 10000 znaków',
            },
            save: 'Zapisz',
            success: 'Post zapisany',
        },
        link_modal: {
            title: 'Przekierowanie do linku zewnętrznego',
            continue: 'Kontynuuj',
        },
        hide_author: 'Ukryj autora',
        show_author: 'Przestań ukrywać autora',
        no_text: 'Post nie posiada tekstu w tym języku, prawdopodobnie jest jeszcze w trakcie tłumaczenia',
        report: 'Zgłoś naruszenie',
        blacklist: {
            title: 'Post ukryty'
        },
        report_modal: {
            title: 'Zgłoś naruszenie',
            send: 'Wyślij',
            reason: {
                placeholder: 'Powód',
                requirements: 'Od 3 do 32 znaków',
            },
            success: 'Zgłoszenie naruszenia dostarczone',
        },
        comments: {
            title: 'Komentarze',
            sort: {
                new: 'Nowe',
                top: 'Najlepsze',
            },
            reply: 'Odpowiedz',
            reply_hide: 'Ukryj',
        },
        add_comment: {
            text: {
                placeholder: 'Komentarz',
            },
            send: 'Wyślij',
        },
        view: {
        },
    },
    content_loader: {
        text: 'Trwa automatyczna premoderacja',
    },
    errors: {
        fallback: 'Nieznany błąd',
        failed_moderation: 'Premoderacja nie powiodła się',
        statuses: {
            404: 'Nie znaleziono',
            400: 'Błędne zapytanie',
            401: 'Brak autoryzacji',
            429: 'Przekroczono limit zapytań dla tego okresu',
            500: 'Błąd wewnętrzny serwera',
        },
        general: {
            restricted: 'Twoje konto jest tymczasowo w trybie tylko do odczytu',
            no_permission: 'Nie masz uprawnień do wykonania tej akcji',
        },
        discussions: {
            add: {
                day_limit: 'Osiągnięto dzienny limit utworzonych tematów',
                duplicate: 'Temat o takiej nazwie już istnieje',
                fail: 'Błąd podczas tworzenia tematu',
                invalid_name: 'Temat o takiej długości nazwy/slug-a nie może zostać utworzony',
                no_permission: 'Nie masz uprawnień do tworzenia tematów',
            },
        },
        posts: {
            add: {
                day_limit: 'Osiągnięto dzienny limit utworzonych postów',
                duplicate: 'Post o takiej nazwie już istnieje',
                fail: 'Błąd podczas tworzenia posta',
                invalid_name: 'Post o takiej długości nazwy/slug-a nie może zostać utworzony',
                invalid_text: '',
                too_many_lines: 'Zbyt wiele linii tekstu (maksymalnie 100)',
                images_not_available_yet: 'Obrazy w tekście nie są jeszcze zaimplementowane',
            },
            update: {
                day_limit: 'Osiągnięto dzienny limit utworzonych postów',
                duplicate: 'Post o takiej nazwie już istnieje',
                fail: 'Błąd podczas zapisywania posta',
                invalid_name: 'Post o takiej długości nazwy/slug-a nie może zostać utworzony',
                invalid_text: '',
                too_many_lines: 'Zbyt wiele linii tekstu (maksymalnie 100)',
                images_not_available_yet: 'Obrazy w tekście nie są jeszcze zaimplementowane',
            },
            addMessage: {
                day_limit: 'Osiągnięto dzienny limit komentarzy',
                fail: 'Błąd podczas zapisywania komentarza',
                invalid_text: 'Komentarz z takim tekstem nie może zostać utworzony',
            }
        }
    },
    ui: {
        table: {
            footer: {
                of: 'z'
            }
        }
    },
    error: {
        websocket: {
            onerror: 'Błąd połączenia z serwerem WS',
        }
    }
}