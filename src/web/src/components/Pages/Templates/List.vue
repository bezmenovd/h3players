<template>
    <div id="templates-list">
        <Title text="Шаблоны"></Title>
        <Panel id="templates-list-panel">
            <Header>
                <!-- <input 
                    id="filter-query" 
                    type="text" 
                    v-model="query" 
                    spellcheck="false" 
                    autocomplete="one-time-code" 
                    placeholder="Введите название"
                    @keyup="updateOnQuery"
                /> -->
                <Query 
                    v-model="query"
                    width="300px"
                    :maxlength="30" 
                    placeholder="Введите название" 
                    @change="queryOnChange"/>
            </Header>
            <Loader v-if="loading" :solid="true" />
            <TemplatesList :items="templates.list.items" :class="{'updating': updating}" v-else/>
            <Footer :total="templates.list.total" :limit="templates.list.limit"></Footer>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Panel from '../../UI/Panel.vue'
import Title from '../../UI/Title.vue'
import Footer from '../../UI/Table/Footer.vue';
import Header from '../../UI/Table/Header.vue';
import Query from '../../UI/Inputs/Query.vue';
import { getList, TemplateWithInfo } from '../../../api/templates'
import { getContentSize } from '../../../helpers/content'
import { PaginatedTable } from '../../../api/general';
import { useRoute } from 'vue-router';
import { on } from '../../../modules/websocket';
import TemplatesList from '../../UI/Templates/List/TemplatesList.vue';
import router from '../../../router';
import { debounce, throttle } from '../../../helpers/functions';
import Loader from '../../UI/Loader.vue';

const route = useRoute()

const templates = reactive<{
    list: PaginatedTable<TemplateWithInfo>,
}>({
    list: {
        items: [],
        total: 0,
        limit: 0,
    },
})

const query = computed<string>(() => {
    return route.params.query !== undefined ? String(route.params.query) : ''
})
const offset = computed<number>(() => {
    const v = Number(route.query.offset)
    return Number.isFinite(v) && v >= 0 ? v : 0
})

const queryOnChange = throttle((event: { value: string }) => {
    router.replace({
        query: {
            ...route.query, 
            query: event.value,
        },
    })
}, 500)


const pageSize = ref(0)
const loading = ref(true)
const updating = ref(false)

const load = () => {
    updating.value = true

    getList(pageSize.value, offset.value, [], query.value).then(r => {
        templates.list = r
        updating.value = false

        if (loading.value) {
            loading.value = false
        }
    })
}

onMounted(async () => {
    pageSize.value = Math.min(Math.floor((getContentSize().height - 170) / 50), 20)

    document.getElementById("filter-query")?.focus()

    watch(() => route.query, load, { immediate: true })

    onBeforeUnmount(on('data.templates.update', load))
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

#filter-query {
    height: 100%;
}
</style>
