<template>
    <div id="lobby">
        <div id="online">
            <Title text="Лобби"></Title>
            <Panel id="online-panel">
                <Loader v-if="loading.online" :solid="false"/>
                <template v-else>
                    <div id="online-chart">
                        <LineChart 
                            v-if="onlineChart.show" 
                            id="chart-online"
                            height="100%"
                            :colors="['#19f0af']" 
                            :data="onlineChart.data" 
                            :labels="onlineChart.labels" 
                            :max="[chartMax]" 
                            :formatters="onlineChart.formatters"
                            :showNoData="true"
                        />
                    </div>
                    <div id="lobby-metrics">
                        <div class="metric">
                            <template v-if="connected">
                                <div class="metric-value">
                                    <Light id="online-light" :pulse="false" color="#19f0af"/>
                                    {{ onlineFormatted }}
                                </div>
                            </template>
                            <template v-else>
                                <div class="metric-value">-</div>
                            </template>
                            <div class="metric-name">онлайн</div>
                        </div>
                        <div class="metric" hint="Число игр, завершённых сегодня">
                            <div class="metric-value">{{ gamesFormatted }}</div>
                            <div class="metric-name">игр</div>
                        </div>
                        <div class="metric" hint="Число пользователей, посетивших лобби сегодня">
                            <div class="metric-value">{{ visitorsFormatted }}</div>
                            <div class="metric-name">посетителей</div>
                        </div>
                    </div>
                </template>
            </Panel>
        </div>
        <div id="live">
            <div id="last-games">
                <Subtitle text="Последние игры">
                    <template #in-text>
                        <Questionmark hint="Только завершенные рейтинговые игры"/>
                    </template>
                    <ListButton @click="router.push({ name: 'lobby.games' })"/>
                </Subtitle>
                <Panel id="last-games-panel">
                    <Loader v-if="loading.lastGames" :solid="false"/>
                    <Games :items="lastGames.items" v-else/>
                </Panel>
            </div>
            <div id="daily-top">
                <Subtitle text="Топ за день">
                    <template #in-text>
                        <Questionmark hint="По UTC"/>
                    </template>
                </Subtitle>
                <Panel id="daily-top-panel">
                    <div class="rating">
                        <div class="rating-title" hint="Все игры">
                            Рейтинг
                        </div>
                        <div class="rating-items">
                            <div class="rating-item" v-for="i in 7">
                                <div class="rating-place">{{ i }}</div>
                                <div class="rating-user">
                                    <router-link v-if="dailyTop.byRating[i-1]" :to="{ name: 'players.detail', params: { id: dailyTop.byRating[i-1].id }}">{{ dailyTop.byRating[i-1].name || '?' }}</router-link>
                                </div>
                                <div class="rating-value">
                                    <RatingDiff v-if="dailyTop.byRating[i-1]" :value="dailyTop.byRating[i-1].rating_diff" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="rating">
                        <div class="rating-title" hint="Все игры">
                            Рейтинг -
                        </div>
                        <div class="rating-items">
                            <div class="rating-item" v-for="i in 7">
                                <div class="rating-place">{{ i }}</div>
                                <div class="rating-user">
                                    <router-link v-if="dailyTop.byRatingAnti[i-1]" :to="{ name: 'players.detail', params: { id: dailyTop.byRatingAnti[i-1].id }}">{{ dailyTop.byRatingAnti[i-1].name || '?' }}</router-link>
                                </div>
                                <div class="rating-value">
                                    <RatingDiff v-if="dailyTop.byRatingAnti[i-1]" :value="dailyTop.byRatingAnti[i-1].rating_diff" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="rating">
                        <div class="rating-title" hint="Только рейтинговые игры на случайных картах">
                            Игры
                        </div>
                        <div class="rating-items">
                            <div class="rating-item" v-for="i in 7">
                                <div class="rating-place">{{ i }}</div>
                                <div class="rating-user">
                                    <router-link v-if="dailyTop.byGamesCount[i-1]" :to="{ name: 'players.detail', params: { id: dailyTop.byGamesCount[i-1].id }}">{{ dailyTop.byGamesCount[i-1].name || '?' }}</router-link>
                                </div>
                                <div class="rating-value" style="font-weight: bold">{{  dailyTop.byGamesCount[i-1]?.games_count ?? '' }}</div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, onUnmounted, onBeforeUnmount } from 'vue'
