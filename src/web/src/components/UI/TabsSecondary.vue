<template>
    <div class="tabs-secondary">
        <div class="tab" v-for="tab in props.items" @click="select(tab.code)" :class="{'active': activeTabCode === tab.code}">
            {{ tab.name }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import router from '../../router';
import { useRoute } from 'vue-router';

const route = useRoute()

const props = defineProps<{
    items: {
        code: string,
        name: string,
    }[]
}>()

const activeTabCode = ref<string>('');

watch(() => route.params.tab, (newTabCode) => {
    const tabCodeFromParam = String(newTabCode || ''); 
    
    const isTabValid = props.items.some(item => item.code === tabCodeFromParam);

    if (isTabValid) {
        activeTabCode.value = tabCodeFromParam;
    } else if (props.items.length > 0) {
        const defaultCode = props.items[0].code;

        activeTabCode.value = defaultCode; 
        
        if (tabCodeFromParam !== defaultCode) {
            select(defaultCode);
        }
    }
}, { immediate: true });

const select = (code: string) => {
    if (activeTabCode.value !== code) {
        router.push({
            params: {
                ...route.params,
                tab: code
            },
            query: route.query,
        });
    }
}

</script>

<style scoped>
.tabs-secondary {
    display: flex;
    background: #2e3245;
    gap: 1px;
    height: 50px;
    width: fit-content;
}
.tab {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2e3245;
    font-size: 16px;
    font-weight: 500;
    color: #82848f;
    padding: 0 20px;
    white-space: nowrap;
}
.tab:not(.active):hover {
    cursor: pointer;
    color: #bfbfbf;
}
.tab.active {
    color: #ffffff;
    box-shadow: 0 -2px 0 0 #ffffff75 inset;
}
</style>
