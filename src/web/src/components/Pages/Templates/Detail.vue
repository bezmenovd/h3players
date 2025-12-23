<template>
    <div id="templates-detail">
        <Title text="">
            <template #in-text>
                <div :class="`template-name ${ templateClass }`">{{ templateName }}</div>
            </template>
        </Title>
        <template v-if="loading">
            <Loader :solid="false" />
        </template>
        <template v-else>
            <Panel id="template-overview" class="selectable">
                <div id="template-info">
                    <div class="template-info-column">
                        <div class="template-info-item" v-if="template.first_game">
                            <div class="template-info-item-label">{{ t('templates.detail.overview.first_game') }}</div>
                            <div class="template-info-item-value">
                                <div class="first-game-datetime">
                                    {{ datetime.from(template.first_game.start_timestamp) }}
                                </div>
                                <router-link :to="{ name: 'players.detail', params: { id: template.first_game.host_id }}">
                                    {{ template.first_game.host_name }}
                                </router-link>
                            </div>
                        </div>
                        <div class="template-info-item">
                            <div class="template-info-item-label">{{ t('templates.detail.overview.games_count') }}</div>
                            <div class="template-info-item-value">{{ gamesCount }}</div>
                        </div>
                        <div class="template-info-item">
                            <div class="template-info-item-label">{{ t('templates.detail.overview.games_duration') }}</div>
                            <div class="template-info-item-value">{{ gamesDuration }}</div>
                        </div>
                        <div class="template-info-item">
                            <div class="template-info-item-label">{{ t('templates.detail.overview.games_duration_avg') }}</div>
                            <div class="template-info-item-value">{{ gamesDurationAvg }}</div>
                        </div>
                    </div>
                    <div class="template-info-column">
                    </div>
                    <div class="template-info-column">
                        <div class="template-info-item">
                            <div class="template-info-item-label">{{ t('templates.detail.overview.players_count') }}</div>
                            <div class="template-info-item-value">{{ playersCount }}</div>
                        </div>
                        <div class="template-info-item">
                            <div class="template-info-item-label">{{ t('templates.detail.overview.players_avg_games_count') }}</div>
                            <div class="template-info-item-value">{{ playersAvgGamesCount }}</div>
                        </div>
                        <div class="template-info-item">
                            <div class="template-info-item-label">{{ t('templates.detail.overview.players_avg_duration') }}</div>
                            <div class="template-info-item-value">{{ playersAvgDuration }}</div>
                        </div>
                    </div>
                </div>
            </Panel>
            <Panel>
                <TabsSecondary :items="tabs"/>
            </Panel>
            <template v-if="tab === ''">
                <Panel id="templates-detail-games">
                    <LineChart 
                        v-if="chartGames.show" 
                        id="chart-games"
                        :size="chartGames.size"
                        :colors="['#0b73e3']" 
                        :data="chartGames.data" 
                        :labels="chartGames.labels" 
                        :max="chartGames.max" 
                        :formatters="chartGames.formatters"
                        :show-grid="true"
                        :x-labels="chartGames.xLabels"
                    />
                </Panel>
            </template>
            <template v-if="tab === 'duration'">
                <Panel id="templates-detail-duration">
                    <LineChart 
                        v-if="chartDuration.show" 
                        id="chart-duration"
                        :size="chartDuration.size"
                        :colors="['#e3700b']" 
                        :data="chartDuration.data" 
                        :labels="chartDuration.labels" 
                        :max="chartDuration.max" 
                        :formatters="chartDuration.formatters"
                        :show-grid="true"
                        :x-labels="chartDuration.xLabels"
                        :start-scroll-pos="2"
                    />
                </Panel>
            </template>
            <template v-if="tab === 'end_day'">
                <Panel id="templates-detail-end_day">
                    <LineChart 
                        v-if="chartEndDay.show" 
                        id="chart-end_day"
                        :size="chartEndDay.size"
                        :colors="['#e3b10b']" 
                        :data="chartEndDay.data" 
                        :labels="chartEndDay.labels" 
                        :max="chartEndDay.max" 
                        :formatters="chartEndDay.formatters"
                        :show-grid="true"
                        :x-labels="chartEndDay.xLabels"
                        :start-scroll-pos="2"
                    />
                </Panel>
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';
import Title from '../../UI/Title.vue';
import { useRoute } from 'vue-router';
import { getTemplate, Template, TemplateGamesChartItem, TemplatesDurationChartItem, TemplatesEndDayChartItem, TemplateStats } from '../../../api/templates';
import { useI18n } from 'vue-i18n';
import router from '../../../router';
import { ref } from 'vue';
import Loader from '../../UI/Loader.vue';
import Panel from '../../UI/Panel.vue';
import { useSettingsStore } from '../../../stores/settings';
import { pluralize, pluralizeEn, pluralizePl } from '../../../helpers/string';
import TabsSecondary from '../../UI/TabsSecondary.vue';
import { date, datetime } from '../../../helpers/timestamp';
import LineChart from '../../UI/Charts/LineChart.vue';
import { GameWithInfo } from '../../../api/games';

