<template>
    <div id="version">
        <router-link to="changelog" id="version-value">v{{ version }}</router-link>
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
#version {
    padding: 20px;
    display: grid;
}
#version-value {
    font-variant-numeric: tabular-nums;
    opacity: .5;
    font-size: 14px;
    width: fit-content;
}
</style>
