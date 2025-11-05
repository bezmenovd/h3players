<template>
    <MainLoader v-if="loading.show" />
    <div id="app" key="app" v-if="! loading.is">
        <div id="headline">
            <div id="logo" @click="logoOnClick">H3PLAYERS</div>
        </div>
        <div id="body">
            <div id="left">
                <Navigation />
            </div>
            <div id="content">
                <Transition
                    name="route"
                    mode="out-in"
                >
                    <router-view key="$route.fullPath" />
                </Transition>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import config from './config';
import MainLoader from './components/UI/MainLoader.vue';
import Navigation from './components/Navigation.vue';
import { preload } from './modules/preload';


const logoOnClick = () => useRouter().push('/')

const loading = ref({
    is: true,
    show: true,
})

preload(config.resources.app).then(() => {
    loading.value.show = false
    loading.value.is = false
})

</script>

<style>
* { 
    font-family: "Exo 2", sans-serif; 
    font-optical-sizing: auto; 
    font-style: normal; 
}

#root {
    height: 100%;
}
#app {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: 80px 1fr;
}
#headline {
    background: #1f2334;
    padding: 20px;
}
#left {
    background: #2e3245;
    backdrop-filter: blur(1px);
}
#content {
    background: #272c3a;
    padding: 50px 80px 50px 100px;
    overflow-y: scroll;
    max-height: calc(100vh - 80px);
}
@media (max-width: 1600px) {
    #content {
        padding: 35px 30px 35px 50px;
    }
}
#body {
    display: grid;
    grid-template-columns: 200px 1fr;
}
#logo {
    color: white;
    line-height: 40px;
    font-weight: 700;
    font-size: 24px;
    cursor: pointer;
    text-shadow: 0 0 4px #ffffff;
    width: fit-content;
}
#nprogress .bar {
    background: #4c25ab;
}

::-webkit-scrollbar {
    width: 14px;
}
::-webkit-scrollbar-thumb {
    background-color: #ffffff10;
    border-right: 6px solid transparent;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    background-clip: padding-box;
}
[hint] {
    cursor: help;
    /* border-bottom: 1px dashed #dedede; */
    position: relative;
}
[hint]::after {
    content: attr(hint);
    position: absolute;
    bottom: 0;
    right: 0;
    background: #2e3245;
    z-index: 1009;
    background-color: #2e3245;
    transform: translateY(100%);
    font-size: 13px;
    text-align: left;
    white-space: nowrap;
    padding: 4px;
    color: #bcbcbc;
    opacity: 0;
    pointer-events: none;
}
[hint]:hover::after {
    opacity: 1;
    transition: opacity .1s ease-in;
    transition-delay: 1s;
}
</style>
