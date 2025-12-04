<template>
    <Loader v-if="loading" :solid="false"/>
    <template v-else>
        <Title :text="info.name || ' '">
            <Tabs :items="tabs"/>
        </Title>
        <Panel id="player">
            <template v-if="tab === ''">

            </template>
            <template v-if="tab === 'rating'">
                <div id="player-info">
                    <LineChart 
                        v-if="ratingChart.show" 
                        id="chart-player-rating"
                        height="400px"
                        :size="ratingChart.size"
                        :colors="['#fff']" 
                        :data="ratingChart.data" 
                        :labels="ratingChart.labels" 
                        :max="ratingChart.max" 
                        :formatters="ratingChart.formatters"
                        :show-grid="true"
                        :x-labels="ratingChart.xLabels"
                    />
                </div>
            </template>
            <template v-if="tab === 'games'">
                <Header></Header>
                <Games :items="gamesList.items.slice(gamesListOffset, gamesListOffset+gamesList.limit)" />
                <Footer :limit="gamesList.limit" :total="gamesList.total"></Footer>
            </template>
        </Panel>
    </template>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import Panel from '../../UI/Panel.vue'
import Loader from '../../UI/Loader.vue'
import Title from '../../UI/Title.vue'
import { getPlayer } from '../../../api/players'
import {  GameVWithInfo, getList } from '../../../api/games_v'
import { useRoute } from 'vue-router'
import LineChart from '../../UI/Charts/LineChart.vue'
import { date, month, timestamp } from '../../../helpers/timestamp'
import Tabs from '../../UI/Tabs.vue'
import router from '../../../router'
import Header from '../../UI/Table/Header.vue'
import Footer from '../../UI/Table/Footer.vue'
import Games from '../../UI/Players/Detail/Games.vue'
import { PaginatedTable } from '../../../api/general'
import { getContentSize } from '../../../helpers/content'


const loading = ref(true)
const route = useRoute()

const info = reactive({
    id: parseInt(String(route.params.id)),
    name: '',
})

const gamesList = reactive<PaginatedTable<GameVWithInfo>>({
    items: [],
    total: 0,
    limit: 0,
})

const gamesListOffset = ref(0)

watch(() => route.query.offset, (newOffset) => gamesListOffset.value = parseInt(String(newOffset)), { immediate: true })

const tab = ref<string>('');
const tabs = [
    {
        code: '', 
        name: 'Основное' 
    }, { 
        code: 'rating', 
        name: 'Рейтинг' 
    }, { 
        code: 'games', 
        name: 'Игры' 
    }
]

watch(() => route.params.tab, (newTabCode) => {
    tab.value = String(newTabCode);
}, { immediate: true });



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
        (value: number) => `${Intl.NumberFormat('ru-RU').format(value)} птс`,
    ],
    max: [0],
    size: 183,
    xLabels: {},
})


onMounted(async () => {
    let gamesListSize = Math.min(Math.floor((getContentSize().height - 170) / 50), 20)

    getPlayer(info.id).then(data => {
        info.name = data.name

        getList(info.id).then(r => {
            gamesList.items = r.items
            gamesList.limit = gamesListSize
            gamesList.total = r.total
    
            let gamesHistorical = r.items.reverse()
            let ratingChartDataLength = 183
    
            if (r.items.length > 0) {
                ratingChartDataLength = Math.max(ratingChartDataLength, Math.ceil((timestamp.now() - gamesHistorical[0].end_timestamp) / 86400))
            }
            ratingChartDataLength = Math.max(ratingChartDataLength, 183)
    
            ratingChart.data = new Array<number[]|undefined>(ratingChartDataLength)
            ratingChart.labels = new Array<string|undefined>(ratingChartDataLength)
            ratingChart.max = [0]
    
            let now = timestamp.nowDay()
            let cur = now - ((ratingChartDataLength-1) * 86400)

            let dIndex = 0
            let rIndex = 0
    
            while (cur <= now) {
                while (rIndex < gamesHistorical.length && timestamp.startOfDay(gamesHistorical[rIndex].end_timestamp) < cur) {
                    rIndex++
                }
                while (rIndex < gamesHistorical.length && timestamp.startOfDay(gamesHistorical[rIndex].end_timestamp) === cur) {
                    if (ratingChart.data[dIndex] === undefined) {
                        ratingChart.data[dIndex] = [gamesHistorical[rIndex].player_new_rating]
                    } else {
                        ratingChart.data[dIndex]![0] = gamesHistorical[rIndex].player_new_rating
                    }
                    rIndex++
                }
                if (ratingChart.data[dIndex] === undefined) {
                    if (dIndex > 0 && ratingChart.data[dIndex-1] && rIndex > 0) {
                        ratingChart.data[dIndex] = [ratingChart.data[dIndex-1]![0]]
                    }
                }
    
                if (ratingChart.data[dIndex] && ratingChart.data[dIndex]![0] > ratingChart.max[0]) {
                    ratingChart.max[0] = Math.ceil(ratingChart.data[dIndex]![0] / 250) * 250
                }
    
                ratingChart.labels[dIndex] = date.from(cur)

                if (cur === timestamp.startOfMonth(cur)) {
                    ratingChart.xLabels[dIndex] = '01.' + month.from(cur)
                }
    
                cur += 86400
                dIndex++
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
#player {
    min-height: 300px;
}
.tabs {
    width: 400px;
}
#player-info {
    padding: 20px;
}
</style>
