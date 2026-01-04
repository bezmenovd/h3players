<template>
    <div id="players-detail" :key="String(route.params.id)">
        <Loader v-if="loading" :solid="false"/>
        <template v-else>
            <Title :text="player.name || ' '">
                <template #in-text>
                    <template v-if="player.rank !== -1">
                        <div :class="{'top-rank': true, 'top-1': player.rank === 1 }" v-if="player.rank <= 100">#{{ player.rank }} {{ t('players.detail.player_rank.text') }}</div>
                    </template>
                </template>
                <template v-if="gamesList.items.length > 0">
                    <Tabs :items="tabs"/>
                </template>
            </Title>

            <template v-if="tab === ''">
                <template v-if="gamesList.items.length === 0">
                    <Panel>
                        <div id="player-no-data">
                            {{ t('players.detail.no_data') }}
                        </div>
                    </Panel>
                </template>
                <template v-else>
                    <Panel id="player-overview" class="selectable">
                        <div id="player-info">
                            <div class="player-info-column">
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.games_count') }}</div>
                                    <div class="player-info-item-value">
                                        {{ info.games_count }}
                                    </div>
                                </div>
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.games_count_wins') }}</div>
                                    <div class="player-info-item-value">{{ info.games_count_wins }}</div>
                                </div>
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.games_count_loses') }}</div>
                                    <div class="player-info-item-value">{{ info.games_count_loses }}</div>
                                </div>
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.games_count_draws') }}</div>
                                    <div class="player-info-item-value">{{ info.games_count_draws }}</div>
                                </div>
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.games_count_winrate') }}</div>
                                    <div class="player-info-item-value">{{ Math.floor(info.games_count_winrate * 1000) / 10 }}%</div>
                                </div>
                            </div>
                            <div class="player-info-column">
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.rating.text') }}</div>
                                    <div class="player-info-item-value">
                                        {{ info.rating }}
                                        <div class="today-rating-diff" v-if="info.today_games_duration > 0" :hint="t('players.detail.overview.rating.hint')">
                                            <RatingDiff :value="info.today_rating_diff" />
                                        </div>
                                    </div>
                                </div>
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.rank.text') }}</div>
                                    <div class="player-info-item-value" :hint="t('players.detail.overview.rank.hint')">{{ player.rank !== -1 ? player.rank : '?' }}</div>
                                </div>
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.max_rating') }}</div>
                                    <div class="player-info-item-value">
                                        {{ info.max_rating }} 
                                        <div class="max-rating-datetime">
                                            {{ datetime.from(info.max_rating_timestamp) }}
                                        </div>
                                    </div>
                                </div>
                                <div class="player-info-item">
                                    <div class="player-info-item-label">{{ t('players.detail.overview.games_duration.text') }}</div>
                                    <div class="player-info-item-value">
                                        <template v-if="settingsStore.language === 1">
                                            {{ Intl.NumberFormat('ru-RU').format(info.games_duration) }} {{ pluralize(info.games_duration, 'час', 'часа', 'часов') }}
                                            <div class="today-games-duration" v-if="info.today_games_duration > 0" :hint=" t('players.detail.overview.games_duration.hint')">
                                                +
                                                <template v-if="info.today_games_duration >= 3600">
                                                    {{ Math.floor(info.today_games_duration / 3600) }} ч.
                                                </template>
                                                <template v-if="true">
                                                    {{ Math.floor((info.today_games_duration % 3600) / 60) }} мин.
                                                </template>
                                            </div>
                                        </template>
                                        <template v-if="settingsStore.language === 2">
                                            {{ info.games_duration }} {{ pluralizeEn(info.games_duration, 'hour') }}
                                            <div class="today-games-duration" v-if="info.today_games_duration > 0" :hint=" t('players.detail.overview.games_duration.hint')">
                                                +
                                                <template v-if="info.today_games_duration >= 3600">
                                                    {{ Math.floor(info.today_games_duration / 3600) }} h.
                                                </template>
                                                <template v-if="true">
                                                    {{ Math.floor((info.today_games_duration % 3600) / 60) }} min.
                                                </template>
                                            </div>
                                        </template>
                                        <template v-if="settingsStore.language === 3">
                                            {{ info.games_duration }} {{ pluralizePl(info.games_duration, 'godzina', 'godziny', 'godzin') }}
                                            <div class="today-games-duration" v-if="info.today_games_duration > 0" :hint=" t('players.detail.overview.games_duration.hint')">
                                                +
                                                <template v-if="info.today_games_duration >= 3600">
                                                    {{ Math.floor(info.today_games_duration / 3600) }} godz.
                                                </template>
                                                <template v-if="true">
                                                    {{ Math.floor((info.today_games_duration % 3600) / 60) }} min.
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <LineChart 
                            v-if="ratingChart.show" 
                            id="chart-player-rating"
                            :size="ratingChart.size"
                            :colors="['#fff']" 
                            :data="ratingChart.data" 
                            :labels="ratingChart.labels" 
                            :max="ratingChart.max" 
                            :formatters="ratingChart.formatters"
                            :show-grid="true"
                            :x-labels="ratingChart.xLabels"
                        />
                    </Panel>
                </template>
            </template>
            <template v-if="tab === 'games'">
                <Panel>
                    <Header></Header>
                    <Games :items="gamesList.items.slice(gamesListOffset, gamesListOffset+gamesList.limit)" @wheel="scroll"/>
                    <Footer :limit="gamesList.limit" :total="gamesList.total"></Footer>
                </Panel>
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import Panel from '../../UI/Panel.vue'
import Loader from '../../UI/Loader.vue'
import Title from '../../UI/Title.vue'
import { getPlayer } from '../../../api/players'
import {  GameVWithInfo, getList } from '../../../api/games_v'
import { useRoute } from 'vue-router'
import LineChart from '../../UI/Charts/LineChart.vue'
import { date, datetime, month, timestamp } from '../../../helpers/timestamp'
import Tabs from '../../UI/Tabs.vue'
import router from '../../../router'
import Header from '../../UI/Table/Header.vue'
import Footer from '../../UI/Table/Footer.vue'
import Games from '../../UI/Players/Detail/Games.vue'
import { PaginatedTable } from '../../../api/_general'
import { getContentSize } from '../../../helpers/content'
import { pluralize, pluralizeEn, pluralizePl } from '../../../helpers/string'
import RatingDiff from '../../UI/RatingDiff.vue'
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../../../stores/settings'

