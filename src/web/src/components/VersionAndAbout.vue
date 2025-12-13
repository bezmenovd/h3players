<template>
    <div id="version-and-about">
        <router-link :to="{ name: 'changelog' }" id="version-value">v{{ version }}</router-link>
        <router-link :to="{ name: 'about' }" id="version-value">{{ t('vaa.about') }}</router-link>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import changelog from '../meta/changelog/ru.json';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const version = computed<string>(() => {
    return changelog[0].version
})

</script>

<style scoped>
#version-and-about {
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
