<template>
    <div id="post">
        <Loader v-if="loading" :solid="false"/>
        <template v-else>
            <Post :post="post.model!" />
            <div id="post-comments">
                <AddComment :post_id="post.model!.id" @onadd="router.go(0)" v-if="userStore.isAuthenticated && userStore.hasNoRestriction" />
                <CommentTree v-for="comment in postCommentsTree" :message="comment" />
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { getBySlug, PostWithInfo } from '../../../api/posts';
import router from '../../../router';
import Post from '../../UI/Posts/Post.vue';
import Loader from '../../UI/Loader.vue';
import AddComment from '../../UI/Posts/AddComment.vue';
import CommentTree from '../../UI/Posts/CommentTree.vue';
import { useUserStore } from '../../../stores/user';
import { buildTree, TNode } from '../../../helpers/tree';
import { MessageWithInfo } from '../../../api/messages';


const { t } = useI18n()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)

const post = reactive<{
    slug: string,
    model: PostWithInfo|null,
}>({
    slug: String(route.params.slug),
    model: null,
})

const postCommentsTree = computed<TNode<MessageWithInfo>[]>(() => {
    return buildTree(post.model!.comments)
})

onMounted(() => {
    getBySlug(post.slug).then(r => {
        post.model = r
        loading.value = false
    }).catch(err => {
        router.push({ name: 'posts' })
    })
})

</script>

<style scoped>
#post {
    max-width: 1000px;
    min-height: 400px;
    padding-bottom: 200px;
    position: relative;
    top: -40px;
}
#post-comments {
    margin-top: 20px;
    display: grid;
}
#post-comments-top {
    padding: 15px 20px;
    display: grid;
    grid-template-columns: 250px auto 1fr;
}
</style>

<style>
.post-top {
    position: sticky;
    top: -40px;
    background: #2e3245;
    z-index: 9;
}
@media (max-width: 1600px) {
    .post-top {
        top: -30px;
    }
}
.posts\.view #return-button {
    position: sticky !important;
    left: 0 !important;
    top: -35px !important;
    opacity: .3;
    cursor: pointer;
    transform: translate(-48px, 5px);
}
@media (max-width: 1600px) {
    .posts\.view #return-button {
        transform: translate(-38px,3px);
        top: -19px !important;
    }
}
.comment {
    margin-top: 20px;
}
.add-comment {
    margin-top: 20px;
}
.comment-replies > .tree-item {
    position: relative;
}
.comment-replies::before {
    position: relative;
    content: '';
    display: block;
    position: absolute;
    left: 25px;
    top: -20px;
    height: calc(100% + 20px);
    width: 1px;
    background: #2e3245;
}
.comment-replies::after {
    content: "";
    display: block;
    position: absolute;
    left: -25px;
    top: 0;
    height: 100%;
    width: 25px;
    background: #272c3a;
}
.comment-replies .tree-item::before {
    content: "";
    display: block;
    position: absolute;
    left: -25px;
    top: 50%;
    height: 1px;
    width: 25px;
    background: #2e3245;
}
.comment-replies .tree-item.last:after {
    content: "";
    display: block;
    position: absolute;
    left: -25px;
    top: calc(50% + 1px);
    height: 50%;
    width: 25px;
    background: #272c3a;
}
</style>
