import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Import the default CSS
import Lobby from './components/Pages/Lobby.vue'
import Players from './components/Pages/Players.vue'
import PlayersList from './components/Pages/Players/List.vue'
import PlayersDetail from './components/Pages/Players/Detail.vue'
import Performance from './components/Pages/Performance.vue';
import Games from './components/Pages/Lobby/Games.vue';
import { useNavigationStore } from './stores/navigation';

const routes = [
    {
        path: '/performance',
        name: 'performance',
        component: Performance
    },
    {
        path: '/players',
        name: 'players',
        component: Players
    },
    {
        path: '/players/list',
        name: 'players.list',
        component: PlayersList,
    },
    {
        path: '/@:id',
        name: 'players.detail',
        component: PlayersDetail
    },
    {
        path: '/',
        name: 'lobby',
        component: Lobby
    },
    {
        path: '/games',
        name: 'lobby.games',
        component: Games
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

NProgress.configure({
    showSpinner: false,
})

router.beforeEach((to, from, next) => {
    NProgress.start();
    next();

    const navigationStore = useNavigationStore()

    if ((String(to.name) || null)?.indexOf('.') !== -1) {
        if ((String(from.name) || null)?.indexOf('.') !== -1) {
            navigationStore.push({
                name: String(from.name),
                path: from.path,
                params: from.params,
            })
        } else {
            let parentName = String(to.name).split('.').slice(0, -1).join('.')
            let parent = routes.find(r => r.name === parentName)
    
            if (parent) {
                navigationStore.push(parent)
            }
        }
    } else {
        navigationStore.clear()
    }
});

router.afterEach(() => {
    NProgress.done();
});

export default router
