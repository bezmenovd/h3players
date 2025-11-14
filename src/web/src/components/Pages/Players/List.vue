<template>
    <div id="players-list">
        <Title text="Список всех игроков"></Title>
        <Panel id="players-list-panel">
            <Table :rows="playersTable.rows" :columns="playersTable.columns" :loading="loading"/>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import Panel from '../../UI/Panel.vue'
import Table from '../../UI/Table.vue'
import Title from '../../UI/Title.vue'
import { getList } from '../../../api/players'
import { Player } from '../../../api/players'
import { Column } from '../../UI/table'
import { getContentSize } from '../../../helpers/content'
import { useNavigationStore } from '../../../stores/navigation'

const playersTable = reactive<{
    rows: Player[],
    columns: Column[],
}>({
    rows: [],
    columns: [
        new Column({
            name: 'Id',
            code: 'id',
            width: '10%',
        }),
        new Column<Player>({
            name: 'Имя',
            code: 'name',
            link: (row: Player) => ({ name: 'players.detail', params: { id: row.id } })
        }),
    ]
})

const navigationStore = useNavigationStore()

const loading = ref(true)

onMounted(async () => {
    navigationStore.setReturnPage({ name: 'players' })

    const pageSize = Math.min(Math.floor((getContentSize().height - 170) / 42), 20)

    getList(pageSize, 0).then(list => {
        playersTable.rows = list
        loading.value = false
    })
})

onUnmounted(async () => {
    navigationStore.clearReturnPage()
})

</script>

<style>
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
