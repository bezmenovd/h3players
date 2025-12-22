<template>
    <div class="templates-list">
        <div class="template" v-for="template in props.items">
            <div :class="`template-name ${nameClass(template)}`">
                <router-link :to="{ name: 'templates.detail', params: { id: template.id } }">
                    {{ name(template) }}
                </router-link>
            </div>
            <div class="template-games-count">{{ gamesCount(template) }}</div>
            <div class="template-games-duration">{{ gamesDuration(template) }}</div>
            <div class="template-players-count">{{ playersCount(template) }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { TemplateWithInfo } from '../../../../api/templates';
import { pluralize, pluralizeEn, pluralizePl } from '../../../../helpers/string';
import { useSettingsStore } from '../../../../stores/settings';

const settingsStore = useSettingsStore()

const props = defineProps<{
    items: TemplateWithInfo[],
}>()

const name = (template: TemplateWithInfo): string => {
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
}

const nameClass = (template: TemplateWithInfo): string => {
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
}

const gamesCount = (template: TemplateWithInfo): string => {
    if (settingsStore.language === 1) {
        return `${ Intl.NumberFormat('ru-RU').format(template.games_count) } ${pluralize(template.games_count, 'игра', 'игры', 'игр')}`;
    }
    if (settingsStore.language === 3) {
        return `${ Intl.NumberFormat('ru-RU').format(template.games_count) } ${pluralizePl(template.games_count, 'gra', 'gry', 'gier')}`;
    }
    return `${ Intl.NumberFormat('ru-RU').format(template.games_count) } ${pluralizeEn(template.games_count, 'game')}`;
}

const gamesDuration = (template: TemplateWithInfo): string => {
    const seconds = template.games_duration;

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
}

const playersCount = (template: TemplateWithInfo): string => {
    const count = template.players_count || 0;
    
    if (settingsStore.language === 1) {
        return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralize(count, 'игрок', 'игрока', 'игроков')}`;
    }
    if (settingsStore.language === 3) {
        return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralizePl(count, 'gracz', 'graczy', 'graczy')}`;
    }
    return `${ Intl.NumberFormat('ru-RU').format(count) } ${pluralizeEn(count, 'player')}`;
}

</script>

<style scoped>
.template {
    height: 50px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 200px 200px 1fr;
    align-items: center;
    background: #2e3245;
}
.template-name {
    /* font-size: 13px; */
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 15px 0 0;
    white-space: nowrap;
    display: flex;
    align-items: baseline;
}
.template:not(:last-of-type) {
    border-bottom: 1px solid #272c3a;
}
.template:hover {
    background: #363a4c;
}
.template-name {
    padding: 0 15px 0 25px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.template-games-count {
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}
.template-games-duration {
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}
.template-players-count {
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}
</style>
