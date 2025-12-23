<template>
    <div id="template-posts">
        <Title :text="`${t('templates.posts.title')} '${posts.template_name}'`" />
        <Loader v-if="! posts.show" :solid="false" />
        <List v-if="posts.show" :discussion_id="posts.discussion_id" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { getTemplateDiscussion } from '../../../api/templates';
import router from '../../../router';
import { useRoute } from 'vue-router';
import List from '../../UI/Posts/List.vue';
import Title from '../../UI/Title.vue';
import Loader from '../../UI/Loader.vue';

const { t } = useI18n()
const route = useRoute()

const posts = reactive({
    show: false,
    template_name: '',
    discussion_id: 0,
})

onMounted(() => {
    const templateId = Number(route.params.id)

    if (! templateId) {
        router.push({ name: 'templates' })
        return
    }

    getTemplateDiscussion(templateId).then(r => {
        posts.discussion_id = r.discussion_id
        posts.template_name = r.template_name
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
</style>
