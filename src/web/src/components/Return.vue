<template>
    <div id="return-button" v-if="navigationStore.previous" @click="click" />
</template>

<script setup lang="ts">
import router from '../router';
import { useNavigationStore } from '../stores/navigation';

const navigationStore = useNavigationStore()

const click = () => {
    router.push(navigationStore.previous!)
    setTimeout(() => {
        navigationStore.pop()
        navigationStore.pop()
    }, 50)
}
</script>

<style scoped>
#return-button {
    position: absolute;
    background: url('/img/arrow-left.png');
    filter: invert(1);
    width: 36px;
    height: 36px;
    padding: 6px;
    background-size: 18px 18px;
    background-position: center;
    background-repeat: no-repeat;
    left: 54px;
    top: 38px;
    opacity: .5;
    cursor: pointer;
}
#return-button:hover {
    opacity: 1;
}

@media (max-width: 1600px) {
    #return-button {
        width: 30px;
        height: 30px;
        background-size: 18px 18px;
        left: 15px;
        top: 36px;
    }
}
</style>
