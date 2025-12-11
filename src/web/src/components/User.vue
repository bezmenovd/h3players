<template>
    <div id="user">
        <div id="user-auth">
            <div id="user-auth-btn" class="btn" @click="showAuthModal = true">
                <div id="user-icon"></div>
                Войти через лобби
            </div>
        </div>
    </div>

    <Modal v-if="showAuthModal" @close="showAuthModal = false">
        <div id="user-auth-modal">
            <div id="user-auth-modal-info" @click.stop>
                Для авторизации нужно отправить сообщение с кодом на аккаунт <span id="user-auth-modal-info-h3players" @click="copy('h3players')">h3players</span> в лобби
            </div>
            <div id="user-auth-modal-search-input">
                <Search :maxlength="16" @select="searchSelect" :func="searchFunc" id="auth-player" placeholder="Введите ваш ник в лобби"/>
            </div>
            <template v-if="code">
                <div id="user-auth-modal-code">
                    <div id="user-auth-modal-code-value" @click="copy(code)">
                        {{ code }}
                    </div>
                </div>
                <div id="user-auth-modal-status">{{ authDone ? 'Сообщение получено' : 'Сообщение пока не получено' }}</div>
            </template>
            <template v-else>
                <div id="user-auth-modal-no-code">
                    Код появится после выбора игрока
                </div>
            </template>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Modal from './UI/Modal.vue';
import Search from './UI/Inputs/Search.vue'
import { search, Player } from '../api/players'
import { SearchItem } from './UI/Inputs/search'
import { on } from '../modules/websocket';

const showAuthModal = ref(false)

const code = ref('')
const playerId = ref(0)
const authDone = ref(false)

const searchFunc = async (value: string): Promise<SearchItem[]> => {
    return search(value).then((players: Player[]) => players.map((p: Player): SearchItem => ({
        id: p.id,
        text: p.name
    })))
}

const searchSelect = (item: SearchItem) => {
    playerId.value = item.id
    code.value = String(Math.round(Math.random() * 899999 + 100000))

    on('auth', (msg) => {
        authDone.value = true
        setTimeout(() => {
            showAuthModal.value = false
        }, 3000)
    }, { playerId: playerId.value, code: code.value })
}

const copy = (value: string) => {
    navigator.clipboard.writeText(value)
}

onMounted(() => {
    code.value = ''
    playerId.value = 0
})

</script>

<style scoped>
#user {
    margin-top: auto;
}
#user-auth {
    display: grid;
    align-items: center;
    padding: 10px 20px 0;
}
#user-icon {
    width: 20px;
    height: 20px;
    background: url('/img/user.png');
    background-size: 14px 14px;
    background-position: 50% 50%;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .5;
}
#user-auth-modal {
    width: 400px;
    padding: 40px 20px;
}
#user-auth-modal-info {
    text-align: center;
}
#user-auth-modal-info-h3players {
    cursor: pointer;
    border-bottom: 1px dashed #dedede;
}
#user-auth-modal-info-h3players:active {
    background: #ffffff44;
}
#user-auth-modal-search-input {
    margin-top: 40px;
}
#user-auth-modal-code {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    font-size: 30px;
    font-weight: 500;
    opacity: .5;
    text-transform: uppercase;
    font-variant-numeric: tabular-nums;
}
#user-auth-modal-no-code {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    font-weight: 500;
    opacity: .5;
    text-transform: uppercase;
    font-variant-numeric: tabular-nums;
}
#user-auth-modal-code-value {
    cursor: pointer;
    border-bottom: 1px dashed #dedede;
}
#user-auth-modal-code-value:active {
    background: #ffffff44;    
}
#user-auth-modal-code-timer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    opacity: .5;
    font-variant-numeric: tabular-nums;
}
#user-auth-modal-status {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
}

</style>
