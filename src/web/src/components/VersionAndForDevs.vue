<template>
    <div id="version-and-api">
        <router-link :to="{ name: 'changelog' }" id="version-value">v{{ version }}</router-link>
        <router-link :to="{ name: 'for-devs' }" id="version-value">Разработчикам</router-link>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import changelog from '../meta/changelog.json';

const version = computed<string>(() => {
    return changelog[0].version
})

</script>

<style scoped>
#version-and-api {
    padding: 20px 20px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
#version-value {
    font-variant-numeric: tabular-nums;
    opacity: .5;
    font-size: 14px;
    width: fit-content;
}

@media (max-width: 1600px) {
    #version-value {
        font-size: 12px;
    }
}
</style>
