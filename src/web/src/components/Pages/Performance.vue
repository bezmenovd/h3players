<template>
    <div id="lobby">
        <Title text="Суммарная нагрузка"></Title>
        <Loader v-if="loading" :solid="false"/>
        <template v-else>
            <Panel id="performance">
                <div id="performance-chart">
                    <LineChart 
                        v-if="totalChart.show" 
                        id="chart-performance-total"
                        :height="200" 
                        :colors="['#ff5e00', '#00d3ff', '#ff7700', '#0090ff']" 
                        :data="totalChart.data" 
                        :labels="totalChart.labels" 
                        :max="max"
                        :formatters="totalChart.formatters"
                        :showNoData="false"
                    />
                </div>
            </Panel>
        </template>
        <div id="workers">
            <template v-for="(chart, worker) in workers.charts">
                <div class="worker-chart" :id="`performance-chart-worker-${worker}`">
                    <Title :text="String(worker)"></Title>
                    <Panel class="worker-chart-inner">
                        <LineChart 
                            v-if="chart.show" 
                            :id="`chart-performance-worker-${worker}`"
                            :height="200"
                            :colors="['#ff5e00', '#00d3ff', '#ff7700', '#0090ff']" 
                            :data="chart.data" 
                            :labels="chart.labels" 
                            :max="max"
                            :formatters="totalChart.formatters"
                            :showNoData="false"
                        />
                    </Panel>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, onUnmounted, nextTick } from 'vue'
import Panel from './../UI/Panel.vue'
import Title from './../UI/Title.vue'
import { getChart } from '../../api/performance'
import Loader from '../UI/Loader.vue'
import LineChart from '../UI/Charts/LineChart.vue'
import { timestamp, datetime } from '../../helpers/timestamp'
import { formatBytes } from '../../helpers/bytes'
import { pluralize } from '../../helpers/string'

const totalChart = reactive<{
    size: number,
    data: (number[]|undefined)[],
    labels: (string|undefined)[],
    show: boolean,
    formatters: ((value: number) => string)[],
}>({
    size: 0,
    data: [],
    labels: [],
    show: false,
    formatters: [
        (value: number) => `отправлено ${formatBytes(value)}`,
        (value: number) => `получено ${formatBytes(value)}`,
        (value: number) => `отправлено ${value} ${pluralize(value, 'сообщение', 'сообщения', 'сообщений')}`,
        (value: number) => `получено ${value} ${pluralize(value, 'сообщение', 'сообщения', 'сообщений')}`,
    ],
})

const workers = reactive<{
    charts: {
        [key: string]: {
            data: (number[]|undefined)[],
            labels: (string|undefined)[],
            show: boolean,
        }
    }
}>({
    charts: {}
})

const max = computed(() => {
    if (totalChart.data.length === 0) {
        return [0,0,0,0]
    }

    let received_bytes_max = Math.max(...totalChart.data.map(i => i ? i[1] : 0).filter(v => v))
    let received_messages_max = Math.max(...totalChart.data.map(i => i ? i[3] : 0).filter(v => v))

    return [received_bytes_max, received_bytes_max, received_messages_max, received_messages_max]
})

const loading = ref(false)

let updateInterval

onMounted(() => {
    totalChart.size = Math.round(document.getElementById('performance-chart')!.getBoundingClientRect().width / 3)
    
    loading.value = true

    getChart(timestamp.now() - totalChart.size*60).then(async (r) => {
        totalChart.data = new Array<number[]|undefined>(totalChart.size)
        totalChart.labels = new Array<string|undefined>(totalChart.size)

        let now = timestamp.nowMinute()
        let cur = now - (totalChart.size*60)
        let dIndex = 0
        let rIndex = 0

        while (cur <= now) {
            while (rIndex+1 < r.length && r[rIndex].timestamp < cur) {
                rIndex++
            }
            
            while (rIndex < r.length && r[rIndex].timestamp === cur) {
                if (totalChart.data[dIndex] === undefined) {
                    totalChart.data[dIndex] = [r[rIndex].sent_bytes, r[rIndex].received_bytes, r[rIndex].sent_messages, r[rIndex].received_messages]
                } else {
                    totalChart.data[dIndex]![0] += r[rIndex].sent_bytes
                    totalChart.data[dIndex]![1] += r[rIndex].received_bytes
                    totalChart.data[dIndex]![2] += r[rIndex].sent_messages
                    totalChart.data[dIndex]![3] += r[rIndex].received_messages
                }
                if (r[rIndex].name) {
                    let wChartIndex = dIndex - (totalChart.size-50)
                    if (wChartIndex >= 0) {
                        if (! (r[rIndex].name in workers.charts)) {
                            workers.charts[r[rIndex].name] = {
                                data: new Array<number[]|undefined>(50),
                                labels: new Array<string|undefined>(50),
                                show: false,
                            }
                        }
                        if (workers.charts[r[rIndex].name].data[wChartIndex] === undefined) {
                            workers.charts[r[rIndex].name].data[wChartIndex] = [r[rIndex].sent_bytes, r[rIndex].received_bytes, r[rIndex].sent_messages, r[rIndex].received_messages]
                        } else {
                            workers.charts[r[rIndex].name].data[wChartIndex]![0] += r[rIndex].sent_bytes
                            workers.charts[r[rIndex].name].data[wChartIndex]![1] += r[rIndex].received_bytes
                            workers.charts[r[rIndex].name].data[wChartIndex]![2] += r[rIndex].sent_messages
                            workers.charts[r[rIndex].name].data[wChartIndex]![3] += r[rIndex].received_messages
                        }
                        workers.charts[r[rIndex].name].labels[wChartIndex] = datetime.from(r[rIndex].timestamp)
                    }
                }
                
                totalChart.labels[dIndex] = datetime.from(r[rIndex].timestamp)
                rIndex++
            }

            cur += 60
            dIndex++
        }

        totalChart.show = true

        await nextTick()

        for (let worker in workers.charts) {
            workers.charts[worker]!.show = true
        }

        loading.value = false
    })
})

onUnmounted(() => {
    clearInterval(updateInterval!)
})

</script>

<style scoped>
#performance {
    width: 100%;
    height: 210px;
}
#performance-chart {
    padding: 5px 5px 5px 5px;
    height: 100%;
}
#workers {
    margin-top: 30px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 40px;
}
.worker-chart {
    height: 260px;
    display: grid;
    grid-template-rows: 50px 210px;
}
.worker-chart-inner {
    padding: 5px;
}

@media (max-width: 1600px) {
    #workers {
        margin-top: 20px;
    }
}
</style>
