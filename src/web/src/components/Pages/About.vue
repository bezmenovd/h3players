<template>
    <div id="about">
        <Title :text="t('about.title')">
            <Tabs :items="tabs"/>
        </Title>
        
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Title from './../UI/Title.vue'
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();

const route = useRoute()

const tab = ref<string>('');
const tabs = [
    {
        code: '', 
        name: t('about.tabs.overview')
    }, { 
        code: 'games', 
        name: t('about.tabs.')
    }
]

watch(() => route.params.tab, (newTabCode) => {
    tab.value = newTabCode !== undefined ? String(newTabCode) : '';
}, { immediate: true });

</script>

<style scoped>
#about {
    display: grid;
    gap: 20px;
}
</style>
