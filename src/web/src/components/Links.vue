<template>
    <div id="links">
        <div class="links-group">
            <router-link :to="{ name: 'about' }">{{ t('links.about') }}</router-link>
            <router-link :to="{ name: 'changelog' }" id="version-value">v{{ version }}</router-link>
        </div>
        <div class="links-group">
            <router-link :to="{ name: 'user-agreement' }">{{ t('links.user_agreement') }}</router-link>
        </div>
        <div class="links-group">
            <router-link :to="{ name: 'privacy-policy' }">{{ t('links.privacy_policy') }}</router-link>
        </div>
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
#links {
    padding: 20px 20px 30px;
    display: flex;
    flex-direction: column;
    gap: 13px;
    font-variant-numeric: tabular-nums;
    opacity: .5;
    font-size: 14px;
}
.links-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

#version-value {
    width: fit-content;
}

@media (max-width: 1600px) {
    #version-value {
        font-size: 12px;
    }
}
</style>
