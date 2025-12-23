<template>
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
                    <Post :post="post" :trim="true"/>
                </template>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getList as getPosts, PostWithInfo } from '../../../api/posts';
import { debounce } from '../../../helpers/functions';
import router from '../../../router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../../stores/user';
import TextInput from '../Inputs/TextInput.vue';
import Selector from '../Inputs/Selector.vue';
import Header from '../Table/Header.vue';
import Post from './Post.vue';


const userStore = useUserStore()

const { t } = useI18n()

const props = defineProps<{
    discussion_id: number|null
}>()


const posts = reactive<{
    list: PostWithInfo[],
}>({
    list: [],
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

    getPosts(props.discussion_id, postsFilter.sort.value, postsFilter.query).then(r => {
        posts.list = r
        postsFilter.waiting = false
    })
}, 300)

const route = useRoute()

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

watch(() => [postsFilter.sort.value, postsFilter.query], () => updatePosts())
watch(() => props.discussion_id, () => {
    postsFilter.waiting = true

    getPosts(props.discussion_id).then(r => {
        posts.list = r
        postsFilter.waiting = false
    })
})

onMounted(() => {
    getPosts(props.discussion_id, postsFilter.sort.value, postsFilter.query).then(r => {
        posts.list = r
        postsFilter.waiting = false
    })
})

</script>

<style scoped>
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
