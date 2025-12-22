<template>
    <div class="stats-button" @click="emit('click')" />
</template>

<script setup lang="ts">

const emit = defineEmits(['click'])

</script>

<style>
.stats-button {
    width: 24px;
    height: 24px;
    background-image: url('/img/statistics.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 20px 20px;
    opacity: .4;
    filter: invert(1);
}
.stats-button:hover {
    cursor: pointer;
    opacity: .6;
}
</style>
