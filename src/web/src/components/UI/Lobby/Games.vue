<template>
    <div class="games">
        <div class="game" v-for="item in props.items" :data-status="item.status">
            <div class="game-ago">{{ ago(item) }}</div>
            <div class="game-players">
                <div class="game-host">
                    <router-link :to="{ name: 'players.detail', params: { id: item.host_id }}">{{ item.host_name || '?' }}</router-link>
                </div>
                <div class="game-vs">
                    VS
                </div>
                <div class="game-opponent">
                    <router-link :to="{ name: 'players.detail', params: { id: item.opponent_id }}">{{ item.opponent_name || '?' }}</router-link>
                </div>
            </div>
            <div :class="`game-template ${templateClass(item)}`">{{ template(item) }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { GameWithInfo } from '../../../api/games';
import { pluralize, pluralizeEn, pluralizePl } from '../../../helpers/string';
import { timestamp } from '../../../helpers/timestamp';
import { useSettingsStore } from '../../../stores/settings';

const settingsStore = useSettingsStore()

const props = defineProps<{
    items: GameWithInfo[]
}>()

const now = ref(timestamp.now())

const ago = (game: GameWithInfo): string => {
    if (now.value - game.end_timestamp < 60) {
        if (settingsStore.language === 1) {
            return `только что`
        } else if (settingsStore.language === 2) {
            return `just now`
        } else if (settingsStore.language === 3) {
            return `właśnie`
        }
    }
    if (now.value - game.end_timestamp < 3600) {
        let count = Math.floor((now.value - game.end_timestamp) / 60)
        if (settingsStore.language === 1) {
            return `${count} ${pluralize(count, 'минуту', 'минуты', 'минут')} назад`
        } else if (settingsStore.language === 2) {
            return `${count} ${pluralizeEn(count, 'minute')} ago`
        } else if (settingsStore.language === 3) {
            return `${count} ${pluralizePl(count, 'minuta', 'minuty', 'minut')} temu`
        }
    }
    if (now.value - game.end_timestamp < 86400) {
        let count = Math.floor((now.value - game.end_timestamp) / 3600)
        if (settingsStore.language === 1) {
            return `${count} ${pluralize(count, 'час', 'часа', 'часов')} назад`;
        } else if (settingsStore.language === 2) {
            return `${count} ${pluralizeEn(count, 'hour')} ago`; 
        } else if (settingsStore.language === 3) {
            return `${count} ${pluralizePl(count, 'godzina', 'godziny', 'godzin')} temu`;
        }
    }

    let count = Math.floor((now.value - game.end_timestamp) / 86400)
    if (settingsStore.language === 1) {
        return `${count} ${pluralize(count, 'день', 'дня', 'дней')} назад`;
    } else if (settingsStore.language === 2) {
        return `${count} ${pluralizeEn(count, 'day')} ago`;
    } else if (settingsStore.language === 3) {
        return `${count} ${pluralizePl(count, 'dzień', 'dni', 'dni')} temu`;
    }
}

const template = (game: GameWithInfo): string => {
    if (game.game_type === 0) {
        if (settingsStore.language === 1) {
            return `сценарий`;
        } else if (settingsStore.language === 2) {
            return `scenario`;
        } else if (settingsStore.language === 3) {
            return `scenariusz`;
        }
    }
    
    if (game.template_name === '<Default>') {
        if (settingsStore.language === 1) {
            return 'по умолчанию';
        } else if (settingsStore.language === 2) {
            return 'default';
        } else if (settingsStore.language === 3) {
            return 'domyślny';
        }
    }
    return game.template_name || '?'
}

const templateClass = (game: GameWithInfo): string => {
    if (game.template_id === 1) {
        return 'scenario'
    }
    if (game.template_name![0] === '<' && game.template_name![game.template_name!.length-1] === '>') {
        return 'blue'
    }
    if (game.template_name![0] === '[' && game.template_name![game.template_name!.length-1] === ']') {
        return 'gold'
    }
    return ''
}

onMounted(() => {
    const updateNow = setInterval(() => {
        now.value = timestamp.now()
    }, 10000)

    onBeforeUnmount(() => {
        clearInterval(updateNow)
    })
})

</script>

<style scoped>
.game {
    height: 50px;
    width: 100%;
    display: grid;
    grid-template-columns: 6fr 19fr 8fr;
    gap: 10px;
    align-items: center;
    background: #2e3245;
}
.game:not(:last-of-type) {
    border-bottom: 1px solid #272c3a;
}
.game:hover {
    background: #363a4c;
}
.game-players {
    display: grid;
    grid-template-columns: 1fr 40px 1fr;
    align-items: center;
    height: 100%;
}
.game-ago {
    font-size: 12px;
    padding: 0 15px;
}
.game-host {
    height: 100%;
    padding: 0 10px;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: right;
    white-space: nowrap;
}
.game-vs {
    text-align: center;
    font-size: 12px;
    color: #878787;
}
.game-opponent {
    height: 100%;
    padding: 0 10px;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: left;
    white-space: nowrap;
}
.game-template {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 15px 0 0;
    white-space: nowrap;
}
.game-template.scenario {
    color: gray;
}
.game-template.blue {
    color: #7b7ba0;
}
.game-template.gold {
    color: #e6c24c;
}
.game[data-status="2"] .game-host::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(-90deg, #c757574d, #fff0 76%);
    opacity: .7;
    pointer-events: none;
}
.game[data-status="4"] .game-host::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(-90deg, #578ec74d, #fff0 76%);
    opacity: .7;
    pointer-events: none;
}
.game[data-status="8"] .game-host::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(-90deg, #5bc7574d, #fff0 76%);
    opacity: .7;
    pointer-events: none;
}
.game[data-status="2"] .game-opponent::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #5bc7574d, #fff0 76%);
    opacity: .7;
    pointer-events: none;
}
.game[data-status="4"] .game-opponent::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #578ec74d, #fff0 76%);
    opacity: .7;
    pointer-events: none;
}
.game[data-status="8"] .game-opponent::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #c757574d, #fff0 76%);
    opacity: .7;
    pointer-events: none;
}
</style>
