<template>
    <div id="players">
        <Title text="Найти игрока">
            <router-link :to="{ name: 'players.list' }" id="players-list-link">Список всех игроков</router-link>
        </Title>

        <Panel id="players-search">
            <div id="players-search-top">
                <Search :maxlength="16" @select="searchSelect" :func="searchFunc" id="players" placeholder="Введите ник"/>
            </div>
            <div id="players-search-bottom">
                <div class="players-search-history" v-if="searchHistory.items.value.length > 0">
                    <div class="players-search-history-title">История</div>
                    <div class="players-search-history-items">
                        <div class="players-search-history-item" v-for="item in searchHistory.items.value">
                            <router-link :to="{ name: 'players.detail', params: { id: item.id }}">{{ item.name }}</router-link>
                        </div>
                    </div>
                </div>
                <div class="players-search-history" v-if="popular.items.length > 0">
                    <div class="players-search-history-title">Популярные</div>
                    <div class="players-search-history-items">
                        <div class="players-search-history-item" v-for="item in popular.items">
                            <router-link :to="{ name: 'players.detail', params: { id: item.id }}">{{ item.name }}</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Panel from '../UI/Panel.vue'
import Title from '../UI/Title.vue'
import Search from '../UI/Inputs/Search.vue'
import { search, Player } from '../../api/players'
import router from '../../router'
import { SearchItem } from '../UI/Inputs/search'
import { useSearchHistory } from './players'

const searchFunc = async (value: string): Promise<SearchItem[]> => {
    return search(value).then((players: Player[]) => players.map((p: Player): SearchItem => ({
        id: p.id,
        text: p.name
    })))
}

const searchSelect = (item: SearchItem) => {
    setTimeout(() => {
        searchHistory.add({ id: item.id, name: item.text })
    }, 200)
    setTimeout(() => {
        router.push({ name: 'players.detail', params: item })
    }, 100)
}

const searchHistory = useSearchHistory()
searchHistory.load()

const popular = reactive<{
    items: Player[],
}>({
    items: []
})

onMounted(() => {
    document.getElementById("players-search-input")?.focus()
})
</script>

<style>
#players {
    
}
#players-search {
    height: 100%;
    padding: 40px;
}
#players-search-top {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
}
#players-search-input {
    width: 400px;
}
#players-search-bottom {
    margin-top: 80px;
    display: grid;
    grid-template-columns: 1fr 1fr;
}
.players-search-history {
}
.players-search-history-title {
    padding: 10px;
    color: gray;
    font-size: 20px;
}
.players-search-history-items {
    display: grid;
    /* grid-template-columns: 1fr 1fr; */
    gap: 15px;
    padding: 15px 10px;
    grid-template-columns: 1fr 1fr;
}

@media (max-width: 1600px) {
    #players-search-top {
        margin-top: 20px;
    }
    #players-search-bottom {
        margin-top: 30px;
    }
}
</style>
