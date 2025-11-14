<template>
    <div id="players">
        <Panel id="players-search">
            <div id="players-search-top">
                <span id="players-search-top-title">Найти игрока:</span>
                <div id="players-search-input-box"
                    :class="`${ searchResult.match ? 'match' : '' }`"
                >
                    <input 
                        type="text" id="players-search-input" spellcheck="false" maxlength="16" autocomplete="one-time-code"
                        @keydown="searchKeyDown" @keyup="searchKeyUp" v-model="searchValue"
                        @focus="searchFocus.focus()" @blur="searchFocus.blur()"
                        :disabled="searchDisabled"
                    />
                    <div id="players-search-found" v-show="searchFocus.is">
                        <div 
                            :class="`players-search-found-item ${key === searchResult.selected ? 'selected' : ''}`" 
                            v-for="(item, key) in searchResult.items" 
                            @click="selectItem(item)"
                        >
                            {{ item.name }}
                        </div>
                    </div>
                </div>
                <router-link :to="{ name: 'players.list' }" id="players-list-link">Список всех игроков</router-link>
            </div>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Panel from '../UI/Panel.vue'
import { search as apiSearch, Player } from '../../api/players'
import debounce from 'debounce'
import router from '../../router'

const searchValue = ref("")

const searchFocus = reactive({
    is: true,
    focus() {
        this.is = true
    },
    blur() {
        setTimeout(() => { this.is = false }, 100)
    }
})

const searchDisabled = ref(false)

const searchResult = reactive<{
    items: Player[]
    selected: number,
    lastQuery: string,
    match: boolean,
}>({
    items: [],
    selected: -1,
    lastQuery: '',
    match: false,
})

const searchKeyDown = async function(event: KeyboardEvent) {
    if (! ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
        return
    }

    event.preventDefault()
    event.stopPropagation()
    
    if (event.key === 'Enter') {
        if (searchResult.selected === -1) {
            return
        }

        searchDisabled.value = true
        searchValue.value = searchResult.items[searchResult.selected].name
        searchFocus.blur()

        setTimeout(() => {
            router.push({ name: 'players.detail', params: { id: searchResult.items[searchResult.selected].id }})
        }, 100)
        return
    }

    if (event.key === 'ArrowDown') {
        searchResult.selected = Math.min(searchResult.items.length-1, searchResult.selected+1)
        return
    }
    if (event.key === 'ArrowUp') {
        searchResult.selected = Math.max(0, searchResult.selected-1)
        return
    }
}

const searchKeyUp = async function(event: KeyboardEvent) {
    if (searchValue.value.length === 0) {
        searchResult.items = []
        searchResult.selected = -1
        searchResult.match = false
        return
    }

    if (searchValue.value === searchResult.lastQuery) {
        return
    }

    searchResult.match = false
    searchResult.selected = -1
    searchResult.lastQuery = searchValue.value
    searchResult.items = await apiSearch(searchValue.value)

    if (searchResult.items.length === 1) {
        searchResult.selected = 0
        searchResult.match = true
    } else {
        let match = searchResult.items.find(i => i.name.toUpperCase() === searchValue.value.toUpperCase())
        if (match) {
            searchResult.selected = searchResult.items.indexOf(match)
            searchResult.match = true
        }
    }
}

const selectItem = function(item: Player) {
    searchDisabled.value = true
    searchFocus.blur()
    searchValue.value = item.name
    setTimeout(() => {
        router.push({ name: 'players.detail', params: { id: item.id } })
    }, 100)
}

onMounted(async () => {
    document.getElementById("players-search-input")?.focus()
})
</script>

<style>
#players {
    height: 100%;
}
#players-search {
    height: 100%;
    display: grid;
    grid-template-rows: 50px 1fr;
    padding: 40px;
}
#players-search-top {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
#players-search-input {
    width: 400px;
    height: fit-content;
}
#players-search-input-box {
    position: relative;
}
#players-search-input-box.match::after {
    content: "Enter";
    position: absolute;
    right: 12px;
    color: #ffffff63;
    font-size: 17px;
    top: 50%;
    transform: translateY(-50%);
}
#players-search-found {
    position: absolute;
    top: 100%;
    width: 100%;
    background: #272c3a69;
}
#players-search-top-title {
    margin-right: 20px;
    font-size: 18px;
}
#players-list-link {
    position: absolute;
    right: 30px;
}
.players-search-found-item {
    padding: 8px 10px;
    border-bottom: 1px solid #272c3a;
}
.players-search-found-item:hover {
    background: #363a4c;
}
.players-search-found-item.selected {
    background: #363a4c;
}
</style>
