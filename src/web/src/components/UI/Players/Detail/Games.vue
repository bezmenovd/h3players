<template>
    <div class="games">
        <div class="game" v-for="item in props.items" :data-status="(item.is_win ? 'win' : (item.is_loss ? 'loss' : 'draw'))">
            <div class="game-end">{{ end(item) }}</div>
            <div class="game-duration">{{ duration(item) }}</div>
            <div class="game-end-day">{{ endDay(item) }}</div>
            <div class="game-players">
                <div :class="`game-host-town h3 h3-towns-${ (h3.towns as any)[item.player_town] }`"></div>
                <div :class="`game-host-hero h3 h3-heroes-small-${ (h3.heroes as any)[item.player_hero] }`"></div>
                {{ item.player_hero }}
                <div class="game-player">
                    <router-link :to="{ name: 'players.detail', params: { id: item.player_id }}">{{ item.player_name || '?' }}</router-link>
                    <Rating :value="item.player_new_rating" />
                    <RatingDiff :value="item.player_new_rating - item.player_old_rating" />
                </div>
                <div class="game-vs">
                    VS
                </div>
                <div class="game-opponent">
                    <router-link :to="{ name: 'players.detail', params: { id: item.opponent_id }}">{{ item.opponent_name || '?' }}</router-link>
                    <Rating :value="item.opponent_new_rating" />
                    <RatingDiff :value="item.opponent_new_rating - item.opponent_old_rating" />
                </div>
                <div :class="`game-opponent-town h3 h3-towns-${ (h3.towns as any)[item.opponent_town] }`"></div>
                <div :class="`game-opponent-hero h3 h3-heroes-small-${ (h3.heroes as any)[item.opponent_hero] }`"></div>
                {{ item.opponent_hero }}
            </div>
            <div class="game-size">{{ size(item) }}</div>
            <div :class="`game-template ${templateClass(item)}`">{{ template(item) }}</div>
            <div class="game-id">{{ item.game_id }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { GameVWithInfo } from '../../../../api/games_v';
import { datetime, timestamp } from '../../../../helpers/timestamp';
import RatingDiff from '../../RatingDiff.vue';
import Rating from '../../Rating.vue';
import h3 from '../../../../meta/h3.json'


const props = defineProps<{
    items: GameVWithInfo[],
}>()

const now = ref(timestamp.now())

const end = (game: GameVWithInfo): string => {
    return datetime.from(game.end_timestamp)
}

const duration = (game: GameVWithInfo): string => {
    let minutes = Math.floor((game.end_timestamp - game.start_timestamp) / 60)
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

const endDay = (game: GameVWithInfo): string => {
    if (game.end_day < 1) {
        return '?'
    }
    return `${Math.floor((game.end_day - 1) / 28) + 1} ${Math.floor((game.end_day - 1) / 7) % 4 + 1} ${(game.end_day - 1) % 7 + 1}`
}

const size = (game: GameVWithInfo): string => {
    if (game.size === 0) {
        return ''
    }
    return ({
        36: 'S',
        72: 'M',
        108: 'L',
        144: 'XL',
        180: 'H',
        216: 'XH',
        252: 'G'
    }[game.size] ?? '') + (game.levels === 2 ? '+U' : '')
}

const template = (game: GameVWithInfo): string => {
    if (game.template_id === 1) {
        return `сценарий`
    }
    if (game.template_name === '<Default>') {
        return 'по умолчанию'
    }
    return game.template_name || '?'
}

const templateClass = (game: GameVWithInfo): string => {
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
    grid-template-columns: 120px 45px 50px 780px 40px 6fr 100px;
    gap: 10px;
    align-items: center;
    background: #2e3245;
    padding: 0 10px;
    position: relative;
}
.h3 {
    opacity: .7;
    filter: grayscale(.4);
}
.game:not(:last-of-type) {
    border-bottom: 1px solid #272c3a;
}
.game:hover {
    background: #363a4c;
}
.game-players {
    display: grid;
    padding: 0 30px;
    grid-template-columns: 48px 48px 20px 1fr 40px 1fr 48px 48px 20px;
    align-items: center;
    height: 100%;
}
.game-end {
    font-size: 12px;
    padding: 0 5px;
    font-variant-numeric: tabular-nums;
    text-align: center;
    opacity: .8;
    letter-spacing: .5px;
}
.game-duration {
    font-size: 12px;
    padding: 0 5px;
    font-variant-numeric: tabular-nums;
    text-align: center;
    opacity: .9;
    letter-spacing: .5px;
}
.game-end-day {
    font-size: 12px;
    padding: 0 5px;
    font-variant-numeric: tabular-nums;
    text-align: center;
    opacity: .9;
    letter-spacing: .5px;
    text-align: right;
}
.game-size {
    text-align: center;
    opacity: .7;
    font-size: 14px;
}
.game-player {
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
    gap: 7px;
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
    gap: 7px;
}
.game-template {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10px 0 20px;
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
.game[data-status="loss"] .game-player::before {
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
.game[data-status="draw"] .game-player::before {
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
.game[data-status="win"] .game-player::before {
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
.game[data-status="loss"] .game-opponent::before {
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
.game[data-status="draw"] .game-opponent::before {
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
.game[data-status="win"] .game-opponent::before {
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
.game-id {
    font-size: 12px;
    padding: 0 5px;
    font-variant-numeric: tabular-nums;
    text-align: center;
    opacity: .9;
    letter-spacing: .5px;
}
</style>
