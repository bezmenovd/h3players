<template>
    <div id="about">
        <Title :text="t('about.title')">
            <Tabs :items="tabs"/>
        </Title>
        <template v-if="tab === ''">
            <Panel id="overview">
                <Markdown :source="about" class="markdown"/>
            </Panel>
        </template>
        <template v-if="tab === 'load'">
            <Panel id="load">
                <Loader v-if="loading" :solid="false"/>
                <template v-else>
                    <Panel id="performance">
                        <div id="performance-chart">
                            <div class="load-chart-title">{{ t('about.load.total.title') }}</div>
                            <LineChart 
                                v-if="totalChart.show" 
                                id="chart-performance-total"
                                :colors="['#ff5e00', '#00d3ff', '#ff7700', '#0090ff']" 
                                :data="totalChart.data" 
                                :labels="totalChart.labels" 
                                :max="max"
                                :formatters="totalChart.formatters"
                            />
                        </div>
                    </Panel>
                </template>
                <div id="workers">
                    <template v-for="(chart, worker) in workers.charts">
                        <div class="worker-chart" :id="`performance-chart-worker-${worker}`">
                            <div class="load-chart-title">{{ String(worker) }}</div>
                            <Panel class="worker-chart-inner">
                                <LineChart 
                                    v-if="chart.show" 
                                    :id="`chart-performance-worker-${worker}`"
                                    :colors="['#ff5e00', '#00d3ff', '#ff7700', '#0090ff']" 
                                    :data="chart.data" 
                                    :labels="chart.labels" 
                                    :max="max"
                                    :formatters="totalChart.formatters"
                                />
                            </Panel>
                        </div>
                    </template>
                </div>
            </Panel>
        </template>
        <template v-if="tab === 'api'">
            <Panel id="api">
                <div id="endpoints">
                    <div class="endpoint selectable" v-for="url in Object.keys(api)">
                        <div class="first-line">
                            <div class="method"> {{ (api as any)[url].method }} </div>
                            <div class="url">https://h3players.com/api{{ url }}</div>
                        </div>
                        <div class="query">
                            Query Parameters: 
                            <div class="query-param" v-for="parameter in Object.keys((api as any)[url].query)">
                                <div class="query-param-name">{{ parameter }}</div>
                                <div class="query-param-type">{{ (api as any)[url].query[parameter].type }}</div>
                                <div :class="{'query-param-required': true, [(api as any)[url].query[parameter].required ? 'required' : 'optional']: true }">
                                    {{ (api as any)[url].query[parameter].required ? 'required' : 'optional' }}
                                </div>
                                <div class="query-param-hint">{{ (api as any)[url].query[parameter].hint }}</div>
                            </div>
                        </div>
                        <div class="limits">
                            Limits:
                            <div class="limits-unauthorized">
                                Unauthorized
                                <div class="limits-items">
                                    <div class="limits-item">{{ (apiConfig.limits.ip as any)[`/api${url}`].minute }}/m</div>
                                    <div class="limits-item">{{ (apiConfig.limits.ip as any)[`/api${url}`].hour }}/h</div>
                                    <div class="limits-item">{{ (apiConfig.limits.ip as any)[`/api${url}`].day }}/d</div>
                                </div>
                            </div>
                            <div class="limits-authorized">
                                Authorized
                                <div class="limits-items">
                                    <div class="limits-item">{{ (apiConfig.limits.token as any)[`/api${url}`].minute }}/m</div>
                                    <div class="limits-item">{{ (apiConfig.limits.token as any)[`/api${url}`].hour }}/h</div>
                                    <div class="limits-item">{{ (apiConfig.limits.token as any)[`/api${url}`].day }}/d</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="authorization">
                    {{ t('about.api.authorization.text') }}
                </div>
            </Panel>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, reactive, nextTick } from 'vue';
import Title from './../UI/Title.vue'
import Tabs from '../UI/Tabs.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import Panel from '../UI/Panel.vue';
import { useSettingsStore } from '../../stores/settings';
import { getChart } from '../../api/performance'
import Loader from '../UI/Loader.vue'
import LineChart from '../UI/Charts/LineChart.vue'
import { timestamp, datetime } from '../../helpers/timestamp'
import { formatBytes } from '../../helpers/bytes'
import { pluralize, pluralizeEn, pluralizePl } from '../../helpers/string'
import ru from '../../content/about/ru.md?raw';
import en from '../../content/about/en.md?raw';
import pl from '../../content/about/pl.md?raw';
// @ts-ignore
import Markdown from 'vue3-markdown-it';
import api from '../../content/api.json'
import apiConfig from '../../../../api/src/config.json'

