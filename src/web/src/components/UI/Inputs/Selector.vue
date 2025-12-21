<template>
    <div class="selector" @click.stop>
        <div 
            v-for="item in items" 
            :class="`selector-item ${item.code === selected?.code ? 'selected' : ''}`" 
            @mousedown="selectItem(item)"
        >
            {{ item.text }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { SelectorItem } from './selector';

const modelValue = defineModel<string>({ default: '' })

const props = defineProps<{
    items: SelectorItem[],
}>()

const selected = computed<SelectorItem|undefined>(() => {
    return props.items.find(i => i.code === modelValue.value)
})

const selectItem = function(item: SelectorItem) {
    modelValue.value = item.code
}

</script>

<style scoped>
.selector {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 1px;
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
