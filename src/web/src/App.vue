<template>
    <MainLoader v-if="loading.show" />
    <div id="app" key="app" v-if="! loading.is">
        <div id="left">
            <Navigation />
        </div>
        <div id="content">
            <Return />
            <Transition
                name="route"
                mode="out-in"
            >
                <router-view key="$route.fullPath" />
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import config from './config';
import MainLoader from './components/UI/MainLoader.vue';
import Navigation from './components/Navigation.vue';
import Return from './components/Return.vue';
import { preload } from './modules/preload';


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

input {
    background: #272c3a;
    padding: 12px 10px;
    outline: none;
    border: none;
    font-size: 17px;
    line-height: 21px;
    border: 1px solid #1f2334;
}
input:focus::placeholder {
    color: transparent;
}
input:disabled {
    background: #363c4b;
}

a {
    max-width: 100%;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none !important;
    white-space: nowrap;
}
a:hover {
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.726) inset;
}

::selection {
    background: #ffffff1a;
}

#root {
    height: 100%;
}
#app {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 200px 1fr;
}
#left {
    background: #2e3245;
    backdrop-filter: blur(1px);
}
#content {
    background: #272c3a;
    padding: 40px 80px 55px 100px;
    overflow-y: scroll;
    max-height: 100%;
    position: relative;
}
@media (max-width: 1600px) {
    #content {
        padding: 30px 30px 40px 50px;
    }
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
    right: -40px;
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
.updating {
    position: relative;
}
.updating::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: black;
    opacity: .03;
    z-index: 999;
}
</style>
