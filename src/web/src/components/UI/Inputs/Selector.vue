<template>
    <div class="selector" @click.stop>
        <div 
            v-for="item in items" 
            :class="`selector-item ${item.id === selected?.id ? 'selected' : ''}`" 
            @mousedown="selectItem(item)"
        >
            {{ item.text }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ListItem } from './dropdown'

const props = defineProps<{
    value: number,
    items: ListItem[],
}>()

const emit = defineEmits({
    select(item: ListItem) {}
})

const selected = ref(props.items.find(i => i.id === props.value))

const selectItem = function(item: ListItem) {
    selected.value = item
    emit('select', item)
}

</script>

<style scoped>
.selector {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}
.selector-item {
    padding: 8px 14px;
    font-size: 14px;
    line-height: 16px;
    font-size: 14px;
    background: #363a4c;
    display: flex;
    align-items: center;
    height: 100%;
}
.selector-item:hover {
    background: #ffffff10;
}
.selector-item:not(.selected):hover {
    cursor: pointer;
}
.selector-item.selected {
    background: #474c60;
}
</style>
