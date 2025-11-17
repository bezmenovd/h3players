<template>
    <div id="navigation">
        <div :class="{'link': true, 'active': String(route.name!).startsWith(link.route.name) }" v-for="link in links" @click="goto(link)">
            <img class="link-icon" :src="link.img">
            <div class="link-text">{{ link.text }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router';

type Link = {
    route: {
        name: string
        params?: Record<string, any>
    },
    img: string
    text: string
}

const links: Link[] = [
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
}
.link {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 6px;
    align-items: center;
    opacity: .4;
    padding: 14px 20px;
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
</style>
