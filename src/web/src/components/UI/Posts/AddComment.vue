<template>
    <Panel class="add-comment">
        <Textarea v-model="comment.text" :max-length="1000" :placeholder="t('posts.add_comment.text.placeholder')" class="add-comment-textarea"/>
        <div class="add-comment-bottom">
            <div 
                :class="{'btn': true, 'disabled': ! canSaveComment, 'waiting': waiting }"
                @click="saveComment"
                >
                <div class="btn-icon" style="background-image: url('/img/save.png')" />
                {{ t('posts.add_comment.send') }}
            </div>
        </div>
    </Panel>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Textarea from '../Inputs/Textarea.vue';
import Panel from '../Panel.vue';
import { computed, reactive, ref } from 'vue';

const { t } = useI18n()

const props = defineProps<{
    post_id: number
}>()

const comment = reactive({
    text: ''
})

const waiting = ref(false)

const canSaveComment = computed<boolean>(() => {
    return comment.text.length > 5 && comment.text.length <= 1000
})

const saveComment = () => {

}

</script>

<style scoped>
.add-comment {
    width: 100%;
    height: 200px;
    padding: 20px;
    display: grid;
    grid-template-rows: 1fr 20px;
    gap: 20px;
}
.add-comment-textarea {
    height: 100%;
}
.add-comment-bottom {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.add-comment-bottom .btn {
    width: fit-content;
}
</style>
