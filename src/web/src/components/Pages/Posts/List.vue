<template>
    <div id="discussions-list">
        <div id="discussions">
            <div id="posts">
                <Header id="posts-top-panel">
                    <TextInput v-model="postsFilter.query" :placeholder="t('posts.filter.query')" :max-length="20"/>
                    <Selector v-model="postsFilter.sort.value" :items="postsFilter.sort.items"/>
                    <div id="posts-add">
                        <div 
                            v-if="userStore.hasNoRestriction()"
                            :class="{'btn': true, 'disabled': ! userStore.isAuthenticated }" 
                            @click="userStore.isAuthenticated && router.push({ name: 'posts.edit' })" 
                        >
                            <div class="btn-icon" style="background-image: url('/img/add.png')"/>
                            {{ t('posts.add') }}
                        </div>
                    </div>
                </Header>
                <div id="posts-list-wrapper">
                    <template v-if="postsFilter.waiting">
                        <div id="posts-list-loading">{{ t('posts.list.loading') }}</div>
                    </template>
                    <template v-else-if="posts.list.length === 0">
                        <div id="posts-list-empty">{{ t('posts.list.empty') }}</div>
                    </template>
                    <template v-else>
                        <template v-for="post in posts.list">
                            <Post :post="post" />
                        </template>
                    </template>
                </div>
            </div>
            <div id="discussions-panel">
                <Panel id="discussions-items">
                    <div :class="{'discussion': true, 'active': discussions.active === null }" @click="selectDiscussion(null)">
                        <div class="discussion-name">
                            {{ t('discussions.list.all') }}
                        </div>
                    </div>
                    <div :class="{'discussion': true, 'active': discussions.active?.id === discussion.id }" v-for="discussion in discussions.list" @click="selectDiscussion(discussion)">
                        <div class="discussion-name">
                            {{ discussion.name }}
                        </div>
                        <div class="discussion-posts-count" :hint="t('discussions.discussion.posts_count')">{{ discussion.posts_count }}</div>
                    </div>
                </Panel>
                <div id="discussions-add" v-if="userStore.hasPermission('discussions.add') && userStore.hasNoRestriction()">
                    <div class="btn" @click="addModal.show = true">
                        <div class="btn-icon" style="background-image: url('/img/add.png')"/>
                        {{ t('discussions.list.add.text') }}
                    </div>
                </div>
                <div id="discussions-info">
                    <div id="discussions-mot" @click="infoModal.show = true">{{ t('discussions.list.mot') }}</div>
                </div>
            </div>
        </div>
    </div>

    <Modal v-if="addModal.show" @close="addModal.show = false" :title="t('discussions.list.add_modal.title')">
        <div id="discussions-add-modal">
            <div id="discussions-add-modal-body">
                <TextInput 
                    id="discussions-add-modal-name-input" 
                    @keyup.enter="addDiscussion" 
                    :placeholder="t('discussions.list.add_modal.name')"
                    :requirements="t('discussions.list.add_modal.length')"
                    v-model="addModal.name" :max-length="32"
                />
            </div>
            <div 
                :class="{'btn': true, 'disabled': ! canAddDiscussion, 'waiting': addModal.waiting }" 
                :hint="addModal.name.length < 5 ? t('discussions.list.add_modal.min_length') : ''"
                @click="addDiscussion"
            >
                <div class="btn-icon" style="background-image: url('/img/save.png')" />
                {{ t('discussions.list.add_modal.save') }}
            </div>
        </div>
    </Modal>

    <Modal v-if="infoModal.show" @close="infoModal.show = false" :title="t('discussions.list.info_modal.title')">
        <div id="discussions-info-modal">
            <Markdown :source="info" class="markdown"/>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import Modal from '../../UI/Modal.vue';
import Header from '../../UI/Table/Header.vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../../stores/user';
import TextInput from '../../UI/Inputs/TextInput.vue';
import Selector from '../../UI/Inputs/Selector.vue';
import { add, DiscussionWithInfo, getList as getDiscussions } from '../../../api/discussions';
import { alerts } from '../../UI/alerts';
import Panel from '../../UI/Panel.vue';
import { getList as getPosts, PostWithInfo } from '../../../api/posts';
import router from '../../../router';
import { useRoute } from 'vue-router';
// @ts-ignore
import Markdown from 'vue3-markdown-it';
import ru from '../../../content/discussions/info/ru.md?raw';
import en from '../../../content/discussions/info/en.md?raw';
import pl from '../../../content/discussions/info/pl.md?raw';
import { useSettingsStore } from '../../../stores/settings';
import Post from '../../UI/Posts/Post.vue';
import { debounce } from '../../../helpers/functions';

