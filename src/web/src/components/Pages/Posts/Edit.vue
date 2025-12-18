<template>
    <div id="post-edit">
        <Title :text="title">
            <Tabs :items="tabs"/>
        </Title>
        <template v-if="tab === ''">
            <Panel id="edit-panel">
                <div id="edit-wrapper">
                    <TextInput v-model="post.title" :placeholder="t('posts.edit.title.placeholder')" :max-length="100"/>
                    <Textarea v-model="post.text" :placeholder="t('posts.edit.text.placeholder')"/>
                    <div id="post-save">
                        <div class="btn">
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
import { computed, reactive, watch } from 'vue';
import { ref } from 'vue';
import Panel from '../../UI/Panel.vue';
import Tabs from '../../UI/Tabs.vue';
import TextInput from '../../UI/Inputs/TextInput.vue';
import Textarea from '../../UI/Inputs/Textarea.vue';

const { t } = useI18n()
const route = useRoute()

const loading = ref(true)

const post = reactive({
    title: '',
    text: '',
})

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

</script>

<style scoped>
#edit-panel {
    padding: 20px;
}
#edit-wrapper {
    display: grid;
    grid-template-rows: 38px 1fr 50px;
    gap: 20px;
    min-height: 600px;
    max-width: 1000px;
}
#post-save {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
}
</style>
