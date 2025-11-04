<template>
    <transition name="fade">
        <Loading v-if="loading" />
    </transition>
    <div id="app" key="app" v-if="! loading">
        <div id="headline">
            <div id="logo" @click="logoOnClick">H3PLAYERS</div>
        </div>
        <div id="body">
            <div id="left">
                <Navigation />
            </div>
            <div id="content">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import config from './config';
import Loading from './components/Loading.vue';
import Navigation from './components/Navigation.vue';
import { preload } from './modules/preload';


const logoOnClick = () => useRouter().push('/')

const loading = ref(true)

preload(config.resources.app).then(() => {
    loading.value = false
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>