<template>
    <div id="lobby">
        <Panel id="online">
            <Loader v-if="loading" />
            <template v-else>
                <div id="online-chart">
                    <LineChart ref="chart" :width="1440" :height="240" :data="data.onlineChart.data" color="#19f0af" :max="onlineChartMax"/>
                </div>
                <div id="lobby-metrics">
                    <div class="metric">
                        <template v-if="connected">
                            <div class="metric-value"><Light color="#19f0af" style="position: absolute; left: 22px"/>{{ onlineFormatted }}</div>
                        </template>
                        <template v-else>
                            <div class="metric-value"><Light color="#f01919" style="position: absolute; left: 22px"/>-</div>
                        </template>
                        <div class="metric-name">онлайн</div>
                    </div>
                    <div class="metric" hint="Число игр, завершённых сегодня">
                        <div class="metric-value">0</div>
                        <div class="metric-name">игр</div>
                    </div>
                    <div class="metric" hint="Число пользователей, посетивших лобби сегодня">
                        <div class="metric-value">0</div>
                        <div class="metric-name">посетителей</div>
                    </div>
                </div>
            </template>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import Panel from './../UI/Panel.vue'
import Light from './../UI/Light.vue'
import {  onlineChart } from '../../api/lobby'
import Loader from '../UI/Loader.vue'
import LineChart from '../UI/Charts/LineChart.vue'
import { timestamp, datetime } from '../../helpers/timestamp'

const data = reactive<{ 
    onlineChart: {
        data: (number|null)[],
        labels: (string|null)[],
    }
}>({
    onlineChart: {
        data: [],
        labels: [],
    },
})

const loading = ref(true)

const connected = computed<boolean>(() => {
    return online != null
})

const online = computed<number|null>(() => {
    return data.onlineChart.data.at(-1) ?? data.onlineChart.data.at(-2) ?? null
})

const onlineFormatted = computed<string>(() => {
    return online.value ? Intl.NumberFormat('ru-RU').format(online.value!) : '-'
})

const onlineMax = computed<number>(() => {
    let max: number = 0

    data.onlineChart.data.forEach(online => {
        if (Number(online) > max) {
            max = online!
        }
    })
    
    return max
})

const onlineChartMax = computed<number>(() => {
    return Math.max(3000, Math.ceil(onlineMax.value / 1000) * 1000)
})

onlineChart().then(r => {
    let now = timestamp.nowMinute()
    let cur = now - (1439*60)
    let curIndex = 0
    let chartDataPointer = 0

    while (cur <= now) {
        if (chartDataPointer < r.length && r[chartDataPointer].timestamp === cur) {
            data.onlineChart.data[curIndex] = r[chartDataPointer].online
            data.onlineChart.labels[curIndex] = datetime.from(r[chartDataPointer].timestamp)
            chartDataPointer++
        } else {
            data.onlineChart.data[curIndex] = null
        }
        cur += 60
        curIndex++
    }

    loading.value = false
})

setInterval(() => {
    onlineChart(timestamp.now() - 60).then(r => {
        data.onlineChart.data = [...data.onlineChart.data.slice(1), r[0]?.online ?? null]
        data.onlineChart.labels = [...data.onlineChart.labels.slice(1), r[0] ? datetime.from(r[0].timestamp) : null]
    })
}, 60_000)

</script>

<style scoped>
#online {
    width: 100%;
    height: 240px;
    display: grid;
    grid-template-columns: 1fr 180px;
}
#lobby-metrics {
    padding: 10px 20px;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
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
</style>
