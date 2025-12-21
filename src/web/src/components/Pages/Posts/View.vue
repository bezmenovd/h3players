<template>
    <div id="post">
        <Loader v-if="loading" :solid="false"/>
        <template v-else>
            <Post :post="post.model!" />
            <div id="post-comments">
                <AddComment :post_id="post.model!.id"/>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { getBySlug, PostWithInfo } from '../../../api/posts';
import { alerts } from '../../UI/alerts';
import router from '../../../router';
import Post from '../../UI/Posts/Post.vue';
import Loader from '../../UI/Loader.vue';
import AddComment from '../../UI/Posts/AddComment.vue';


const { t } = useI18n()
const route = useRoute()

const loading = ref(true)

const post = reactive<{
    slug: string,
    model: PostWithInfo|null,
}>({
    slug: String(route.params.slug),
    model: null,
})

onMounted(() => {
    getBySlug(post.slug).then(r => {
        post.model = r
        loading.value = false
    }).catch(err => {
        alerts.send('error', t('errors.' + err.response.status))

        router.push({ name: 'posts' })
    })
})

onMounted(() => {
    document.body.classList.add('post-view');
});

onBeforeUnmount(() => {
    document.body.classList.remove('post-view');
});

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
.post-view #return-button {
    position: sticky !important;
    left: 0 !important;
    top: -35px !important;
    opacity: .3;
    cursor: pointer;
    transform: translate(-48px, 5px);
}
@media (max-width: 1600px) {
    .post-view #return-button {
        transform: translate(-38px,3px);
        top: -19px !important;
    }
}
</style>
