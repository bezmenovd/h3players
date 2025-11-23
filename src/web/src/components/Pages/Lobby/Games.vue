<template>
    <div id="games">
        <Title text="Игры">
        </Title>
        <Panel id="games-panel">
            <Header></Header>
            <Loader v-if="loading" :solid="true"/>
            <Games v-else :items="games.items"/>
            <Footer></Footer>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import Title from './../../UI/Title.vue'
import Panel from './../../UI/Panel.vue'
import Games from '../../UI/Lobby/Games/Games.vue';
import Header from '../../UI/Table/Header.vue';
import Footer from '../../UI/Table/Footer.vue';
import Loader from '../../UI/Loader.vue';
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { GameWithInfo } from '../../../api/games';
import { getDailyGames } from '../../../api/lobby';
import { getContentSize } from '../../../helpers/content';
import { on } from '../../../modules/websocket';

const games = reactive<{
    items: GameWithInfo[]
}>({
    items: []
})

const pageSize = ref(0)
const loading = ref(true)

onMounted(() => {
    pageSize.value = Math.floor((getContentSize().height - 150) / 50)

    getDailyGames(pageSize.value).then(r => {
        games.items = r.items
        loading.value = false
    })

    onBeforeUnmount(on('games-changed', (msg) => {
        getDailyGames(pageSize.value).then(r => {
            games.items = r.items
        })
    }))
})

</script>

<style>

</style>
