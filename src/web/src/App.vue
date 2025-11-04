<template>
    <div id="app-wrapper">
        <div id="headline">
            <div id="logo" @click="logoOnClick"><text>H3PLAYERS</text></div>
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

<script setup>
import { useRouter } from 'vue-router';
import Navigation from './components/Navigation.vue';

const router = useRouter();

const logoOnClick = () => {
    router.push('/')
}

</script>

<style>
* { 
    font-family: "Exo 2", sans-serif; 
    font-optical-sizing: auto; 
    font-style: normal; 
}

#app {
    height: 100%;
}
#app-wrapper {
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
</style>