const { t } = useI18n();
const settingsStore = useSettingsStore()


const loading = ref(true)
const route = useRoute()

const player = reactive({
    id: parseInt(String(route.params.id)),
    name: '',
    rank: -1,
})

const gamesList = reactive<PaginatedTable<GameVWithInfo>>({
    items: [],
    total: 0,
    limit: 0,
})

const info = computed(() => {
    let games_count = gamesList.items.length
    let games_count_wins = 0
    let games_count_loses = 0
    let games_count_draws = 0
    let games_duration = 0
    let max_rating = 0
    let max_rating_timestamp = 0
    let rating = gamesList.items[0].player_new_rating
    let today_rating_diff = 0
    let today_games_duration = 0

    if (gamesList.items[0].end_timestamp < 1703970000) {
        rating = Math.min(Math.floor(rating * 0.5), 500)
    }
    if (gamesList.items[0].end_timestamp < 1767213000) {
        rating = Math.min(Math.floor(rating * 0.5), 500)
    }

    for (let i = 0; i < gamesList.items.length; i++) {
        let g = gamesList.items[i]

        if (g.is_win) {
            games_count_wins++
        } else if (g.is_loss) {
            games_count_loses++
        } else {
            games_count_draws++
        }

        let game_duration = (g.end_timestamp - g.start_timestamp) < 16*3600 ? g.end_timestamp - g.start_timestamp : 0

        games_duration += game_duration

        if (g.player_old_rating > max_rating) {
            max_rating = g.player_old_rating
            max_rating_timestamp = g.start_timestamp
        }
        if (g.player_new_rating > max_rating) {
            max_rating = g.player_new_rating
            max_rating_timestamp = g.end_timestamp
        }

        if (g.end_timestamp >= timestamp.nowDay()) {
            today_rating_diff += g.player_new_rating - g.player_old_rating
            today_games_duration += game_duration
        }
    }

    return {
        games_count: games_count,
        games_count_wins: games_count_wins,
        games_count_loses: games_count_loses,
        games_count_draws: games_count_draws,
        games_count_winrate: games_count_wins / games_count,
        games_duration: Math.floor(games_duration / 3600),
        rating: rating,
        max_rating: max_rating,
        max_rating_timestamp: max_rating_timestamp,
        today_rating_diff: today_rating_diff,
        today_games_duration: today_games_duration,
    }
})

const gamesListOffset = computed<number>(() => {
    const v = Number(route.query.offset)
    return Number.isFinite(v) && v >= 0 ? v : 0
})

const tab = ref<string>('');
const tabs = [
    {
        code: '', 
        name: t('players.detail.tabs.overview')
    }, { 
        code: 'games', 
        name: t('players.detail.tabs.games')
    }
]

watch(() => route.params.tab, (newTabCode) => {
    tab.value = newTabCode !== undefined ? String(newTabCode) : '';
}, { immediate: true });


const scrollHeight = ref(0)
const scroll = (event: WheelEvent) => {
    const offset = gamesListOffset.value

    event.stopPropagation()
    event.preventDefault()

    scrollHeight.value += event.deltaY

    let newOffset = offset + Math.round(scrollHeight.value / 50)
    newOffset = Math.min(newOffset, gamesList.total - gamesList.limit)
    newOffset = Math.max(newOffset, 0)

    scrollHeight.value = 0

    router.replace({
        query: {
            ...route.query,
            offset: newOffset,
        },
    })
}