const settingsStore = useSettingsStore()

const { t } = useI18n();

const route = useRoute()

const tab = ref<string>('');
const tabs = [
    {
        code: '', 
        name: t('about.tabs.overview')
    }, { 
        code: 'load', 
        name: t('about.tabs.load'),
    }, { 
        code: 'api', 
        name: t('about.tabs.api'),
    }
]

const about = (() => {
    if (settingsStore.language === 1) {
        return ru
    }
    if (settingsStore.language === 3) {
        return pl
    }
    return en
})()

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
        (value: number) => (() => {
            if (settingsStore.language === 1) {
                return `отправлено ${formatBytes(value)}`
            }
            if (settingsStore.language === 3) {
                return `wysłano ${formatBytes(value)}`
            }
            return `sent ${formatBytes(value)}`
        })(),
        (value: number) => (() => {
            if (settingsStore.language === 1) {
                return `получено ${formatBytes(value)}`
            }
            if (settingsStore.language === 3) {
                return `odebrano ${formatBytes(value)}`
            }
            return `received ${formatBytes(value)}`
        })(),
        (value: number) => (() => {
            if (settingsStore.language === 1) {
                return `отправлено ${value} ${pluralize(value, 'сообщение', 'сообщения', 'сообщений')}`
            }
            if (settingsStore.language === 3) {
                return `wysłano ${value} ${pluralizePl(value, 'wiadomość', 'wiadomości', 'wiadomości')}`
            }
            return `sent ${value} ${pluralizeEn(value, 'message')}`
        })(),
        (value: number) => (() => {
            if (settingsStore.language === 1) {
                return `получено ${value} ${pluralize(value, 'сообщение', 'сообщения', 'сообщений')}`
            }
            if (settingsStore.language === 3) {
                return `odebrano ${value} ${pluralizePl(value, 'wiadomość', 'wiadomości', 'wiadomości')}`
            }
            return `received ${value} ${pluralizeEn(value, 'message')}`
        })(),
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

const showLoad = () => {
    workers.charts = {}

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
}

watch(() => route.params.tab, async (newTabCode) => {
    tab.value = newTabCode !== undefined ? String(newTabCode) : '';
    if (newTabCode === 'load') {
        await nextTick()
        showLoad()
    }
}, { immediate: true });

</script>

<style scoped>
#about {
    display: grid;
}
#overview {
    padding: 20px;
}
#overview .markdown {
    max-width: 1000px;
}
#performance {
    width: 100%;
    height: 210px;
}
#performance-chart {
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
    grid-template-rows: 30px 210px;
}
@media (max-width: 1600px) {
    #workers {
        margin-top: 20px;
    }
}
.load-chart-title {
    margin-bottom: 10px;
    opacity: .8;
}

#load {
    padding: 20px;
    gap: 20px;
    display: grid;
}
#api {
    padding: 20px;
    display: grid;
    gap: 30px;
}
#endpoints {
    display: grid;
    gap: 20px;
    opacity: .9;
}
.endpoint {
    display: grid;
    padding-left: 20px;
    border-left: 3px solid #ffffff42;
}
.first-line {
    display: flex;
    gap: 5px;
}
.query {
    opacity: .8;
}
.query-param {
    display: grid;
    gap: 5px;
    grid-template-columns: 100px 100px 100px 1fr;
    margin-left: 20px;
}
.query-param-name {
    font-weight: 700;
}
.query-param-required.required {
    color: #ff8500;
}
.query-param-required.optional {
    color: yellow;
}
.limits {
    opacity: .8;
}
.limits-unauthorized {
    padding-left: 20px;
}
.limits-authorized {
    padding-left: 20px;
}
.limits-items {
    display: grid;
    font-variant-numeric: tabular-nums;
    grid-template-columns: 80px 80px 80px;
    font-size: 14px;
}
.limits-item {
    text-align: right;
}
</style>
