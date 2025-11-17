<template>
    <div class="search-input-box"
        :class="{ 'match' : searchResult.match, 'notFound': searchResult.notFound, 'empty': searchValue.length === 0, 'disabled': searchDisabled }"
        :data-placeholder="props.placeholder"
    >
        <input 
            :id="`${props.id}-search-input`"
            type="text" class="search-input" spellcheck="false" :maxlength="props.maxlength" autocomplete="one-time-code"
            @keydown="searchKeyDown" @keyup="searchKeyUp" v-model="searchValue"
            @focus="searchFocus.focus()" @blur="searchFocus.blur()"
        />
        <div class="search-found" v-show="searchFocus.is">
            <div 
                :class="`search-found-item ${key === searchResult.selected ? 'selected' : ''}`" 
                v-for="(item, key) in searchResult.items" 
                @click="selectItem(item)"
            >
                {{ item.text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, defineProps } from 'vue'
import { SearchItem } from './search'

const props = defineProps<{
    id: string
    maxlength: number
    func: (value: string) => Promise<SearchItem[]>
    placeholder: string
}>()

const emit = defineEmits({
    select(item: SearchItem) {}
})

const searchValue = ref("")

const searchFocus = reactive({
    is: true,
    focus() {
        this.is = true
    },
    blur() {
        setTimeout(() => { this.is = false }, 200)
    }
})

const searchDisabled = ref(false)

const searchResult = reactive<{
    items: SearchItem[]
    selected: number,
    lastQuery: string,
    match: boolean,
    notFound: boolean,
}>({
    items: [],
    selected: -1,
    lastQuery: '',
    match: false,
    notFound: false,
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
        searchResult.match = false
        searchValue.value = searchResult.items[searchResult.selected].text
        searchFocus.blur()
        emit('select', searchResult.items[searchResult.selected])
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
    if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
        return
    }

    if (searchValue.value.length === 0) {
        searchResult.items = []
        searchFocus.focus()
        searchDisabled.value = false
        searchResult.match = false
        searchResult.notFound = false
        searchResult.selected = -1
        return
    }

    if (searchValue.value === searchResult.lastQuery) {
        return
    }

    searchFocus.focus()
    searchDisabled.value = false
    searchResult.match = false
    searchResult.notFound = false
    searchResult.selected = -1

    searchResult.lastQuery = searchValue.value
    searchResult.items = await props.func(searchValue.value)

    if (searchResult.items.length === 0) {
        searchResult.notFound = true
    } else if (searchResult.items.length === 1) {
        searchResult.selected = 0
        searchResult.match = true
    } else {
        let match = searchResult.items.find(i => i.text.toUpperCase() === searchValue.value.toUpperCase())
        if (match) {
            searchResult.selected = searchResult.items.indexOf(match)
            searchResult.match = true
        }
    }
}

const selectItem = function(item: SearchItem) {
    searchDisabled.value = true
    searchResult.match = false
    searchFocus.blur()
    searchValue.value = item.text
    emit('select', item)
}
</script>

<style scoped>
.search-input {
    height: fit-content;
}
.search-input-box {
    position: relative;
}
.search-input-box.empty::before {
    content: attr(data-placeholder);
    pointer-events: none;
    position: absolute;
    left: 12px;
    color: #ffffff63;
    font-size: 17px;
    top: 50%;
    transform: translateY(-50%);
}
.search-input-box.match::after {
    content: "Enter";
    position: absolute;
    pointer-events: none;
    right: 12px;
    color: #ffffff63;
    font-size: 17px;
    top: 50%;
    transform: translateY(-50%);
}
.search-input-box.notFound::after {
    content: "Не найден";
    pointer-events: none;
    position: absolute;
    right: 12px;
    color: #ffffff63;
    font-size: 17px;
    top: 50%;
    transform: translateY(-50%);
}
.search-input-box.disabled input {
    background: #363c4b;
}
.search-found {
    position: absolute;
    top: 100%;
    width: 100%;
    background: #272c3a;
}
.search-top-title {
    margin-right: 20px;
    font-size: 18px;
}
.list-link {
    border-bottom: 2px solid rgba(255, 255, 255, 0.432);
}
.list-link:hover {
    border-bottom: 2px solid rgba(255, 255, 255, 0.726);
}
.search-found-item {
    padding: 8px 10px;
    border-bottom: 1px solid #272c3a;
}
.search-found-item:hover {
    background: #363a4c;
}
.search-found-item.selected {
    background: #363a4c;
}
</style>
