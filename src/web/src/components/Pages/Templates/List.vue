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
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Panel from '../../UI/Panel.vue'
import Title from '../../UI/Title.vue'
import Footer from '../../UI/Table/Footer.vue';
import Header from '../../UI/Table/Header.vue';
import Query from '../../UI/Inputs/Query.vue';
import { getList, TemplateWithInfo } from '../../../api/templates'
import { getContentSize } from '../../../helpers/content'
import { Paginated } from '../../../api/general';
import { useRoute } from 'vue-router';
import { on } from '../../../modules/websocket';
import TemplatesList from '../../UI/Templates/List/TemplatesList.vue';
import router from '../../../router';
import { debounce, throttle } from '../../../helpers/functions';
import Loader from '../../UI/Loader.vue';

const route = useRoute()

const templates = reactive<{
    list: Paginated<TemplateWithInfo>,
}>({
    list: {
        items: [],
        total: 0,
        limit: 0,
        offset: 0,
    },
})

const query = ref(route.query.query ? String(route.query.query) : '')

const queryOnChange = throttle((event: { value: string }) => {
    router.replace({
        query: {
            ...route.query, 
            query: event.value,
            offset: event.value.length > 0 ? 0 : route.query.offset,
        }
    })
}, 500)


const pageSize = ref(0)
const loading = ref(true)
const updating = ref(false)

const load = () => {
    const query = route.query.query ? String(route.query.query) : ''
    const offset = Number(route.query.offset) || 0

    updating.value = true

    getList(pageSize.value, offset, [], query).then(r => {
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
