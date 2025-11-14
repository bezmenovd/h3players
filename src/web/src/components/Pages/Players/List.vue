<template>
    <Panel id="players-list">
        <Table :rows="playersTable.rows" :columns="playersTable.columns"/>
    </Panel>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import Panel from '../../UI/Panel.vue'
import Table from '../../UI/Table.vue'
import { getList } from '../../../api/players'
import { Player } from '../../../api/players'
import { Column } from '../../UI/table'
import { getContentSize } from '../../../helpers/content'

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

onMounted(async () => {
    const pageSize = Math.min(Math.floor((getContentSize().height - 80) / 42), 20)

    getList(pageSize, 0).then(list => {
        playersTable.rows = list
    })
})
</script>

<style>
#players-list {
    
}
</style>
