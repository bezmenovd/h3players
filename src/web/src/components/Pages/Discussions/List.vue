<template>
    <div id="discussions-list">
        <Title :text="t('discussions.list.title')"></Title>
        <div id="discussions">
            <div id="posts">
                posts
            </div>
            <div id="discussions-panel">
                <Panel id="discussions-items">
                    <div :class="{'discussion': true, 'active': discussions.active?.id === discussion.id }" v-for="discussion in discussions.list" @click="selectDiscussion(discussion)">
                        <div class="discussion-name">
                            {{ discussion.name }}
                        </div>
                        <div class="discussion-posts-count" :hint="t('discussions.discussion.posts_count')">{{ discussion.posts_count }}</div>
                    </div>
                </Panel>
                <div id="discussions-add">
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
                </div>
            </div>
        </div>
    </div>

    <Modal v-if="addModal.show" @close="addModal.show = false" :title="t('discussions.list.add_modal.title')">
        <div id="discussions-add-modal">
            <div id="discussions-add-modal-body">
                <TextInput @keyup.enter="addDiscussion" id="discussions-add-modal-name-input" :placeholder="t('discussions.list.add_modal.name')" v-model="addModal.name" :max-length="32"/>
            </div>
            <div 
                :class="{'btn': true, 'disabled': addModal.name.trim().length < 5, 'waiting': addModal.waiting }" 
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
import { add, DiscussionWithInfo, getList as getDiscussions } from '../../../api/discussions';
import { alerts } from '../../UI/alerts';
import Panel from '../../UI/Panel.vue';
import { getList as getPosts, PostWithInfo } from '../../../api/posts';

const { t } = useI18n()

const userStore = useUserStore()

const addModal = reactive({
    name: '',
    show: false,
    waiting: false,
})

const discussions = reactive<{
    list: DiscussionWithInfo[],
    active: DiscussionWithInfo|null,
}>({
    list: [],
    active: null,
})

const posts = reactive<{
    list: PostWithInfo[],
    show: boolean,
}>({
    list: [],
    show: false,
})

const addDiscussion = () => {
    if (addModal.waiting) {
        return
    }

    addModal.waiting = true

    add(addModal.name).then(d => {
        alerts.send('', t('discussions.list.add_modal.success'))
        addModal.show = false
        addModal.name = ''
        getDiscussions().then(r => {
            discussions.list = r
        })
    }).catch((err) => {
        if (err.response.data.message.split(':')[0] === 'failed_moderation') {
            alerts.send('error', err.response.data.message.split(':')[1])
        } else {
            alerts.send('error', t('discussions.list.add_modal.errors.' + err.response.data.message))
        }
    }).finally(() => {
        addModal.waiting = false
    })
}

const selectDiscussion = (discussion: DiscussionWithInfo) => {
    discussions.active = discussion

    getPosts(discussion.id).then(r => {
        posts.list = r
        posts.show = true
    })
}

onMounted(() => {
    getDiscussions().then(r => {
        discussions.list = r
    })
    getPosts().then(r => {
        posts.list = r
        posts.show = true
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
#discussions {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 30px;
}
#discussions-items {
    width: 300px;
    display: grid;
    gap: 1px;
    background: #272c3a;
}
#discussions-add {
    width: fit-content;
    margin-top: 10px;
    display: flex;
    justify-content: center;
}
.discussion {
    display: flex;
    padding: 10px;
    background: #2e3245;
    justify-content: space-between;
    align-items: center;
}
.discussion-name {
    font-size: 15px;
}
.discussion:not(.active) * {
    opacity: .7;
}
.discussion:not(.active):hover {
    cursor: pointer;
}
.discussion:not(.active):hover * {
    opacity: .85;
}
.discussion.active {
    background: #ffffff1a;
}
.discussion-posts-count {
    font-variant-numeric: tabular-nums;
    color: gray;
}

</style>
