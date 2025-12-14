<template>
    <div class="list" @click.stop>
        <div class="list-value" @click="focus.is ? focus.blur() : focus.focus()">{{ selected?.text }}</div>
        <div class="list-items" v-show="focus.is">
            <div 
                v-for="item in items" 
                :class="`list-item ${item.id === selected?.id ? 'selected' : ''}`" 
                @click="selectItem(item)"
            >
                {{ item.text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ListItem } from './dropdown'

const props = defineProps<{
    value: number,
    items: ListItem[],
}>()

const emit = defineEmits({
    select(item: ListItem) {}
})

const focus = reactive({
    is: false,
    focus() {
        this.is = true
    },
    blur() {
        setTimeout(() => { this.is = false }, 50)
    }
})

const selected = ref(props.items.find(i => i.id === props.value))

const selectItem = function(item: ListItem) {
    selected.value = item
    focus.blur()
    emit('select', item)
}

let clickHandler = () => {
    focus.blur()
}

onMounted(() => {
    window.addEventListener('click', clickHandler)
})

onBeforeUnmount(() => {
    window.removeEventListener('click', clickHandler)
})

</script>

<style scoped>
.list-value {
    height: fit-content;
    width: 100%;
}
.list-value {
    background: #ffffff10;
    padding: 8px 10px;
    border: none;
    font-size: 14px;
    outline: 1px solid #1f2334;
    cursor: pointer;
    height: 32px;
    line-height: 16px;
}
.list {
    position: relative;
    width: 100%;
}
.list-items {
    position: absolute;
    top: calc(100% + 1px);
    width: 100%;
    background: #272c3a;
    z-index: 99999;
}
.list-item {
    padding: 8px 10px;
    font-size: 14px;
    border-bottom: 1px solid #272c3a;
}
.list-item:hover {
    background: #363a4c;
}
.list-item:not(.selected):hover {
    cursor: pointer;
}
.list-item.selected {
    background: #363a4c;
}
</style>
