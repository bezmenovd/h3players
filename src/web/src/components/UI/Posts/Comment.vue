<template>
    <Panel class="comment">
        <div class="comment-player">
            <router-link :to="{ name: 'players.detail', params: { id: props.message.player_id} }">{{ props.message.player_name }}</router-link>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import { MessageWithInfo } from '../../../api/messages';
import Panel from '../Panel.vue';

const props = defineProps<{
    message: MessageWithInfo
}>()

</script>

<style scoped>

</style>
