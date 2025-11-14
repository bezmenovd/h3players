<template>
    <div class="title">
        <div class="title-text">{{ props.text }}</div>
        <div class="title-right">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
    text: {
        type: string
    }
}>()

</script>

<style scoped>
.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.title-text {
    color: white;
    font-size: 24px;
}
</style>
