<template>
    <div class="games">
        <div class="game" v-for="item in props.items">

        </div>
    </div>
</template>

<script setup lang="ts">
import { GameWithInfo } from '../../api/games';


const props = defineProps<{
    items: GameWithInfo[]
}>()

</script>

<style>

</style>
