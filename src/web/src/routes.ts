import Lobby from './components/Pages/Lobby.vue'
import PlayersSearch from './components/Pages/Players/Search.vue'
import PlayersList from './components/Pages/Players/List.vue'
import PlayersDetail from './components/Pages/Players/Detail.vue'
import TemplatesList from './components/Pages/Templates/List.vue'
import Performance from './components/Pages/Performance.vue';
import Games from './components/Pages/Lobby/Games.vue';
import NotFound from './components/Pages/NotFound.vue';
import Changelog from './components/Pages/Changelog.vue'
import About from './components/Pages/About.vue'

export default [
    {
        path: '/performance',
        name: 'performance',
        component: Performance,
    },
    {
        path: '/players',
        name: 'players',
        component: PlayersSearch,
    },
    {
        path: '/players/list',
        name: 'players.list',
        component: PlayersList,
    },
    {
        path: '/@:id/:tab?',
        name: 'players.detail',
        component: PlayersDetail,
    },
    {
        path: '/templates',
        name: 'templates',
        component: TemplatesList,
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
    { 
        path: '/changelog',
        name: 'changelog',
        component: Changelog,
    },
    { 
        path: '/about',
        name: 'about',
        component: About,
    },
    { 
        path: '/:pathMatch(.*)*',
        name: 'not_found',
        component: NotFound,
    },
]
