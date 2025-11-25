<template>
    <div id="templates-list">
        <Title text="Все шаблоны"></Title>
        <Panel id="templates-list-panel">
            <Header></Header>
            <Loader v-if="loading" :solid="true" />
            <TemplatesList :items="templates.list.items" :class="{'updating': updating}"/>
            <Footer :total="templates.list.total" :limit="templates.list.limit"></Footer>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Panel from '../../UI/Panel.vue'
import Title from '../../UI/Title.vue'
import Footer from '../../UI/Table/Footer.vue';
import Header from '../../UI/Table/Header.vue';
import { getList, Template } from '../../../api/templates'
import { getContentSize } from '../../../helpers/content'
import { Paginated } from '../../../api/general';
import { useRoute } from 'vue-router';
import { on } from '../../../modules/websocket';
import TemplatesList from '../../UI/Templates/List/TemplatesList.vue';

const templates = reactive<{
    list: Paginated<Template>,
}>({
    list: {
        items: [],
        total: 0,
        limit: 0,
        offset: 0,
    },
})

const pageSize = ref(0)
const loading = ref(true)
const updating = ref(false)

const route = useRoute()

const load = () => {
    const offset = Number(route.query.offset) || 0
    updating.value = true

    getList(pageSize.value, offset).then(r => {
        templates.list = r
        updating.value = false

        if (loading.value) {
            loading.value = false
        }
    })
}

onMounted(async () => {
    pageSize.value = Math.min(Math.floor((getContentSize().height - 150) / 50), 20)

    watch(() => route.query.offset, load, { immediate: true })

    onBeforeUnmount(on('data.templates-update', load))
})

</script>

<style scoped>
#players-list {
    display: grid;
    grid-template-rows: 50px 1fr;
}

@media (max-width: 1600px) {
    #players-list {
        grid-template-rows: 40px 1fr;
        grid-gap: 14px;
    }
}
</style>
