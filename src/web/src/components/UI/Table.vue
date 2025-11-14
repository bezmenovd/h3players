<template>
    <table class="table">
        <thead class="table-columns">
            <th class="table-column" 
                v-for="column in props.columns"
                :style="`text-align: ${column.align}; width: ${column.width}`"
            >
                {{ column.name }}
            </th>
        </thead>
        <tbody class="table-rows">
            <tr class="table-row" v-for="row in props.rows">
                <td class="table-cell" 
                    v-for="column in props.columns"
                    :style="`text-align: ${column.align};`"
                >
                    <template v-if="column.link">
                        <router-link class="-link" :to="column.link!(row)">
                            {{ row[column.code] }}
                        </router-link>
                    </template>
                    <template v-else>
                        {{ row[column.code] }}
                    </template>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Column } from './table';

const props = defineProps<{
    rows: any[],
    columns: Column[],
}>()

</script>

<style scoped>
.table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
}
.table-columns {
    background: #2e3245;
    border-bottom: 2px solid #2a2e40;
}
.table-column {
    padding: 16px 20px;
    color: #909090;
}
.table-cell {
    padding: 12px 20px;
}
.table-cell > .-link {
    cursor: pointer;
    font-weight: bold;
    text-decoration: none;
}
.table-cell > .-link:hover {
    text-decoration: underline;
}
.table-row {
    border-bottom: 1px solid #00000014;
}
.table-row:hover {
    background: #363a4c;
}
</style>
