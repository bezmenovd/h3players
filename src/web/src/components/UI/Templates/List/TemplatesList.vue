<template>
    <div class="templates-list">
        <div class="template" v-for="template in props.items">
            <div :class="`template-name ${nameClass(template)}`">
                <!-- <router-link :to="{ name: 'template.detail', params: { id: player.id } }"> -->
                    {{ name(template) }}
                <!-- </router-link> -->
            </div>
            <div class="template-games-count">{{ gamesCount(template) }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { TemplateWithInfo } from '../../../../api/templates';
import { pluralize } from '../../../../helpers/string';

const props = defineProps<{
    items: TemplateWithInfo[],
}>()

const name = (template: TemplateWithInfo): string => {
    if (template.id === 1) {
        return `сценарий`
    }
    if (template.name === '<Default>') {
        return 'по умолчанию'
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
    return `${ Intl.NumberFormat('ru-RU').format(template.games_count) } ${ pluralize(template.games_count, 'игра', 'игры', 'игр') }`
}

</script>

<style scoped>
.template {
    height: 50px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    background: #2e3245;
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
.template-name.scenario {
    color: gray;
}
.template-name.blue {
    color: #7b7ba0;
}
.template-name.gold {
    color: #e6c24c;
}
.template-games-count {
    font-variant-numeric: tabular-nums;
}
</style>
