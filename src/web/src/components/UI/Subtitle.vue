<template>
    <div class="subtitle">
        <div class="subtitle-text" v-if="props.text">{{ props.text }}</div>
        <div class="subtitle-content">
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
.subtitle {
    display: flex;
    align-items: center;
    height: 50px;
    padding-bottom: 20px;
    justify-content: space-between;
}
.subtitle-text {
    color: rgb(231, 231, 231);
    font-size: 22px;
}
.subtitle-content {
    height: 100%;
    display: flex;
    align-items: center;
}

@media (max-width: 1600px) {
    .subtitle {
        height: 40px;
        padding: 6px 0px;
        margin-bottom: 14px;
    }
    .subtitle-text {
        font-size: 18px;
    }
}

</style>
