<template>
    <div class="templates-list">
        <div class="template" v-for="template in props.items">
            <div class="template-name">
                <!-- <router-link :to="{ name: 'template.detail', params: { id: player.id } }"> -->
                    {{ template.name }}
                <!-- </router-link> -->
            </div>
            <div class="template-id">{{ template.id }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Template } from '../../../../api/templates';

const props = defineProps<{
    items: Template[],
}>()

</script>

<style scoped>
.template {
    height: 50px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 100px;
    align-items: center;
    background: #2e3245;
}
.template:not(:last-of-type) {
    border-bottom: 1px solid #272c3a;
}
.template:hover {
    background: #363a4c;
}
.template-name {
    padding: 0 15px;
}
.template-id {
    font-size: 12px;
    padding: 0 15px;
    font-variant-numeric: tabular-nums;
    text-align: right;
    opacity: .9;
    letter-spacing: .5px;
}
</style>
