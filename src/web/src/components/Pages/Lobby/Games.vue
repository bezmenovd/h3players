<template>
    <div id="games">
        <Title :text="t('lobby.games.title')">
        </Title>
        <Panel id="games-panel">
            <Header></Header>
            <Loader v-if="loading" :solid="true" />
            <Games :items="gamesList.items" :class="{'updating': updating}"/>
            <Footer :total="gamesList.total" :limit="gamesList.limit"></Footer>
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
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { GameWithInfo, getList } from '../../../api/games';
import { getContentSize } from '../../../helpers/content';
import { on } from '../../../modules/websocket';
import { PaginatedTable } from '../../../api/general';
import { useRoute } from 'vue-router'
import { watch } from 'vue'
import { getList as getPlayersList } from '../../../api/players';
import { getList as getTemplatesList } from '../../../api/templates';
import { throttle } from '../../../helpers/functions';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


const gamesList = reactive<PaginatedTable<GameWithInfo>>({
    items: [],
    total: 0,
    limit: 0,
})

const pageSize = ref(0)
const loading = ref(true)
const updating = ref(false)

const route = useRoute()

const offset = computed<number>(() => {
    const v = Number(route.query.offset)
    return Number.isFinite(v) && v >= 0 ? v : 0
})

const load = (visible: boolean = true) => {    
    if (visible) {
        updating.value = true
    }

    getList(pageSize.value, offset.value).then(r => {
        gamesList.items = r.items
        gamesList.total = r.total
        gamesList.limit = r.limit

        if (visible) {
            updating.value = false
        }

        if (loading.value) {
            loading.value = false
        }
    })
}

const onUpdate = throttle(load, 1000)

onMounted(() => {
    pageSize.value = Math.min(Math.floor((getContentSize().height - 170) / 50), 20)

    watch(() => route.query.offset, () => load(true), { immediate: true })

    onBeforeUnmount(on('data.games.update', () => { onUpdate(false) }).unsubscribe)

    onBeforeUnmount(on('data.players.update', (msg) => {
        const unknownPlayers: Set<number> = new Set()

        gamesList.items.forEach((g, i) => {
            if (msg.id.includes(g.host_id) && ! g.host_name) {
                unknownPlayers.add(g.host_id)
            }
            if (msg.id.includes(g.opponent_id) && ! g.opponent_name) {
                unknownPlayers.add(g.opponent_id)
            }
        })

        if (unknownPlayers.size > 0) {
            getPlayersList(unknownPlayers.size, 0, unknownPlayers.values().toArray()).then(r => {
                const playersMap: Map<number, string> = new Map()
                r.items.forEach(p => playersMap.set(p.id, p.name))

                gamesList.items.forEach(g => {
                    if (! g.host_name && playersMap.has(g.host_id)) {
                        g.host_name = playersMap.get(g.host_id)!
                    }
                    if (! g.opponent_name && playersMap.has(g.opponent_id)) {
                        g.opponent_name = playersMap.get(g.opponent_id)!
                    }
                })
            })
        }
    }).unsubscribe)

    onBeforeUnmount(on('data.templates.update', (msg) => {
        const unknownTemplates: Set<number> = new Set()

        gamesList.items.forEach((g, i) => {
            if (msg.id.includes(g.template_id) && ! g.template_name) {
                unknownTemplates.add(g.template_id)
            }
        })

        if (unknownTemplates.size > 0) {
            getTemplatesList(unknownTemplates.size, 0, unknownTemplates.values().toArray()).then(r => {
                const templatesMap: Map<number, string> = new Map()
                r.items.forEach(t => templatesMap.set(t.id, t.name))

                gamesList.items.forEach(g => {
                    if (! g.template_name && templatesMap.has(g.template_id)) {
                        g.template_name = templatesMap.get(g.template_id)!
                    }
                })
            })
        }
    }).unsubscribe)
})

</script>

<style>

</style>
