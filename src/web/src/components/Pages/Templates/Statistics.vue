<template>
    <div id="templates-statistics">
        <Title :text="t('templates.statistics.title')"></Title>
        <Header>
            <!-- Selector -->
        </Header>
        <Panel id="templates-statistics-panel">
            <LineChart 
                v-if="chartStatistics.show" 
                id="chart-statistics"
                :size="chartStatistics.size"
                :colors="chartStatistics.colors!" 
                :data="chartStatistics.data" 
                :labels="chartStatistics.labels" 
                :max="chartStatistics.max" 
                :formatters="chartStatistics.formatters"
                :show-grid="true"
                :x-labels="chartStatistics.xLabels"
            />
        </Panel>
    </div>
</template>

<script setup lang="ts">
import Title from '../../UI/Title.vue';
import Panel from '../../UI/Panel.vue';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, reactive } from 'vue';
import { getStatistics, TemplatesStatisticsChartItem } from '../../../api/templates';
import { useSettingsStore } from '../../../stores/settings';
import { pluralize, pluralizeEn, pluralizePl } from '../../../helpers/string';
import LineChart from '../../UI/Charts/LineChart.vue';
import { date } from '../../../helpers/timestamp';
import Header from '../../UI/Table/Header.vue';
import Selector from '../../UI/Inputs/Selector.vue';

const settingsStore = useSettingsStore()

const { t } = useI18n()

const statistics = reactive<{
    chart: TemplatesStatisticsChartItem[],
}>({
    chart: []
})

const gamesCountFormatter = (count: number): string => {
    if (settingsStore.language === 1) {
        return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralize(count, 'игра', 'игры', 'игр')}`;
    }
    if (settingsStore.language === 3) {
        return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralizePl(count, 'gra', 'gry', 'gier')}`;
    }
    return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralizeEn(count, 'game')}`;
}

const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 65%, 55%)`;
}

const chartStatistics = computed(() => {
    if (statistics.chart.length === 0) {
        return { data: [], labels: [], show: false, formatters: [], max: [], size: 31, xLabels: {} };
    }

    const templateNames = Object.keys(statistics.chart[0].templates);

    const data = statistics.chart.map(day => Object.values(day.templates))

    const labels = statistics.chart.map(i => date.from(i.start_of_day));

    const colors = templateNames.map(name => stringToColor(name));

    const formatters = templateNames.map(name => {
        return (value: number) => {
            let displayName = name
            if (name === 'scenario') {
                displayName = t('templates.statistics.scenario')
            }
            if (name === '<Default>') {
                displayName = t('templates.statistics.default')
            }
            return `${displayName}: ${gamesCountFormatter(value)}`;
        };
    });

    const maxVal = Math.max(...data.flat(), 0);

    return {
        data,
        labels,
        show: true,
        formatters,
        max: templateNames.map(() => maxVal),
        size: 31,
        colors,
        xLabels: statistics.chart.reduce((acc, i, idx) => {
            if (idx % 7 === 0) acc[idx] = labels[idx];
            return acc;
        }, {} as { [key: number]: string }),
    };
});

onMounted(() => {
    getStatistics().then(r => {
        statistics.chart = r
    })
})

</script>

<style scoped>
#templates-statistics-panel {
    padding: 20px;
    height: 600px;
}
</style>
