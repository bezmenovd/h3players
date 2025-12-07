<template>
    <div id="navigation">
        <div :class="{'link': true, 'active': String(route.name!).startsWith(link.route.name), [link.route.name]: true }" v-for="link in links" @click="goto(link)">
            <img class="link-icon" :src="link.img">
            <div class="link-text">{{ link.text }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';

type Link = {
    route: {
        name: string
        params?: Record<string, any>
    },
    img: string
    text: string
}

const links: (Link & { style?: { [key: string]: string }})[] = [
    {
        route: { name: 'lobby' },
        img: '/img/lobby.png',
        text: 'Лобби',
    },
    {
        route: { name: 'players' },
        img: '/img/players.png',
        text: 'Игроки',
    },
    {
        route: { name: 'templates' },
        img: '/img/templates.png',
        text: 'Шаблоны',
    },
    {
        route: { name: 'performance' },
        img: '/img/performance.png',
        text: 'Нагрузка',
    },
]

const route = useRoute()
const router = useRouter()

const goto = (link: Link) => {
    router.replace(link.route)
}

onMounted(async () => {
    
})
</script>

<style scoped>
#navigation {
    padding: 20px 0;
    display: grid;
}
.link {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 6px;
    align-items: center;
    opacity: .4;
    padding: 14px 22px;
}
@media (max-width: 1600px) {
    .link {
        grid-template-columns: 26px 1fr;
        padding: 10px 16px;
    }
}
.link.active {
    opacity: 1;
    background: #ffffff1a;
}
.link:not(.active):hover {
    opacity: .75;
    cursor: pointer;
}
.link-icon {
    filter: invert(1);
    width: 23px;
    height: 24px;
}
.link-text {
    font-weight: 500;
    font-size: 18px;
    color: white;
}
@media (max-width: 1600px) {
    .link-text {
        font-size: 15px;
    }
}
.link.performance .link-icon {
    width: 20px;
    height: 20px;
    margin-left: 1px;
}
.link.templates .link-icon {
    width: 18px;
    height: 18px;
    margin-left: 2px;
}
@media (max-width: 1600px) {
    .link-icon {
        width: 17px;
        height: 17px;
    }
    .link.performance .link-icon {
        width: 14px;
        height: 14px;
    }
    .link.templates .link-icon {
        width: 13px;
        height: 13px;
    }
}
</style>
