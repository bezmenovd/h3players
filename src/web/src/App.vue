<template>
    <MainLoader v-if="loading.show" :loaded="loading.counter" :total="resources.app.length"/>
    <div id="app" key="app" v-if="! loading.is" :class="route.name">
        <div id="left">
            <div id="logo" @click="router.replace({ name: 'lobby' })"/>
            <Navigation />
            <User />
            <Links />
        </div>
        <div id="content">
            <Return />
            <router-view :key="String($route.name) + String($route.params.id)"/>
        </div>

        <Alerts />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import resources from './content/resources';
import MainLoader from './components/UI/MainLoader.vue';
import Navigation from './components/Navigation.vue';
import User from './components/User.vue';
import Return from './components/Return.vue';
import { preload } from './modules/preload';
import Links from './components/Links.vue';
import router from './router';
import Alerts from './components/UI/Alerts.vue';
import { connect } from './modules/websocket';
import { useUserStore } from './stores/user';
import { useRoute } from 'vue-router';


const loading = ref({
    counter: 0,
    is: true,
    show: true,
})

const userStore = useUserStore()

const route = useRoute()

preload(resources.app, () => loading.value.counter++).then(() => {
    if (userStore.token) {
        userStore.load()
    }
    connect()
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
    padding: 8px 10px;
    outline: none;
    border: none;
    font-size: 16px;
    line-height: 21px;
    /* border: 1px solid #1f2334; */
}
input:focus::placeholder {
    color: transparent;
}
input:disabled {
    background: #363c4b;
}

textarea {
    background: #272c3a;
    padding: 8px 10px;
    outline: none;
    border: none;
    font-size: 16px;
    line-height: 21px;
    /* border: 1px solid #1f2334; */
}
textarea:focus::placeholder {
    color: transparent;
}
textarea:disabled {
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
    grid-template-columns: 250px 1fr;
}
@media (max-width: 1600px) {
    #app {
        grid-template-columns: 200px 1fr;
    }
}
#left {
    background: #2e3245;
    backdrop-filter: blur(1px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
#content {
    background: #272c3a;
    padding: 40px 80px 55px 100px;
    overflow-y: scroll;
    scroll-behavior: smooth;
    scrollbar-gutter: stable;
    max-height: 100%;
    position: relative;
}
@media (max-width: 1600px) {
    #content {
        padding: 30px 30px 40px 50px;
    }
}
#logo {
    width: 100%;
    height: 80px;
    margin: 15px 0 5px;
    background: url('/img/logo_full.png');
    background-position: 40% 50%;
    background-repeat: no-repeat;
    background-size: 55%;
    opacity: .5;
    cursor: pointer;
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
.btn {
    padding: 6px 12px 6px 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    background: #ffffff10;
    position: relative;
}
.btn:not(.disabled):not(.waiting):hover {
    cursor: pointer;
    background: #ffffff1f;
}
.btn:not(.disabled):not(.waiting):active {
    cursor: pointer;
    background: #ffffff2f;
}
.btn.waiting {
    opacity: .7;
}
.btn.disabled {
    opacity: .5;
}
.btn.disabled::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.001);
    z-index: 99999;
}
.btn.disabled:hover {
    cursor: not-allowed !important;
}
.btn.waiting:hover {
    cursor: wait !important;
}
.btn-icon {
    width: 20px;
    height: 20px;
    background-size: 12px 12px;
    background-position: 50% 50%;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .5;
}
.markdown {
    display: flex;
    flex-direction: column;
    gap: 12px;
    opacity: .8;
}
.markdown strong {
    font-weight: 600;
}
.markdown ul {
    padding-left: 20px;
}
.markdown ol {
    padding-left: 20px;
}
.markdown li {
    padding-bottom: 4px;
}
.markdown table {
    border: 1px solid #ffffff6b;
    border-collapse: collapse;
    border-spacing: 0;
}
.markdown thead {
    border-bottom: 1px solid #ffffff6b;
}
.markdown tbody tr:hover {
    background: #ffffff1c;
}
.markdown th {
    padding: 8px 10px;
    text-align: left;
}
.markdown td {
    padding: 8px 10px;
    text-align: left;
}
.markdown p {
    line-height: 22px;
}
.markdown h1, .markdown h2, .markdown h3, .markdown h4 {
    margin-top: 10px;
    font-weight: 500;
}
.markdown p a {
    display: inline;
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.3) inset;
}
.markdown p a:hover {
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.726) inset;
}
.markdown pre {
    background: #1a1e27;
    padding: 5px;
}
.markdown pre * {
    font-family: monospace !important;
}
.markdown pre code {
    word-wrap: normal;
    max-width: 100%;
    width: 100%;
    display: block;
    overflow-x: auto;
}
.markdown hr {
    opacity: .2;
}
.markdown code {
    background: #1a1e27;
    padding: 0 4px;
    user-select: all;
}
</style>
