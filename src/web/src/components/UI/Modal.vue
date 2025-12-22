<template>
    <Teleport to="body">
        <div id="modal-wrapper">
            <div id="modal">
                <div id="modal-title">
                    <div id="modal-title-text">
                        {{ props.title }}
                    </div>
                    <div id="modal-close" @click="close">    
                        <div id="modal-close-icon"></div>
                    </div>
                </div>
                <div id="modal-body">
                    <slot />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, Teleport } from 'vue';

const emit = defineEmits(['close'])

const props = defineProps<{
    title: string,
}>()

const close = () => {
    emit('close')
}

</script>

<style>
#modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #00000052;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(1px);
    z-index: 999;
}
#modal {
}
#modal-body {
    background: #2e3245;
    position: relative;
    max-height: calc(100vh - 100px);
    min-height: 50px;
    min-width: 200px;
}
#modal-title {
    width: 100%;
    height: 20px;
    background: #242738;
    display: grid;
    grid-template-columns: 1fr 40px;
    gap: 10px;
    align-items: center;
    height: 40px;
}
#modal-title-text {
    padding: 10px;
    font-size: 17px;
    opacity: .7;
}
#modal-close {
    background: #242738;
    cursor: pointer;
    opacity: 1;
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
#modal-close-icon {
    background: url('/img/close.png');
    filter: invert(1);
    width: 20px;
    height: 20px;
    background-size: 20px 20px;
    background-position: center;
    background-repeat: no-repeat;
    opacity: .5;
}
#modal-close:hover #modal-close-icon {
    opacity: 1;
}
</style>