import Panel from './../UI/Panel.vue'
import Light from './../UI/Light.vue'
import Title from './../UI/Title.vue'
import Subtitle from './../UI/Subtitle.vue'
import RatingDiff from '../UI/RatingDiff.vue'
import { getChart, getDailyTop, DailyTop } from '../../api/lobby'
import { getList } from '../../api/games'
import { getVisitors, getGames } from '../../api/lobby/counter'
import Loader from '../UI/Loader.vue'
import LineChart from '../UI/Charts/LineChart.vue'
import Games from '../UI/Lobby/Games.vue'
import Questionmark from '../UI/Questionmark.vue'
import { timestamp, datetime } from '../../helpers/timestamp'
import { on } from '../../modules/websocket'
import { GameWithInfo } from '../../api/games'
import ListButton from '../UI/Buttons/ListButton.vue'
import router from '../../router'
import { getList as getPlayersList } from '../../api/players';
import { getList as getTemplatesList } from '../../api/templates';


const onlineChart = reactive<{
    data: (number[]|undefined)[],
    labels: (string|undefined)[],
    show: boolean,
    formatters: ((value: number) => string)[],
}>({
    data: [],
    labels: [],
    show: false,
    formatters: [
        (value: number) => Intl.NumberFormat('ru-RU').format(value)
    ]
})

const loading = reactive({
    online: false,
    lastGames: true,
    dailyTop: true,
})

const connected = computed<boolean>(() => {
    return online.value > 0
})

const online = ref(0)

const onlineFormatted = computed<string>(() => {
    return online.value ? Intl.NumberFormat('ru-RU').format(online.value!) : '-'
})

const chartMax = computed<number>(() => {
    let max: number = 0

    onlineChart.data.forEach(item => {
        if (item && Number(item![0]) > max) {
            max = item![0]
        }
    })

    return Math.max(3000, Math.ceil(max / 1000) * 1000)
})

const visitorsRef = ref(0)

const visitorsFormatted = computed<string>(() => {
    return visitorsRef.value ? Intl.NumberFormat('ru-RU').format(visitorsRef.value!) : '-'
})

const gamesRef = ref(0)

const gamesFormatted = computed<string>(() => {
    return gamesRef.value ? Intl.NumberFormat('ru-RU').format(gamesRef.value!) : '-'
})

const chartSize = ref(0)

const lastGames = reactive<{
    items: GameWithInfo[]
}>({
    items: [],
})

const dailyTop = reactive<DailyTop>({
    byRating: [],
    byRatingAnti: [],
    byGamesCount: [],
})

let updateInterval

