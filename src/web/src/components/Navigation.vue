<template>
    <div id="navigation">
        <div :class="{'link': true, 'active':  link.url === route.path }" v-for="link in links" @click="goto(link.url)">
            <img class="link-icon" :src="link.img">
            <div class="link-text">{{ link.text }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router';

const links = ref([
    {
        url: '/',
        img: '/img/lobby.png',
        text: 'Лобби'
    },
    {
        url: '/players',
        img: '/img/players.png',
        text: 'Игроки'
    },
])

const route = useRoute()
const router = useRouter()

const goto = (url) => {
    router.replace(url)
}

onMounted(async () => {
    
})
</script>

<style>
#navigation {
    padding: 20px 0;
}
.link {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 10px;
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
    font-weight: 600;
    font-size: 18px;
    color: white;
}
</style>
