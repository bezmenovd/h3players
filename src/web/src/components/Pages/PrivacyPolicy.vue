<template>
    <div id="privacy-policy">
        <Title :text="t('privacy_policy.title')" />
        <Markdown :source="privacyPolicy" class="markdown"/>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings';
import ru from '../../content/privacy_policy/ru.md?raw';
import en from '../../content/privacy_policy/en.md?raw';
import pl from '../../content/privacy_policy/pl.md?raw';
// @ts-ignore
import Markdown from 'vue3-markdown-it';
import Title from '../UI/Title.vue';
import { useI18n } from 'vue-i18n'

const settingsStore = useSettingsStore()
const { t } = useI18n()

const privacyPolicy = (() => {
    if (settingsStore.language === 1) {
        return ru
    }
    if (settingsStore.language === 3) {
        return pl
    }
    return en
})()

</script>

<style scoped>
#privacy-policy {
    max-width: 1000px;   
}
</style>
