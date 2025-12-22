<template>
    <div id="post-edit">
        <Title :text="title"></Title>
        <Panel id="edit-panel">
            <div id="edit-wrapper">
                <div id="edit-title-group">
                    <TextInput 
                        v-model="post.title" 
                        :placeholder="t('posts.edit.title.placeholder')" 
                        :requirements="t('posts.edit.title.requirements')" 
                        :max-length="100"
                    />
                    <Dropdown :value="post.discussion_id" :items="discussions"/>
                </div>
                <div id="edit-text-group">
                    <Textarea 
                        v-model="post.text" 
                        ref="textareaRef"
                        :placeholder="t('posts.edit.text.placeholder')"
                        :requirements="t('posts.edit.text.requirements')"
                        :max-length="10000"
                    />
                    <div id="edit-text-preview" ref="previewRef">
                        <Markdown :source="post.text" class="markdown"/>
                    </div>
                </div>
                <div id="post-save">
                    <div 
                        :class="{'btn': true, 'disabled': ! canSavePost, 'waiting': waiting }"
                        @click="savePost"
                        >
                        <div class="btn-icon" style="background-image: url('/img/save.png')" />
                        {{ t('posts.edit.save') }}
                    </div>
                </div>
            </div>
        </Panel>
    </div>

    <Loader v-if="waiting" :text="t('posts.loader_text')"/>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import Title from '../../UI/Title.vue';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, reactive, watch } from 'vue';
import { ref } from 'vue';
import Panel from '../../UI/Panel.vue';
import TextInput from '../../UI/Inputs/TextInput.vue';
import Textarea from '../../UI/Inputs/Textarea.vue';
import Dropdown from '../../UI/Inputs/Dropdown.vue';
import { getList } from '../../../api/discussions';
import { add, update } from '../../../api/posts';
import { alerts } from '../../UI/alerts';
import { throttle } from '../../../helpers/functions';
import Loader from '../../UI/Posts/Loader.vue';
import router from '../../../router';
// @ts-ignore
import Markdown from 'vue3-markdown-it';


const { t } = useI18n()
const route = useRoute()

const loading = ref(true)

const postId = route.params.id && Number.isFinite(Number(route.params.id)) ? Number(route.params.id) : null

const post = reactive({
    id: postId,
    title: postId ? '' : localStorage.getItem('tmp:posts:add:title') ?? '',
    text: postId ? '' : localStorage.getItem('tmp:posts:add:text') ?? '',
    discussion_id: -1,
})

const waiting = ref(false)

const canSavePost = computed(() => {
    return post.title.length >= 5 
        && post.title.length <= 32
        && post.text.length >= 10
        && post.text.length <= 10000
})

const savePost = () => {
    if (waiting.value) {
        return
    }

    waiting.value = true

    const apiCall = post.id 
        ? update(post.id, post.title, post.text, post.discussion_id)
        : add(post.title, post.text, post.discussion_id)
    
    apiCall.then(() => {
        waiting.value = false
        alerts.send('', t('posts.edit.success'))
        localStorage.removeItem('tmp:posts:add:title')
        localStorage.removeItem('tmp:posts:add:text')

        router.push({ name: 'posts', params: { discussion_id: post.discussion_id } })
    }).catch(err => {
        if (err.response.data.message.split(':')[0] === 'failed_moderation') {
            alerts.send('error', err.response.data.message.split(':')[1])
        } else {
            alerts.send('error', t('posts.edit.errors.' + err.response.data.message))
        }
    })
}

const discussions = ref<{ id: number, text: string }[]>([])

const title = computed<string>(() => {
    if (route.params.id) {
        if (loading.value) {
            return ''
        } else {
            return post.title
        }
    } else {
        return t('posts.edit.new_post')
    }
})

const saveTemporary = throttle(() => {
    localStorage.setItem('tmp:posts:add:title', post.title)
    localStorage.setItem('tmp:posts:add:text', post.text)
}, 1000)

watch(() => [post.title, post.text], saveTemporary)

onMounted(() => {
    getList().then(r => {
        discussions.value = r.sort((a, b) => a.posts_count - b.posts_count).map(d => ({
            id: d.id,
            text: d.name,
        }))
        post.discussion_id = discussions.value[0].id
    })
})

const textareaRef = ref(null);
const previewRef = ref<HTMLElement | null>(null);

const syncScroll = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    // @ts-ignore
    const preview = previewRef.value;

    if (!textarea || !preview) return;

    const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);

    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
}

onMounted(() => {
    if (textareaRef.value) {
        const el = (textareaRef.value as any).$el || textareaRef.value;
        
        if (el) {
            el.addEventListener('wheel', syncScroll);
        }
    }
});

</script>

<style scoped>
#edit-panel {
    padding: 20px;
}
#edit-wrapper {
    display: grid;
    grid-template-rows: 38px 1fr 50px;
    gap: 20px;
    height: calc(100vh - 200px);
    max-height: 800px;
}
#edit-title-group {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: 20px;
}
#edit-text-group {
    display: flex;
    min-height: 0;
}
#edit-text-preview {
    padding: 20px;
    pointer-events: none;
    overflow-y: auto;
}
#edit-text-group .markdown {
    border: 1px solid #272c3a;
    /* height: 100%;
    max-height: 100%; */
    border-top: none;
}
#post-save {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
}

@media (min-width: 1600px) {
    #edit-wrapper {
        max-width: 1600px;
    }
    #edit-text-group {
        flex-direction: row;
    }
    #edit-text-preview {
        width: 50%;
        max-width: 50%;
    }
    #edit-text-group .textarea-wrapper {
        max-width: 50%;
        width: 50%;
    }
}

@media (max-width: 1600px) {
    #edit-wrapper {
        max-width: 1000px;
    }
    #edit-text-group {
        flex-direction: column;
    }
    #edit-text-preview {
        height: 50%;
        max-height: 50%;
    }
    #edit-text-group .textarea-wrapper {
        max-height: 50%;
        height: 50%;
    }
}
</style>
