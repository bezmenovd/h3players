<template>
    <div id="templates-detail">
        <Title :text="template.name"></Title>
        <template v-if="loading">
            <Loader :solid="false" />
        </template>
        <template v-else>
            <Panel>
                123
            </Panel>
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import Title from '../../UI/Title.vue';
import { useRoute } from 'vue-router';
import { getTemplate, Template } from '../../../api/templates';
import { alerts } from '../../UI/alerts';
import { useI18n } from 'vue-i18n';
import router from '../../../router';
import { ref } from 'vue';
import Loader from '../../UI/Loader.vue';
import Panel from '../../UI/Panel.vue';

const route = useRoute()
const { t } = useI18n()

const template = reactive<{
    id: number,
    name: string,
    versions: Template[]
}>({
    id: Number(route.params.id),
    name: '',
    versions: []
})

const loading = ref(true)

onMounted(() => {
    getTemplate(template.id).then(r => {
        template.name = r.template.name
        template.versions = r.versions
        loading.value = false
    }).catch(err => {
        alerts.send('error', t('errors.' + err.status))
        router.push({ name: 'templates' })
    })
})

</script>

<style scoped>

</style>
