<template>
    <div class="rating">{{ value }}</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
    value: number,
}>()

</script>

<style scoped>
.rating {
    display: flex;
    align-items: center;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    font-size: 14px;
    gap: 5px;
    padding: 3px 5px;
    background: #0000004f;
    font-weight: 500;
}
</style>
