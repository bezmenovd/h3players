<template>
    <Teleport to="body">
        <div id="modal-wrapper">
            <div id="modal">
                <slot />
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, Teleport } from 'vue';

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
}
</style>
