import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Import the default CSS
import Lobby from './components/Pages/Lobby.vue'
import Players from './components/Pages/Players.vue'
import PlayersList from './components/Pages/Players/List.vue'
import PlayersDetail from './components/Pages/Players/Detail.vue'

const routes = [
    {
        path: '/',
        name: 'lobby',
        component: Lobby
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
        path: '/player/:id',
        name: 'players.detail',
        component: PlayersDetail
    }
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
});

router.afterEach(() => {
    NProgress.done();
});

export default router
