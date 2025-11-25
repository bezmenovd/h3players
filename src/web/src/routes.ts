import Lobby from './components/Pages/Lobby.vue'
import Players from './components/Pages/Players.vue'
import PlayersList from './components/Pages/Players/List.vue'
import PlayersDetail from './components/Pages/Players/Detail.vue'
import Performance from './components/Pages/Performance.vue';
import Games from './components/Pages/Lobby/Games.vue';

export default [
    {
        path: '/performance',
        name: 'performance',
        component: Performance,
    },
    {
        path: '/players',
        name: 'players',
        component: Players,
    },
    {
        path: '/players/list',
        name: 'players.list',
        component: PlayersList,
    },
    {
        path: '/@:id',
        name: 'players.detail',
        component: PlayersDetail,
    },
    {
        path: '/',
        name: 'lobby',
        component: Lobby,
    },
    {
        path: '/games',
        name: 'lobby.games',
        component: Games,
    },
]
