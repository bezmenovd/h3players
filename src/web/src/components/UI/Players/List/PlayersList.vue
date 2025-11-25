<template>
    <div class="players-list">
        <div class="player" v-for="player in props.items">
            <div class="player-name">
                <router-link :to="{ name: 'players.detail', params: { id: player.id } }">
                    {{ player.name }}
                </router-link>
            </div>
            <div class="player-id">{{ player.id }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Player } from '../../../../api/players';

const props = defineProps<{
    items: Player[],
}>()

</script>

<style scoped>
.player {
    height: 50px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 100px;
    align-items: center;
    background: #2e3245;
}
.player:not(:last-of-type) {
    border-bottom: 1px solid #272c3a;
}
.player:hover {
    background: #363a4c;
}
.player-name {
    padding: 0 15px;
}
.player-id {
    font-size: 12px;
    padding: 0 15px;
    font-variant-numeric: tabular-nums;
    text-align: right;
    opacity: .9;
    letter-spacing: .5px;
}
</style>
