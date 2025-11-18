<template>
    <div id="lobby">
        <Title text="Лобби"></Title>
        <Panel id="online">
            <Loader v-if="loading" />
            <template v-else>
                <div id="online-chart">
                    <LineChart 
                        v-if="onlineChart.show" 
                        id="chart-online" 
                        :width="chartSize" 
                        :height="230" 
                        :colors="['#19f0af']" 
                        :data="onlineChart.data" 
                        :labels="onlineChart.labels" 
                        :max="chartMax" 
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
                        <div class="metric-value">0</div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, onUnmounted, onBeforeUnmount } from 'vue'
import Panel from './../UI/Panel.vue'
import Light from './../UI/Light.vue'
import Title from './../UI/Title.vue'
import { chart, visitors } from '../../api/lobby'
import Loader from '../UI/Loader.vue'
import LineChart from '../UI/Charts/LineChart.vue'
import { timestamp, datetime } from '../../helpers/timestamp'
import { on } from '../../modules/websocket'

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

const loading = ref(false)

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

const chartSize = ref(0)

let updateInterval

onMounted(() => {
    chartSize.value = Math.round(document.getElementById('online-chart')!.getBoundingClientRect().width - 5)
    
    loading.value = true

    chart(timestamp.now() - chartSize.value*60).then(r => {
        onlineChart.data = new Array<number[]|undefined>(chartSize.value)
        onlineChart.labels = new Array<string|undefined>(chartSize.value)

        let now = timestamp.nowMinute()
        let cur = now - (chartSize.value*60)
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

        loading.value = false
    })

    visitors().then(r => {
        visitorsRef.value = r.value
    })

    updateInterval = setInterval(() => {
        chart(timestamp.now() - 60).then(r => {
            onlineChart.data = [...onlineChart.data.slice(1), r[0] ? [r[0].online] : undefined]
            onlineChart.labels = [...onlineChart.labels.slice(1), r[0] ? datetime.from(r[0].timestamp) : undefined]
        })
    }, 60_000)

    onBeforeUnmount(on('online-changed', (msg) => {
        online.value = msg.value
    }))

    onBeforeUnmount(on('visitors-changed', (msg) => {
        visitorsRef.value = msg.value
    }))
})

onUnmounted(() => {
    clearInterval(updateInterval!)
})

</script>

<style scoped>
#online {
    width: 100%;
    height: 240px;
    display: grid;
    grid-template-columns: 1fr 180px;
}
#online-chart {
    padding: 5px 0px 5px 5px;
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
