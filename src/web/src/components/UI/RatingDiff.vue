<template>
    <div class="rating-diff" :data-color="color">{{ value }}</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
    if (props.value > 0) {
        return `+${props.value}`
    } else if (props.value < 0) {
        return `${props.value}`
    } else {
        return `±${props.value}`
    }
})

</script>

<style scoped>
.rating-diff {
    font-variant-numeric: tabular-nums;
    width: fit-content;
    text-align: right;
    font-size: 14px;
    display: inline;
}
.rating-diff[data-color="positive"] {
    color: #64a477;
}
.rating-diff[data-color="negative"] {
    color: #a46464;
}
.rating-diff[data-color="zero"] {
    color: #649fa4;
}
</style>