const ratingChart = reactive<{
    data: (number[]|undefined)[],
    labels: (string|undefined)[],
    show: boolean,
    formatters: ((value: number) => string)[],
    max: number[],
    size: number,
    xLabels: { [key: number]: string },
}>({
    data: [],
    labels: [],
    show: false,
    formatters: [
        (value: number) => `${Intl.NumberFormat('ru-RU').format(value)} ${ t('players.detail.rating_chart.formatters.rating') }`,
    ],
    max: [0],
    size: 183,
    xLabels: {},
})


onMounted(async () => {
    let gamesListSize = Math.min(Math.floor((getContentSize().height - 170) / 50), 20)

    getPlayer(player.id).then(data => {
        player.name = data.name
        player.rank = data.rank

        getList(player.id).then(r => {
            gamesList.items = r.items
            gamesList.limit = gamesListSize
            gamesList.total = r.total
    
            let gamesHistorical = r.items.slice().reverse()
            let ratingChartDataLength = 183
    
            if (r.items.length > 0) {
                ratingChartDataLength = Math.max(ratingChartDataLength, Math.floor((timestamp.nowDay() - timestamp.startOfDay(gamesHistorical[0].end_timestamp)) / 86400))
            }
            ratingChartDataLength = Math.max(ratingChartDataLength, 183)
    
            ratingChart.data = new Array<number[]|undefined>(ratingChartDataLength)
            ratingChart.labels = new Array<string|undefined>(ratingChartDataLength)
            ratingChart.max = [0]

            const gamesMap = new Map<number, number>()

            gamesHistorical.forEach(g => {
                gamesMap.set(timestamp.startOfDay(g.end_timestamp), g.player_new_rating)
            })
    
            let now = timestamp.nowDay()
            let cur = now - (ratingChartDataLength * 86400)
            let lastRating = undefined
            let wiped1 = false
            let wiped2 = false
            let beforeGames = true

            for (let i = 0; i <= ratingChartDataLength; i++) {
                if (gamesMap.has(cur)) {
                    beforeGames = false
                    lastRating = gamesMap.get(cur)!
                } else {
                    if (beforeGames && (gamesHistorical[0].player_old_rating > 0 || timestamp.startOfDay(gamesHistorical[0].end_timestamp) === cur + 86400)) {
                        lastRating = gamesHistorical[0].player_old_rating
                    }
                    if (cur === 1703894400 && ! wiped1 && lastRating !== undefined) {
                        lastRating = Math.min(Math.floor(lastRating! * 0.5), 500) 
                        wiped1 = true
                    }
                    if (cur === 1767225600 && ! wiped2 && lastRating !== undefined) {
                        lastRating = Math.min(Math.floor(lastRating! * 0.5), 500) 
                        wiped2 = true
                    }
                }
                
                if (lastRating !== undefined) {
                    ratingChart.data[i] = [lastRating]
                }
                ratingChart.labels[i] = date.from(cur)

                if (cur === timestamp.startOfMonth(cur)) {
                    ratingChart.xLabels[i] = '01.' + month.from(cur)
                }
                if (ratingChart.data[i] && ratingChart.data[i]![0] > ratingChart.max[0]) {
                    ratingChart.max[0] = Math.ceil(ratingChart.data[i]![0] / 250) * 250
                }

                cur += 86400
            }
    
            ratingChart.show = true

            loading.value = false
        })
    }).catch(e => {
        router.push({ name: 'not_found' })
    })
})

</script>

<style scoped>
#player-overview {
    display: grid;
    grid-template-rows: auto 560px;
    gap: 30px;
    padding: 20px;
}
#player-no-data {
    opacity: .5;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
}
@media (max-width: 1600px) {
    #player-overview {
        grid-template-rows: 1fr 420px;
    }
}
#player-info {
    display: flex;
    gap: 100px;
}
.player-info-column {
    gap: 20px;
    display: flex;
    flex-direction: column;
}
@media (max-width: 1600px) {
    .player-info-column {
        gap: 12px;
    }
}
#chart-player-rating{
    height: 560px;
}
@media (max-width: 1600px) {
    #chart-player-rating{
        height: 420px;
    }
}
.player-info-item {
    display: grid;
    grid-template-columns: 130px 1fr;
    gap: 10px;
}
.player-info-item-label {
    opacity: .7;
    font-weight: 500;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.player-info-item-value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-variant-numeric: tabular-nums;
}
.games_count {
    display: inline-block;
    margin-left: 22px;
    opacity: .8;
}
.max-rating-datetime {    
    opacity: .7;
    margin-left: 12px;
    font-size: 13px;
    padding-top: 2px;
}
.top-rank {
    font-size: 16px;
    margin-left: 30px;
    background: #fdd807ba;
    padding: 4px 8px 5px;
    margin-top: 2px;
    color: #272c3a;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
}
.top-rank.top-1 {
    background: #9007fdba;
}
.today-games-duration {
    margin-left: 10px;
    opacity: .7;
    font-size: 15px;
}
.today-rating-diff {
    margin-left: 10px;
    position: relative;
    top: -1px;
}
</style>
