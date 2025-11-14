<template>
    <div class="title">
        <div class="title-text" v-if="props.text">{{ props.text }}</div>
        <div class="title-content">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
    text: string
}>()

</script>

<style scoped>
.title {
    display: flex;
    align-items: center;
    height: 50px;
    padding-bottom: 20px;
    justify-content: space-between;
}
.title-text {
    color: white;
    font-size: 24px;
}
.title-content {
    height: 100%;
    display: flex;
    align-items: center;
}

@media (max-width: 1600px) {
    .title {
        height: 40px;
        padding: 6px 0px;
        margin-bottom: 14px;
    }
    .title-text {
        color: white;
        font-size: 20px;
    }
}

</style>
