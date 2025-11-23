<template>
    <div class="table-wrapper">
        <template v-if="props.loading">
            <table class="table">
                <thead class="table-columns">
                    <th class="table-column" 
                        v-for="column in props.columns"
                        :style="`text-align: ${column.align}; width: ${column.width}`"
                    >
                        {{ column.name }}
                    </th>
                </thead>
            </table>
            <Loader :solid="true"/>
        </template>
        <template v-else>
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
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Column } from './table';
import Loader from './Loader.vue';

const props = defineProps<{
    rows: any[],
    columns: Column[],
    loading: boolean,
}>()

</script>

<style scoped>
.table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    border-bottom: unset;
}
.table-loading-block {
    height: 100px;
    position: relative;
}
.table-columns {
    background: #2e3245;
    border-bottom: 2px solid #2a2e40;
    height: 50px;
}
.table-column {
    padding: 15px 20px;
    color: #909090;
    height: 50px;
}
.table-cell {
    padding: 12px 20px;
    height: 50px;
}
.table-cell > .-link {
    cursor: pointer;
    text-decoration: none;
}
.table-cell > .-link:hover {
    text-decoration: underline;
}
.table-row:not(:last-of-type) {
    border-bottom: 1px solid #00000014;
}
.table-row:hover {
    background: #363a4c;
}
</style>
