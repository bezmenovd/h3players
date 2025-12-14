<template>
    <div id="players">
        <Title :text="t('players.search.title')">
            <ListButton @click="router.push({ name: 'players.list' })"/>
        </Title>

        <Panel id="players-search">
            <div id="players-search-top">
                <div id="players-search-input-wrapper">
                    <Search :maxlength="16" @select="searchSelect" :func="searchFunc" id="players" :placeholder="t('players.search.input.text')"/>
                </div>
            </div>
            <div id="players-search-bottom">
                <div class="players-search-history" v-if="searchHistory.items.value.length > 0">
                    <div class="players-search-history-title">{{ t('players.search.history.title') }}</div>
                    <div class="players-search-history-items">
                        <div class="players-search-history-item" v-for="item in searchHistory.items.value">
                            <router-link :to="{ name: 'players.detail', params: { id: item.id }}">{{ item.name }}</router-link>
                            <div class="players-search-history-item-removebtn" @click="searchHistory.remove(item.id)">×</div>
                        </div>
                    </div>
                </div>
                <div class="players-search-history" v-if="popular.items.length > 0">
                    <div class="players-search-history-title">{{ t('players.search.popular.title') }}</div>
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
import Panel from '../../UI/Panel.vue'
import Title from '../../UI/Title.vue'
import Search from '../../UI/Inputs/Search.vue'
import { search, Player } from '../../../api/players'
import router from '../../../router'
import { SearchItem } from '../../UI/Inputs/search'
import { useSearchHistory } from '../players'
import ListButton from '../../UI/Buttons/ListButton.vue'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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

<style scoped>
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
#players-search-input-wrapper {
    width: 400px;
}
#players-search-bottom {
    margin-top: 80px;
    display: grid;
    grid-template-columns: 1fr 1fr;
}
.players-search-history {
}
.players-search-history-item {
    display: flex;
    gap: 15px;
    justify-content: space-between;
    padding: 5px 0;
}
.players-search-history-item:hover .players-search-history-item-removebtn {
    opacity: .7;
}
.players-search-history-item-removebtn {
    font-size: 26px;
    height: 20px;
    line-height: 21px;
    font-weight: 500;
    width: 20px;
    text-align: center;
    opacity: 0;
    cursor: pointer;
}
.players-search-history-item-removebtn:hover {
    opacity: 1;
}
.players-search-history-title {
    padding: 10px;
    color: gray;
    font-size: 20px;
}
.players-search-history-items {
    display: grid;
    /* grid-template-columns: 1fr 1fr; */
    row-gap: 5px;
    column-gap: 30%;
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
