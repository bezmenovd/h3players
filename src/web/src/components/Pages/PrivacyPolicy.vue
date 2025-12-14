<template>
    <div id="privacy-policy">
        <Title :text="t('privacy_policy.title')" />
        <Markdown :source="privacyPolicy" class="markdown"/>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings';
import ru from '../../meta/privacy_policy/ru.md?raw';
import en from '../../meta/privacy_policy/en.md?raw';
import pl from '../../meta/privacy_policy/pl.md?raw';
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
    if (settingsStore.language === 2) {
        return en
    }
    if (settingsStore.language === 3) {
        return pl
    }
    throw new Error('unknown language')
})()

</script>

<style scoped>
#privacy-policy {
    max-width: 1000px;   
}
</style>
