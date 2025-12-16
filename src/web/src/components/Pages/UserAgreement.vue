<template>
    <div id="user-agreement">
        <Title :text="t('user_agreement.title')" />
        <Markdown :source="userAgreement" class="markdown"/>
    </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings';
import ru from '../../content/user_agreement/ru.md?raw';
import en from '../../content/user_agreement/en.md?raw';
import pl from '../../content/user_agreement/pl.md?raw';
// @ts-ignore
import Markdown from 'vue3-markdown-it';
import Title from '../UI/Title.vue';
import { useI18n } from 'vue-i18n'

const settingsStore = useSettingsStore()
const { t } = useI18n()

const userAgreement = (() => {
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
#user-agreement {
    max-width: 1000px;   
}
</style>
