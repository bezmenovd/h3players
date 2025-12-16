<template>
    <div id="alerts">
        <transition-group name="list">
            <div 
                v-for="alert in alerts.list" 
                :key="alert.id"
                :class="['alert-wrapper', alert.type]"
            >
                <div class="alert-content">
                    {{ alert.text }}
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { alerts } from './alerts';
</script>

<style scoped>
#alerts {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 12px;
    width: 90%;
    max-width: 400px;
    opacity: .8;
}

.alert-wrapper {
    width: 100%;
    overflow: hidden;
    background: #2e3245;
    margin-bottom: 10px;
    transition: all 0.4s ease;
}

.alert-wrapper.error {
    background: #a46464aa;
}

.alert-content {
    padding: 10px;
    text-align: center;
    color: white;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    max-height: 0;
    margin-bottom: 0;
    transform: scaleY(0);
}

.list-enter-to,
.list-leave-from {
    opacity: 1;
    max-height: 100px;
    margin-bottom: 10px;
    transform: scaleY(1);
}

.list-enter-active {
    transition: all 0s ease;
}
.list-leave-active {
    transition: all 0.4s ease;
}

.list-move {
    transition: transform 0.4s ease;
}

.list-leave-active {
    position: absolute;
    width: 100%;
}
</style>