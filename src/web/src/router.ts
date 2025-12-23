import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useNavigationStore } from './stores/navigation';
import routes from './routes';

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
    next();

    if (from.name === to.name) {
        return
    }
    
    NProgress.start();

    const navigationStore = useNavigationStore()

    if ((String(to.name) || null)?.indexOf('.') !== -1) {
        if (from.name) {
            navigationStore.push({
                name: String(from.name),
                path: from.path,
                params: from.params,
                query: from.query,
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