const settingsStore = useSettingsStore()

const { t } = useI18n()
const route = useRoute()

const userStore = useUserStore()

const addModal = reactive({
    name: '',
    show: false,
    waiting: false,
})

const infoModal = reactive({
    show: false,
})

const info = ((): string => {
    if (settingsStore.language === 1) {
        return ru
    }
    if (settingsStore.language === 3) {
        return pl
    }
    return en
})()

const discussions = reactive<{
    list: DiscussionWithInfo[],
    active: DiscussionWithInfo|null,
}>({
    list: [],
    active: null,
})

const posts = reactive<{
    list: PostWithInfo[],
}>({
    list: [],
})

const postsFilter = reactive({
    query: route.query.query ? String(route.query.query) : '',
    sort: {
        value: route.query.sort ? String(route.query.sort) : 'new',
        items: [
            { code: 'new', text: t('posts.filter.sort.items.new') },
            { code: 'popular', text: t('posts.filter.sort.items.popular') },
            { code: 'top', text: t('posts.filter.sort.items.top') },
        ]
    },
    waiting: true
})

const updatePosts = debounce(() => {
    router.replace({
        query: {
            ...route.query,
            sort: postsFilter.sort.value,
            query: postsFilter.query,
        }
    })

    postsFilter.waiting = true

    getPosts(discussions.active?.id ?? null, postsFilter.sort.value, postsFilter.query).then(r => {
        posts.list = r
        postsFilter.waiting = false
    })
}, 300)

watch(() => [postsFilter.sort.value, postsFilter.query], () => updatePosts())

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

const selectDiscussion = (discussion: DiscussionWithInfo|null) => {
    discussions.active = discussion
    postsFilter.waiting = true

    getPosts(discussion?.id ?? null).then(r => {
        posts.list = r
        postsFilter.waiting = false
    })

    router.push({
        params: {
            ...route.params,
            discussion_id: discussion?.id ?? ''
        },
    });
}

const canAddDiscussion = computed<boolean>(() => {
    return addModal.name.trim().length >= 5
        && addModal.name.trim().length <= 32
})

onMounted(() => {
    const discussionId = route.params.discussion_id && Number.isFinite(Number(route.params.discussion_id)) 
        ? Number(route.params.discussion_id) 
        : null

    getDiscussions().then(r => {
        discussions.list = r
        discussions.active = r.find(d => d.id === discussionId) ?? null
    })
    getPosts(discussionId, postsFilter.sort.value, postsFilter.query).then(r => {
        posts.list = r
        postsFilter.waiting = false
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
    grid-template-columns: minmax(0px, 1000px) 300px;
    gap: 100px;
    padding-right: 20px;
}
@media (max-width: 1600px) {
    #discussions {
        grid-template-columns: 1fr 200px;
        gap: 50px;
    }
}
#discussions-panel {
    position: sticky;
    top: 0;
    height: fit-content;
}
#discussions-items {
    width: 300px;
    margin-right: auto;
    display: grid;
    gap: 1px;
    background: #272c3a;
}
@media (max-width: 1600px) {
    #discussions-items {
        width: 200px;
    }
}
#discussions-add {
    width: fit-content;
    margin-top: 10px;
    display: flex;
    justify-content: center;
}
#discussions-info {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}
#discussions-info-modal {
    width: 800px;
    padding: 20px;
}
#discussions-mot {
    opacity: .6;
    font-size: 14px;
    width: fit-content;
}
#discussions-mot:hover {
    cursor: pointer;
    opacity: .8;
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.726) inset;
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
#posts {
    display: grid;
    grid-template-rows: 50px 1fr;
    gap: 20px;
}
#posts-top-panel {
    display: grid;
    grid-template-columns: 250px 130px 1fr;
    gap: 15px;
    align-items: center;
    max-width: 1000px;
}
#posts-add {
    width: fit-content;
    margin-left: auto;
}
#posts-list-wrapper {
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding-top: 30px;

}
#posts-list-empty {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    opacity: .5;
}
#posts-list-loading {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    opacity: .5;
}

</style>
