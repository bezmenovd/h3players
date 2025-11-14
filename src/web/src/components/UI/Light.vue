<template>
    <div class="light-container">
        <div class="light-pulse" v-if="props.pulse" :style="`background: ${props.color}`"></div>
        <div class="light-circle" :style="`border: 4px solid ${props.color}`"></div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    pulse: boolean,
    color: string
}>()

</script>

<style>
.light-container {
    position: relative;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 4px;
}

.light-circle {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.light-pulse {
    border-radius: 30px;
    height: 20px;
    width: 20px;
    animation: pulsate 2s ease-out;
    animation-iteration-count: infinite; 
    opacity: 0.0;
    position: absolute;
}

@keyframes pulsate {
    0% {transform: scale(0.1, 0.1); opacity: 0.0;}
    50% {opacity: 1.0;}
    100% {transform: scale(0.9, 0.9); opacity: 0.0;}
}
</style>
