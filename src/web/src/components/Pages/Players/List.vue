<template>
    <div id="players-list">
        <Title text="Все игроки"></Title>
        <Panel id="players-list-panel">
            <Header></Header>
            <Loader v-if="loading" :solid="true" />
            <PlayersList :items="players.list.items" :class="{'updating': updating}"/>
            <Footer :total="players.list.total" :limit="players.list.limit"></Footer>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Panel from '../../UI/Panel.vue'
import Title from '../../UI/Title.vue'
import Footer from '../../UI/Table/Footer.vue';
import Header from '../../UI/Table/Header.vue';
import { getList } from '../../../api/players'
import { Player } from '../../../api/players'
import { getContentSize } from '../../../helpers/content'
import { PaginatedTable } from '../../../api/general';
import { useRoute } from 'vue-router';
import { on } from '../../../modules/websocket';
import PlayersList from '../../UI/Players/List/PlayersList.vue';

const players = reactive<{
    list: PaginatedTable<Player>,
}>({
    list: {
        items: [],
        total: 0,
        limit: 0,
    },
})

const pageSize = ref(0)
const loading = ref(true)
const updating = ref(false)

const route = useRoute()

const listOffset = computed<number>(() => {
    const v = Number(route.query.offset)
    return Number.isFinite(v) && v >= 0 ? v : 0
})

const load = (visible: boolean = true) => {
    const offset = listOffset.value
    if (visible) {
        updating.value = true
    }

    getList(pageSize.value, offset).then(r => {
        players.list = r
        if (visible) {
            updating.value = false
        }

        if (loading.value) {
            loading.value = false
        }
    })
}

onMounted(async () => {
    pageSize.value = Math.min(Math.floor((getContentSize().height - 170) / 50), 20)

    watch(() => route.query.offset, () => { load(true) }, { immediate: true })

    onBeforeUnmount(on('data.players.update', () => { load(false) }).unsubscribe)
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
