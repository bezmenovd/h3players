<template>
    <Loader v-if="loading" :solid="false"/>
    <template v-else>
        <Title :text="info.name || ' '">
            <TabsByHash :items="tabs"/>
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
                    />
                </div>
            </template>
            <template v-if="tab === 'games'">

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
import { GameV, getList } from '../../../api/games_v'
import { useRoute } from 'vue-router'
import LineChart from '../../UI/Charts/LineChart.vue'
import { date, timestamp } from '../../../helpers/timestamp'
import TabsByHash from '../../UI/Tabs/TabsByHash.vue'
import router from '../../../router'


const loading = ref(true)
const route = useRoute()

const info = reactive({
    id: parseInt(String(route.params.id)),
    name: '',
})

const games = ref<GameV[]>([])

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

watch(() => route.hash, () => {
    tab.value = route.hash.slice(1);
}, { immediate: true });



const ratingChart = reactive<{
    data: (number[]|undefined)[],
    labels: (string|undefined)[],
    show: boolean,
    formatters: ((value: number) => string)[],
    max: number[],
    size: number,
}>({
    data: [],
    labels: [],
    show: false,
    formatters: [
        (value: number) => `${Intl.NumberFormat('ru-RU').format(value)} птс`,
    ],
    max: [0],
    size: 183,
})


onMounted(async () => {
    getPlayer(info.id).then(data => {
        info.name = data.name

        getList(info.id).then(r => {
            games.value = r.items
    
            let gamesHistorical = r.items.reverse()
            let ratingChartDataLength = 183
    
            if (r.items.length > 0) {
                ratingChartDataLength = Math.max(ratingChartDataLength, Math.floor((timestamp.now() - gamesHistorical[0].end_timestamp) / 86400))
            }
            ratingChartDataLength = Math.max(ratingChartDataLength, 183)
    
            ratingChart.data = new Array<number[]|undefined>(ratingChartDataLength)
            ratingChart.labels = new Array<string|undefined>(ratingChartDataLength)
            ratingChart.max = [1200]
    
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
    
                if (ratingChart.data[dIndex] && ratingChart.data[dIndex]![0] > (ratingChart.max[0] + 200)) {
                    ratingChart.max[0] = ratingChart.data[dIndex]![0] + 200
                }
    
                ratingChart.labels[dIndex] = date.from(cur)
    
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
