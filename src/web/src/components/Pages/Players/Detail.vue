<template>
    <Title :text="info.name"></Title>
    <Panel id="players-detail">
        <Loader v-if="loading"/>
        <template v-else>

        </template>
    </Panel>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import Panel from '../../UI/Panel.vue'
import Loader from '../../UI/Loader.vue'
import Title from '../../UI/Title.vue'
import { getPlayer } from '../../../api/players'
import { GameV, list } from '../../../api/games'
import { useRoute } from 'vue-router'

const loading = ref(true)
const route = useRoute()

const info = reactive({
    id: parseInt(String(route.params.id)),
    name: '',
})

const games = ref<GameV[]>([])

onMounted(async () => {
    Promise.all([
        getPlayer(info.id).then(data => {
            info.name = data.name
        }),
        list(info.id).then(data => {
            games.value = data
        })
    ]).then(() => {
        loading.value = false
    })
})

</script>

<style>
#players-detail {
    min-height: 300px;
}
</style>
