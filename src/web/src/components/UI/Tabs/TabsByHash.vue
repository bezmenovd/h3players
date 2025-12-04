<template>
    <div class="tabs">
        <div class="tab" v-for="tab in props.items" @click="select(tab.code)" :class="{'active': activeTabCode === tab.code}">
            {{ tab.name }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue'
import router from '../../../router';
import { useRoute } from 'vue-router';

const route = useRoute()

const props = defineProps<{
    items: {
        code: string,
        name: string,
    }[]
}>()

const activeTabCode = ref<string>('');

watch(() => route.hash, () => {
    const hash = route.hash.slice(1);
    
    if (props.items.some(item => item.code === hash)) {
        activeTabCode.value = hash;
    } else if (props.items.length > 0) {
        const defaultCode = props.items[0].code;
        select(defaultCode);
    }
}, { immediate: true });

const select = (code: string) => {
    if (activeTabCode.value !== code) {
        router.push({ 
            path: route.path,
            query: route.query,
            hash: code ? `#${code}` : ''
        });
    }
}

</script>

<style>
.tabs {
    display: flex;
    background: #2e3245;
    gap: 1px;
    padding: 0 1px;
    height: 70px;
}
.tab {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #272c3a;
    font-size: 17px;
    font-weight: 500;
    color: #82848f;
}
.tab:not(.active):hover {
    cursor: pointer;
    color: #bfbfbf;
}
.tab.active {
    color: #ffffff;
    background: #2e3245;
}
</style>
