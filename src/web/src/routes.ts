import Lobby from './components/Pages/Lobby.vue'
import PlayersSearch from './components/Pages/Players/Search.vue'
import PlayersList from './components/Pages/Players/List.vue'
import PlayersDetail from './components/Pages/Players/Detail.vue'
import TemplatesList from './components/Pages/Templates/List.vue'
import TemplatesDetail from './components/Pages/Templates/Detail.vue'
import TemplatesStatistics from './components/Pages/Templates/Statistics.vue'
import Games from './components/Pages/Lobby/Games.vue';
import NotFound from './components/Pages/NotFound.vue';
import Changelog from './components/Pages/Changelog.vue'
import About from './components/Pages/About.vue'
import PostList from './components/Pages/Posts/List.vue'
import PostView from './components/Pages/Posts/View.vue'
import PostEdit from './components/Pages/Posts/Edit.vue'
import PrivacyPolicy from './components/Pages/PrivacyPolicy.vue'
import UserAgreement from './components/Pages/UserAgreement.vue'

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
        path: '/templates/statistics',
        name: 'templates.statistics',
        component: TemplatesStatistics,
    },
    {
        path: '/templates/:id/:tab?',
        name: 'templates.detail',
        component: TemplatesDetail,
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
        path: '/about/:tab?',
        name: 'about',
        component: About,
    },
    {
        path: '/posts/edit/:id?',
        name: 'posts.edit',
        component: PostEdit,
    },
    {
        path: '/posts/@:slug',
        name: 'posts.view',
        component: PostView,
    },
    {
        path: '/posts/:discussion_id?',
        name: 'posts',
        component: PostList,
    },
    {
        path: '/privacy-policy',
        name: 'privacy-policy',
        component: PrivacyPolicy,
    },
    {
        path: '/user-agreement',
        name: 'user-agreement',
        component: UserAgreement,
    },
    { 
        path: '/:pathMatch(.*)*',
        name: 'not_found',
        component: NotFound,
    },
]
