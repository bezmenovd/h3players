<template>
    <div id="discussions-list">
        <Title :text="t('discussions.list.title')">
            <template v-if="userStore.isAuthenticated">
                <div class="btn" @click="addModal.show = true">
                    <div class="btn-icon" style="background-image: url('/img/add.png')"/>
                    {{ t('discussions.list.add.text') }}
                </div>
            </template>
            <template v-else>
                <div class="btn disabled" :hint="t('discussions.list.add.authentication_required')">
                    <div class="btn-icon" style="background-image: url('/img/add.png')"/>
                    {{ t('discussions.list.add.text') }}
                </div>
            </template>
        </Title>
        <template v-if="discussions.list.length > 0">
            <div id="discussions-list-items">
                <Panel class="discussion" v-for="discussion in discussions.list" @click="router.push({ name: 'discussions.posts', params: { slug: discussion.slug }})">
                    <div class="discussion-name">{{ discussion.name }}</div>
                    <div class="discussion-activity">123</div>
                    <div class="discussion-player">
                        <div class="discussion-player-text">Создал:</div>
                        <router-link :to="{ name: 'players.detail', params: { id: discussion.player_id }}">{{ discussion.player_name }}</router-link>
                        <div class="discussion-created-at">{{ datetime.from(discussion.created_at) }}</div>
                    </div>
                </Panel>
            </div>
        </template>
        <template v-else>
            <div id="discussions-empty">{{ t('discussions.list.empty') }}</div>
        </template>
    </div>

    <Modal v-if="addModal.show" @close="addModal.show = false" :title="t('discussions.list.add_modal.title')">
        <div id="discussions-add-modal">
            <div id="discussions-add-modal-body">
                <TextInput id="discussions-add-modal-name-input" :placeholder="t('discussions.list.add_modal.name')" v-model="addModal.name" :max-length="255"/>
            </div>
            <div 
                :class="{'btn': true, 'disabled': addModal.name.length < 5, 'waiting': addModal.waiting }" 
                :hint="addModal.name.length < 5 ? t('discussions.list.add_modal.min_length') : ''"
                @click="addDiscussion"
            >
                <div class="btn-icon" style="background-image: url('/img/save.png')" />
                {{ t('discussions.list.add_modal.save') }}
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import Title from '../../UI/Title.vue';
import Modal from '../../UI/Modal.vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../../stores/user';
import TextInput from '../../UI/Inputs/TextInput.vue';
import { add, DiscussionWithInfo, getList } from '../../../api/discussions';
import { alerts } from '../../UI/alerts';
import Panel from '../../UI/Panel.vue';
import router from '../../../router';
import { datetime } from '../../../helpers/timestamp';

const { t } = useI18n()

const userStore = useUserStore()

const addModal = reactive({
    name: '',
    show: false,
    waiting: false,
})

const discussions = reactive<{
    list: DiscussionWithInfo[],
}>({
    list: [],
})

const addDiscussion = () => {
    addModal.waiting = true

    add(addModal.name).then(d => {
        alerts.send('', t('discussions.list.add_modal.success'))
        addModal.show = false
        addModal.name = ''
        getList().then(r => {
            discussions.list = r
        })
    }).catch((err) => {
        alerts.send('error', t('discussions.list.add_modal.errors.' + err.response.data.message))
    }).finally(() => {
        addModal.waiting = false
    })
}

onMounted(() => {
    getList().then(r => {
        discussions.list = r
    })
})

</script>

<style scoped>
#discussions-add-modal {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
}
#discussions-add-modal-body {
    display: grid;
    gap: 10px;
}
#discussions-add-modal-name-input {
    width: 400px;
}
#discussions-add-modal .btn {
    width: 100px;
}
#discussions-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 100px;
    height: 100px;
    font-size: 20px;
    opacity: .5;
    font-weight: 500;
}
#discussions-list-items {
    display: grid;
    gap: 20px;
    margin-top: 10px;
}
.discussion {
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 200px 250px;
}
.discussion:hover {
    background: #32364a;
    cursor: pointer;
}
.discussion-player {
    display: flex;
    gap: 6px;
}
.discussion-player-text {
    opacity: .6;
}
.discussion-created-at {
    opacity: .8;
}

</style>