onMounted(() => {
    chartSize.value = Math.round(document.getElementById('online-chart')!.getBoundingClientRect().width - 15)
    
    loading.online = true

    getChart(timestamp.now() - chartSize.value*60).then(r => {
        onlineChart.data = new Array<number[]|undefined>(chartSize.value)
        onlineChart.labels = new Array<string|undefined>(chartSize.value)

        let now = timestamp.nowMinute()
        let cur = now - ((chartSize.value-1)*60)
        let dIndex = 0
        let rIndex = 0

        while (cur <= now) {
            while (rIndex+1 < r.length && r[rIndex].timestamp < cur) {
                rIndex++
            }
            
            if (rIndex < r.length && r[rIndex].timestamp === cur) {
                onlineChart.data[dIndex] = [r[rIndex].online]
                onlineChart.labels[dIndex] = datetime.from(r[rIndex].timestamp)
            }

            cur += 60
            dIndex++
        }

        onlineChart.show = true

        if (onlineChart.data[onlineChart.data.length-1]) {
            online.value = onlineChart.data[onlineChart.data.length-1]![0]
        }

        loading.online = false
    })

    getVisitors().then(r => {
        visitorsRef.value = r.value
    })

    getGames().then(r => {
        gamesRef.value = r.value
    })

    updateInterval = setInterval(() => {
        getChart(timestamp.now() - 60).then(r => {
            onlineChart.data = [...onlineChart.data.slice(1), r[0] ? [r[0].online] : undefined]
            onlineChart.labels = [...onlineChart.labels.slice(1), r[0] ? datetime.from(r[0].timestamp) : undefined]
        })
    }, 60_000)

    onBeforeUnmount(on('lobby.counter.online.update', (msg) => {
        online.value = msg.value
    }).unsubscribe)

    onBeforeUnmount(on('lobby.counter.visitors.update', (msg) => {
        visitorsRef.value = msg.value
    }).unsubscribe)

    onBeforeUnmount(on('lobby.counter.games.update', (msg) => {
        gamesRef.value = msg.value

        getList(8).then(r => {
            lastGames.items = r.items
        })

        getDailyTop(7).then(r => {
            dailyTop.byRating = r.byRating
            dailyTop.byRatingAnti = r.byRatingAnti
            dailyTop.byGamesCount = r.byGamesCount
        })
    }).unsubscribe)

    onBeforeUnmount(on('data.players.update', (msg) => {
        const unknownPlayers: Set<number> = new Set()

        lastGames.items.forEach((g, i) => {
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

                lastGames.items.forEach(g => {
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

            lastGames.items.forEach((g, i) => {
            if (msg.id.includes(g.template_id) && ! g.template_name) {
                unknownTemplates.add(g.template_id)
            }
        })

        if (unknownTemplates.size > 0) {
            getTemplatesList(unknownTemplates.size, 0, unknownTemplates.values().toArray()).then(r => {
                const templatesMap: Map<number, string> = new Map()
                r.items.forEach(t => templatesMap.set(t.id, t.name))

                lastGames.items.forEach(g => {
                    if (! g.template_name && templatesMap.has(g.template_id)) {
                        g.template_name = templatesMap.get(g.template_id)!
                    }
                })
            })
        }
    }).unsubscribe)

    getList(8).then(r => {
        lastGames.items = r.items
        loading.lastGames = false
    })

    getDailyTop(7).then(r => {
        loading.dailyTop = false
        dailyTop.byRating = r.byRating
        dailyTop.byRatingAnti = r.byRatingAnti
        dailyTop.byGamesCount = r.byGamesCount
    })
})

onUnmounted(() => {
    clearInterval(updateInterval!)
})

</script>

<style scoped>
#lobby {
    display: flex;
    flex-direction: column;
}
#online {
}
#online-panel {
    width: 100%;
    height: 240px;
    display: grid;
    grid-template-columns: 1fr 180px;
}
#live {
    margin-top: 35px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 40px;
}
#online-chart {
    padding: 10px 0px 10px 10px;
}
#players {
    margin-top: 40px;
    padding: 20px;
    display: grid;
    gap: 4px;
    width: 100%;
    height: auto;
}
#lobby-metrics {
    padding: 10px 20px;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
}
#online-light {
    position: absolute;
    left: 22px;
}
.metric {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    align-items: center;
}
.metric-value {
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.metric-name {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: .7;
    margin-top: 5px;
}

#last-games-panel {
    height: 400px;
}

#daily-top-panel {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 5px;
    background: #272c3a;
}
.rating-title {
    height: 50px;
    justify-content: center;
    display: flex;
    align-items: center;    
    font-size: 16px;
    border-bottom: 1px solid #272c3a;
    background: #2e3245;
    color: #b7b7b7;
    position: relative;
}
.rating-item {
    height: 50px;
    display: grid;
    grid-template-columns: 16px 1fr 50px;
    padding: 0 8px;
    border-bottom: 1px solid #272c3a;
    background: #2e3245;
}
.rating-item:hover {
    background: #363a4c;
}
.rating-item > div {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.rating-place {
    font-size: 14px;
    padding-left: 4px;
    color: #b7b7b7;
}
.rating-user {
    padding: 0 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    justify-content: start !important;
    padding-bottom: 2px;
}
.rating-value {
    padding-right: 6px;
    justify-content: flex-end !important;
}

@media (max-width: 1600px) {
    #online {
        grid-template-columns: 1fr 140px;
    }
    #lobby-metrics {
        padding: 8px 10px;
    }
    .metric-name {
        font-size: 15px;
    }
    .metric-value {
        font-size: 16px;
    }
    #online-light {
        left: 14px;
    }
}
</style>