const settingsStore = useSettingsStore()

const route = useRoute()
const { t } = useI18n()

const template = reactive<{
    id: number
    name: string
    versions: Template[]
    stats: TemplateStats
    first_game: GameWithInfo|null,
    charts: {
        games: TemplateGamesChartItem[],
        duration: TemplatesDurationChartItem[],
        end_day: TemplatesEndDayChartItem[],
    }
}>({
    id: Number(route.params.id),
    name: '',
    versions: [],
    stats: {
        games_count: 0,
        games_duration: 0,
        players_count: 0,
    },
    first_game: null,
    charts: {
        games: [],
        duration: [],
        end_day: [],
    }
})

const tab = ref<string>('');
const tabs = ref([
    { code: '', name: t('templates.detail.tabs.games') },
    { code: 'duration', name: t('templates.detail.tabs.duration') },
    { code: 'end_day', name: t('templates.detail.tabs.end_day') },
])

watch(() => route.params.tab, (newTabCode) => {
    tab.value = newTabCode !== undefined ? String(newTabCode) : '';
}, { immediate: true });

const gamesCountFormatter = (count: number): string => {
    if (settingsStore.language === 1) {
        return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralize(count, 'игра', 'игры', 'игр')}`;
    }
    if (settingsStore.language === 3) {
        return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralizePl(count, 'gra', 'gry', 'gier')}`;
    }
    return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralizeEn(count, 'game')}`;
}

const chartGames = computed<{
    data: (number[]|undefined)[],
    labels: (string|undefined)[],
    show: boolean,
    formatters: ((value: number) => string)[],
    max: number[],
    size: number,
    xLabels: { [key: number]: string },
}>(() => ({
    data: template.charts.games.map(i => [i.games_count]),
    labels: template.charts.games.map(i => date.from(i.start_of_day)),
    show: template.charts.games.length > 0,
    formatters: [ gamesCountFormatter ],
    max: [template.charts.games.reduce((acc, i) => Math.max(acc, i.games_count), 0)],
    size: 183,
    xLabels: {},
}))

const chartDuration = computed<{
    data: (number[]|undefined)[],
    labels: (string|undefined)[],
    show: boolean,
    formatters: ((value: number) => string)[],
    max: number[],
    size: number,
    xLabels: { [key: number]: string },
}>(() => ({
    data: template.charts.duration.map(i => [i.games_count]),
    labels: template.charts.duration.map(i => ((minutes: number): string => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    })(i.duration)),
    show: template.charts.duration.length > 0,
    formatters: [ gamesCountFormatter ],
    max: [template.charts.duration.reduce((acc, i) => Math.max(acc, i.games_count), 0)],
    size: 183,
    xLabels: {},
}))

const chartEndDay = computed<{
    data: (number[]|undefined)[],
    labels: (string|undefined)[],
    show: boolean,
    formatters: ((value: number) => string)[],
    max: number[],
    size: number,
    xLabels: { [key: number]: string },
}>(() => ({
    data: template.charts.end_day.map(i => [i.games_count]),
    labels: template.charts.end_day.map(i => ((day: number): string => {
        if (day < 1) {
            return '?'
        }
        return `${Math.floor((day - 1) / 28) + 1} ${Math.floor((day - 1) / 7) % 4 + 1} ${(day - 1) % 7 + 1}`
    })(i.end_day)),
    show: template.charts.end_day.length > 0,
    formatters: [ gamesCountFormatter ],
    max: [template.charts.end_day.reduce((acc, i) => Math.max(acc, i.games_count), 0)],
    size: 56,
    xLabels: {},
}))

const loading = ref(true)

onMounted(() => {
    getTemplate(template.id).then(r => {
        template.name = r.template.name
        template.versions = r.versions
        template.stats = r.stats
        template.first_game = r.first_game
        template.charts = r.charts
        
        loading.value = false
    }).catch(err => {
        router.push({ name: 'templates' })
    })
})

const templateName = computed<string>((): string => {
    if (template.id === 1) {
        if (settingsStore.language === 1) {
            return `сценарий`;
        }
        if (settingsStore.language === 3) {
            return `scenariusz`;
        }
        return `scenario`;
    }
    
    if (template.name === '<Default>') {
        if (settingsStore.language === 1) {
            return 'по умолчанию';
        }
        if (settingsStore.language === 3) {
            return 'domyślny';
        }
        return 'default';
    }
    return template.name || '?'
})

const templateClass = computed<string>((): string => {
    if (template.id === 1) {
        return 'scenario'
    }
    if (template.name![0] === '<' && template.name![template.name!.length-1] === '>') {
        return 'blue'
    }
    if (template.name![0] === '[' && template.name![template.name!.length-1] === ']') {
        return 'gold'
    }
    return ''
})

const gamesCount = computed<string>((): string => {
    return `${ Intl.NumberFormat('ru-RU').format(template.stats.games_count) }`
})

const gamesDuration = computed<string>((): string => {
    const seconds = template.stats.games_duration;

    if (seconds < 60) {
        if (settingsStore.language === 1) return `${Intl.NumberFormat('ru-RU').format(seconds)} ${pluralize(seconds, 'секунда', 'секунды', 'секунд')}`;
        if (settingsStore.language === 3) return `${Intl.NumberFormat('ru-RU').format(seconds)} ${pluralizePl(seconds, 'sekunda', 'sekundy', 'sekund')}`;
        return `${Intl.NumberFormat('ru-RU').format(seconds)} ${pluralizeEn(seconds, 'second')}`;
    }

    if (seconds < 3600) {
        let minutes = Math.floor(seconds / 60);
        if (settingsStore.language === 1) return `${Intl.NumberFormat('ru-RU').format(minutes)} ${pluralize(minutes, 'минута', 'минуты', 'минут')}`;
        if (settingsStore.language === 3) return `${Intl.NumberFormat('ru-RU').format(minutes)} ${pluralizePl(minutes, 'minuta', 'minuty', 'minut')}`;
        return `${Intl.NumberFormat('ru-RU').format(minutes)} ${pluralizeEn(minutes, 'minute')}`;
    }

    let hours = Math.floor(seconds / 3600);
    if (settingsStore.language === 1) return `${Intl.NumberFormat('ru-RU').format(hours)} ${pluralize(hours, 'час', 'часа', 'часов')}`;
    if (settingsStore.language === 3) return `${Intl.NumberFormat('ru-RU').format(hours)} ${pluralizePl(hours, 'godzina', 'godziny', 'godzin')}`;
    return `${Intl.NumberFormat('ru-RU').format(hours)} ${pluralizeEn(hours, 'hour')}`;
})

const gamesDurationAvg = computed<string>((): string => {
    if (!template.stats.games_count || !template.stats.games_duration) {
        return '00:00';
    }

    const avgSeconds = Math.round(template.stats.games_duration / template.stats.games_count);
    
    const hours = Math.floor(avgSeconds / 3600);
    const minutes = Math.floor((avgSeconds % 3600) / 60);

    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');

    return `${h}:${m}`;
})

const playersAvgGamesCount = computed<string>((): string => {
    if (!template.stats.games_count || !template.stats.players_count) {
        return '0.00'
    }

    let value = template.stats.games_count / template.stats.players_count

    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value)
})

const playersAvgDuration = computed<string>((): string => {
    if (!template.stats.games_count || !template.stats.games_duration) {
        return '00:00';
    }

    const avgSeconds = Math.round(template.stats.games_duration / template.stats.players_count);
    
    const hours = Math.floor(avgSeconds / 3600);
    const minutes = Math.floor((avgSeconds % 3600) / 60);

    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');

    return `${h}:${m}`;
})

const playersCount = computed<string>((): string => {
    return `${ Intl.NumberFormat('ru-RU').format(template.stats.players_count || 0) }`
})

</script>

<style scoped>

#template-overview {
    display: grid;
    padding: 20px;
}
#template-info {
    display: flex;
    gap: 30px;
}
.template-info-column {
    gap: 20px;
    display: flex;
    flex-direction: column;
}
@media (max-width: 1600px) {
    .template-info-column {
        gap: 12px;
    }
}
#chart-template-rating{
    height: 560px;
}
@media (max-width: 1600px) {
    #chart-template-rating{
        height: 420px;
    }
}
.template-info-item {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 10px;
}
.template-info-item-label {
    opacity: .7;
    font-weight: 500;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.template-info-item-value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-variant-numeric: tabular-nums;
}
#templates-detail-games {
    padding: 20px;
    height: 300px;
}
#templates-detail-duration {
    padding: 20px;
    height: 300px;
}
#templates-detail-end_day {
    padding: 20px;
    height: 300px;
}
.first-game-datetime {
    opacity: .9;
    font-size: 15px;
    margin-right: 8px;
}
</style>
