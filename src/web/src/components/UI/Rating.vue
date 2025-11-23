<template>
    <div class="rating" :data-color="color">{{ value }}</div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps<{
    value: number,
}>()

const color = computed(() => {
    if (props.value > 0) {
        return `positive`
    } else if (props.value < 0) {
        return `negative`
    } else {
        return `zero`
    }
})

const value = computed(() => {
    if (props.value >= 0) {
        return `+${props.value}`
    } else {
        return `${props.value}`
    }
})

</script>

<style>
.rating[data-color="positive"] {
    color: #5bc757;
}
.rating[data-color="negative"] {
    color: #c75757;
}
.rating[data-color="zero"] {
    color: #578ec7;
}
</style>
