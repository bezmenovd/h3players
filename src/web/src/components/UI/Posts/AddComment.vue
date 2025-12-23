<template>
    <Panel class="add-comment">
        <Textarea v-model="comment.text" :max-length="500" :placeholder="t('posts.add_comment.text.placeholder')" class="add-comment-textarea"/>
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
import { addMessage } from '../../../api/posts';
import { Message } from '../../../api/messages';

const { t } = useI18n()

const props = defineProps<{
    post_id: number
    parent_id?: number|null
}>()

const emit = defineEmits({
    onadd: (comment: Message) => {}
})

const comment = reactive({
    text: ''
})

const waiting = ref(false)

const canSaveComment = computed<boolean>(() => {
    return comment.text.length > 5 && comment.text.length <= 500
})

const saveComment = () => {
    if (waiting.value) {
        return
    }

    waiting.value = true

    addMessage(props.post_id, props.parent_id ?? null, comment.text).then(comment => {
        emit('onadd', comment)
    }).finally(() => {
        waiting.value = false
    })
}

</script>

<style scoped>
.add-comment {
    width: 100%;
    height: 170px;
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
