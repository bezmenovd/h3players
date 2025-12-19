<template>
    <div id="post-edit">
        <Title :text="title">
            <Tabs :items="tabs"/>
        </Title>
        <template v-if="tab === ''">
            <Panel id="edit-panel">
                <div id="edit-wrapper">
                    <div id="edit-title-group">
                        <TextInput v-model="post.title" :placeholder="t('posts.edit.title.placeholder')" :max-length="100"/>
                        <Dropdown :value="post.discussion_id" :items="discussions"/>
                    </div>
                    <Textarea v-model="post.text" :placeholder="t('posts.edit.text.placeholder')"/>
                    <div id="post-save">
                        <div 
                            :class="{'btn': true, 'disabled': post.title.trim().length < 5 , 'waiting': addModal.waiting }" 
                            :hint="addModal.name.length < 5 ? t('discussions.list.add_modal.min_length') : ''"
                            @click="addDiscussion"
                            >
                            <div class="btn-icon" style="background-image: url('/img/save.png')" />
                            {{ t('posts.edit.save') }}
                        </div>
                    </div>
                </div>
            </Panel>
        </template>
        <template v-if="tab === 'preview'">
            <Panel id="preview-panel"></Panel>
        </template>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import Title from '../../UI/Title.vue';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, reactive, watch } from 'vue';
import { ref } from 'vue';
import Panel from '../../UI/Panel.vue';
import Tabs from '../../UI/Tabs.vue';
import TextInput from '../../UI/Inputs/TextInput.vue';
import Textarea from '../../UI/Inputs/Textarea.vue';
import Dropdown from '../../UI/Inputs/Dropdown.vue';
import { getList } from '../../../api/discussions';
import { add } from '../../../api/posts';

const { t } = useI18n()
const route = useRoute()

const loading = ref(true)

const post = reactive({
    title: '',
    text: '',
    discussion_id: -1,
})

const canSave = computed(() => {
    
})

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

const tab = ref<string>('');
const tabs = [
    {
        code: '', 
        name: t('posts.edit.tabs.edit')
    }, { 
        code: 'preview', 
        name: t('posts.edit.tabs.preview')
    }
]

watch(() => route.params.tab, (newTabCode) => {
    tab.value = newTabCode !== undefined ? String(newTabCode) : '';
}, { immediate: true });

onMounted(() => {
    getList().then(r => {
        discussions.value = r.sort((a, b) => a.posts_count - b.posts_count).map(d => ({
            id: d.id,
            text: d.name,
        }))
        post.discussion_id = discussions.value[0].id
    })
})

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
    max-width: 1000px;
}
#edit-title-group {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: 20px;
}
#post-save {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
}
</style>
