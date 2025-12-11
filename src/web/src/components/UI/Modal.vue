<template>
    <Teleport to="body">
        <div id="modal-wrapper">
            <div id="modal">
                <div id="modal-close" @click="close">
                    <div id="modal-close-icon"></div>
                </div>
                <slot />
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, Teleport } from 'vue';

const emit = defineEmits(['close'])

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
    background: #2e3245;
    position: relative;
    max-height: calc(100vh - 100px);
}
#modal-close {
    background: #2e3245;
    position: absolute;
    top: 0;
    right: 0;
    transform: translateY(-100%);
    z-index: 999;
    padding: 10px;
    opacity: .7;
    cursor: pointer;
}
#modal-close:hover {
    opacity: .8;
}
#modal-close:active {
    opacity: .9;
}
#modal-close-icon {
    background: url('/img/close.png');
    filter: invert(1);
    width: 20px;
    height: 20px;
    background-size: 20px 20px;
    background-position: center;
    background-repeat: no-repeat;
    opacity: .7;
}
</style>
