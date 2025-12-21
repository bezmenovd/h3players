<template>
    <div id="user">
        <template v-if="userStore.isAuthenticated">
            <div id="user-info">
                <router-link :to="{ name: 'players.detail', params: { id: userStore.player.id } }" style="max-width: min-content">{{ userStore.player.name }}</router-link>
                <div id="user-settings-button" class="btn" style="padding: 5px 4px" @click="showSettingsModal = true">
                    <div class="user-settings-icon"></div>
                </div>
            </div>
        </template>
        <template v-else>
            <div id="user-auth">
                <div id="user-auth-btn" class="btn" @click="showAuthModal = true">
                    <div id="user-icon"></div>
                    {{ t('user.login_btn') }}
                </div>
                <div id="user-settings-button" class="btn" style="padding: 5px 4px" @click="showSettingsModal = true">
                    <div class="user-settings-icon"></div>
                </div>
            </div>
        </template>
    </div>

    <Modal v-if="showAuthModal" @close="showAuthModal = false" :title="t('user.auth_modal.title')">
        <div id="user-auth-modal">
            <div id="user-auth-modal-info" @click.stop>
                {{ t('user.auth_modal.info.part1') }} <span id="user-auth-modal-info-h3players" @click="copy('h3players')">h3players</span> {{ t('user.auth_modal.info.part2') }}
            </div>
            <div id="user-auth-modal-search-input">
                <Search :maxlength="16" @select="searchSelect" :func="searchFunc" id="auth-player" :placeholder="t('user.auth_modal.input')"/>
            </div>
            <template v-if="code">
                <div id="user-auth-modal-code">
                    <div id="user-auth-modal-code-value" @click="copy(code)">
                        {{ code }}
                    </div>
                </div>
                <div id="user-auth-modal-status">{{ status }}</div>
            </template>
            <template v-else>
                <div id="user-auth-modal-no-code">
                    {{ t('user.auth_modal.no_code') }}
                </div>
            </template>
        </div>
    </Modal>

    <Modal v-if="showSettingsModal" @close="showSettingsModal = false" :title="t('user.settings_modal.title')">
        <div id="user-settings-modal">
            <div id="user-settings">
                <div class="user-settings-item">
                    <div class="user-settings-item-label">
                        {{ t('user.settings_modal.settings.language') }}
                        <div id="user-settings-icon-language" class="user-settings-item-icon" />
                    </div>
                    <div class="user-settings-item-value">
                        <Dropdown :value="settingsStore.language" :items="languages" @select="item => item.id !== settingsStore.language && reopen() && settingsStore.setLanguage(item.id)" style="width: 90px"/>
                    </div>
                </div>
                <div class="user-settings-item" v-if="userStore.isAuthenticated">
                    <div class="user-settings-item-label">{{ t('user.settings_modal.settings.account.text') }}</div>
                    <div class="user-settings-item-value">
                        <div id="user-settings-logout-btn" class="btn" @click="userStore.logout()" style="width: 90px">
                            <div id="user-settings-logout-btn-icon" />
                            {{ t('user.settings_modal.settings.account.btn') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Modal from './UI/Modal.vue';
import Search from './UI/Inputs/Search.vue'
import { search, Player } from '../api/players'
import { SearchItem } from './UI/Inputs/search'
import { Listener, on } from '../modules/websocket';
import { useUserStore } from '../stores/user';
import { useSettingsStore } from '../stores/settings';
import Dropdown from './UI/Inputs/Dropdown.vue';
import languages from '../content/languages.json'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const showAuthModal = ref(false)
const showSettingsModal = ref(Boolean(localStorage.getItem('temp:settings:reopen')))

const code = ref('')
const playerId = ref(0)
const status = ref('')
let authListener: Listener

const userStore = useUserStore()
const settingsStore = useSettingsStore()

const searchFunc = async (value: string): Promise<SearchItem[]> => {
    return search(value).then((players: Player[]) => players.map((p: Player): SearchItem => ({
        id: p.id,
        text: p.name
    })))
}

const searchSelect = (item: SearchItem) => {
    if (authListener) {
        authListener.unsubscribe()
    }

    status.value = t('user.auth_modal.message_not_received_yet')

    playerId.value = item.id
    code.value = String(Math.round(Math.random() * 899999 + 100000))

    authListener = on('auth', (msg) => {
        status.value = 'Сообщение получено'
        userStore.setToken(msg.token)
        setTimeout(() => {
            showAuthModal.value = false
        }, 3000)
    }, { playerId: playerId.value, code: code.value })

    authListener.onDisconnect(() => {
        status.value = t('user.auth_modal.lost_connection')
        code.value = t('user.auth_modal.code_invalidated')
        copy('')
    })
}

const copy = (value: string) => {
    navigator.clipboard.writeText(value)
}

const reopen = () => {
    localStorage.setItem('temp:settings:reopen', '1')
    return true
}

onMounted(() => {
    if (authListener) {
        authListener.unsubscribe()
    }

    code.value = ''
    playerId.value = 0

    localStorage.removeItem('temp:settings:reopen')
})

</script>

<style scoped>
#user {
    margin-top: auto;
    margin-bottom: 10px;
    padding: 10px 20px 0;
}
#user-info {
    display: flex;
    align-items: center;
    padding: 8px 0;
    display: grid;
    gap: 4px;
    grid-template-columns: 1fr 30px;
}
#user-auth {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 30px;
}
#user-auth-btn {
    padding: 8px 8px;
    display: flex;
    align-items: center;
    gap: 10px;
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
    opacity: .25;
}
.user-settings-icon {
    width: 30px;
    height: 20px;
    background-image: url('/img/settings.png');
    background-size: 14px 14px;
    background-position: 50% 50%;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .5;
    /* position: relative;
    top: 1px; */
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
    text-align: center;
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
    text-align: center;
}
#user-settings {
    display: grid;
    padding: 20px;
    gap: 20px;
}
.user-settings-item {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 10px;
}
.user-settings-item-label {
    opacity: .7;
    font-weight: 500;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.user-settings-item-value {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-variant-numeric: tabular-nums;
}
#user-settings-logout-btn {
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 0px;
}
#user-settings-logout-btn-icon {
    width: 20px;
    height: 20px;
    background-image: url('/img/logout.png');
    background-size: 14px 14px;
    background-position: 50% 50%;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .5;
    position: relative;
    left: -5px;
}
.user-settings-item-icon {
    width: 20px;
    height: 20px;
    margin-left: 8px;
    background-size: 17px 17px;
    background-position: 50% 50%;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .4;
    position: relative;
    left: -2px;
}
#user-settings-icon-language {
    background-image: url('/img/language.png');
}
</style>
