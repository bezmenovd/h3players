<template>
    <div class="comment">
        <Panel :class="{'tree-item': true, [String(props._class)]: true }">
            <div class="comment-body">
                <div class="comment-body-top">
                    <div class="comment-player">
                        <router-link :to="{ name: 'players.detail', params: { id: props.message.player_id} }">{{ props.message.player_name }}</router-link>
                    </div>
                    <div class="comment-datetime">{{ ago }}</div>
                    <div class="comment-top-right">
                        <template v-if="userStore.isAuthenticated && message.player_id !== userStore.player.id || true">
                            <template v-if="! commentBlacklisted">
                                <div class="comment-action" id="post-hide-player" style="margin-left: auto" @click="hideAuthor()">{{ t('posts.hide_author') }}</div>
                            </template>
                            <template v-else>
                                <div class="comment-action" id="post-show-player" style="margin-left: auto" @click="showAuthor()">{{ t('posts.show_author') }}</div>
                            </template>
                        </template>
                    </div>
                </div>
                <template v-if="! commentBlacklisted">
                    <div class="comment-text">{{ props.message.text }}</div>
                </template>
            </div>
            <template v-if="! commentBlacklisted">
                <div class="comment-bottom">
                    <div class="comment-votes">
                        <div :class="{'comment-votes-btn btn': true, 'disabled': ! canVote }" @click="canVote && sendVote(1)">
                            <div class="comment-votes-btn-icon plus" />
                        </div>
                        <div :class="{'comment-votes-value': true, 'clickable': userStore.isAuthenticated && props.message.votes.length > 0}" 
                            @click="userStore.isAuthenticated && props.message.votes.length > 0 && (votesModal.show = true)"
                        >
                            {{ votes }}
                        </div>
                        <div :class="{'comment-votes-btn btn': true, 'disabled': ! canVote }" @click="canVote && sendVote(2)">
                            <div class="comment-votes-btn-icon minus" />
                        </div>
                    </div>
                    <template v-if="userStore.isAuthenticated && userStore.hasNoRestriction">
                        <div class="comment-action" id="comment-report" @click="reportModal.show = true">{{ t('posts.report') }}</div>
                    </template>
                    <template v-else>
                        <div class="stub" />
                    </template>
                    <div class="comment-reply" @click="toggleReply">
                        <template v-if="props.message.level < 2">
                            <template v-if="! reply">
                                {{ t('posts.comments.reply') }}
                            </template>
                            <template v-else>
                                {{ t('posts.comments.reply_hide') }}
                            </template>
                        </template>
                    </div>
                </div>
            </template>
        </Panel>
    
        <div class="comment-replies">
            <AddComment 
                v-if="reply" 
                :post_id="props.message.post_id" 
                :parent_id="props.message.id" 
                @onadd="router.go(0)" 
                :class="{'tree-item': true, 'last': props.message.children.length === 0}"
            />
    
            <CommentTree 
                v-for="(comment, key) in props.message.children" 
                :message="comment" 
                @reply="toggleReply"
                :_class="key === props.message.children.length-1 ? 'last' : ''"
            />
        </div>
    </div>

    <Modal v-if="votesModal.show" @close="votesModal.show = false" :title="props.message.text.substring(0, 20) + (props.message.text.length > 20 ? '...' : '')">
        <div class="comment-votes-modal">
            <div class="comment-vote" v-for="vote in props.message.votes">
                <div class="comment-vote-at">{{ datetime.from(vote.at) }}</div>
                <div class="comment-vote-player">
                    <router-link :to="{ name: 'players.detail', params: { id: vote.player_id } }">{{ vote.player_name }}</router-link>
                </div>
                <div class="comment-vote-type">{{ vote.type === 1 ? '+' : '-' }}</div>
            </div>
        </div>
    </Modal>

    <Modal v-if="reportModal.show" @close="reportModal.show = false" :title="t('posts.report_modal.title')">
        <div id="report-modal">
            <div class="comment-title" style="width: 100%;text-align: left; font-size: 16px">{{ props.message.text }}</div>
            <TextInput v-model="reportModal.reason" :placeholder="t('posts.report_modal.reason.placeholder')" :requirements="t('posts.report_modal.reason.requirements')" :max-length="32" />
            <div :class="{'btn': true, 'disabled': reportModal.reason.length < 3 || reportModal.reason.length > 32}" @click="sendReport">
                <div class="btn-icon" style="background-image: url('/img/report.png')"/>
                {{ t('posts.report_modal.send') }}
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { MessageWithInfo } from '../../../api/messages';
import { datetime, timestamp } from '../../../helpers/timestamp';
import { useUserStore } from '../../../stores/user';
import Panel from '../Panel.vue';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useSettingsStore } from '../../../stores/settings';
import { pluralize, pluralizeEn, pluralizePl } from '../../../helpers/string';
import { add } from '../../../api/reports';
import { alerts } from '../alerts';
import { vote } from '../../../api/posts';
import { blacklist } from '../../../api/user';
import AddComment from './AddComment.vue';
import { TNode } from '../../../helpers/tree';
import router from '../../../router';
import Modal from '../Modal.vue';

const userStore = useUserStore()
const settingsStore = useSettingsStore()

const emit = defineEmits(['reply'])

const { t } = useI18n()

const props = defineProps<{
    message: TNode<MessageWithInfo>
    _class?: string
}>()

const now = ref(timestamp.now())

const ago = computed<string>(() => {
    if (now.value - props.message.created_at < 60) {
        if (settingsStore.language === 1) {
            return `только что`
        }
        if (settingsStore.language === 3) {
            return `właśnie`
        }
        return `just now`
    }
    if (now.value - props.message.created_at < 3600) {
        let count = Math.floor((now.value - props.message.created_at) / 60)
        if (settingsStore.language === 1) {
            return `${count} ${pluralize(count, 'минуту', 'минуты', 'минут')} назад`
        }
        if (settingsStore.language === 3) {
            return `${count} ${pluralizePl(count, 'minuta', 'minuty', 'minut')} temu`
        }
        return `${count} ${pluralizeEn(count, 'minute')} ago`
    }
    if (now.value - props.message.created_at < 86400) {
        let count = Math.floor((now.value - props.message.created_at) / 3600)
        if (settingsStore.language === 1) {
            return `${count} ${pluralize(count, 'час', 'часа', 'часов')} назад`;
        }
        if (settingsStore.language === 3) {
            return `${count} ${pluralizePl(count, 'godzina', 'godziny', 'godzin')} temu`;
        }
        return `${count} ${pluralizeEn(count, 'hour')} ago`;
    }

    return datetime.from(props.message.created_at)
})

const votesModal = reactive({
    show: false,
})

const reportModal = reactive({
    show: false,
    reason: '',
})

const reply = ref(false)

const toggleReply = () => {
    if (props.message.level >= 2) {
        emit('reply')
    } else {
        reply.value = ! reply.value
    }
}

const sendReport = () => {
    add(3, props.message.id, reportModal.reason).then(() => {
        alerts.send('', t('posts.report_modal.success'))
        reportModal.show = false
    }).catch(err => {
        reportModal.show = false
    })
}

const voted = ref(false)

const votes = computed<number>(() => {
    let value = 0

    for (let i = 0; i < props.message.votes.length; i++) {
        value += props.message.votes[i].type === 1 ? 1 : -1
    }

    return value
})

const canVote = computed<boolean>(() => {
    return userStore.isAuthenticated && ! voted.value && props.message.votes.find(v => v.player_id === userStore.player.id) === undefined
})

const sendVote = (type: number) => {
    voted.value = true

    let now = timestamp.now()

    vote(3, props.message.id, type).then(() => {
        props.message.votes.push({
            at: now,
            player_id: userStore.player!.id!,
            player_name: userStore.player!.name!,
            type: type,
        })
    })
}

const commentBlacklisted = computed<boolean>(() => {
    return userStore.blacklist.includes(props.message.player_id)
})

const hideAuthor = () => {
    userStore.blacklist.push(props.message.player_id)
    blacklist(props.message.player_id)
}

const showAuthor = () => {
    userStore.blacklist = userStore.blacklist.filter(id => id !== props.message.player_id)
    blacklist(props.message.player_id, false)
}

onMounted(() => {
    const updateNow = setInterval(() => {
        now.value = timestamp.now()
    }, 10000)

    onBeforeUnmount(() => {
        clearInterval(updateNow)
    })
})

</script>

<style scoped>
.comment-body {
    padding: 20px;
    display: grid;
    gap: 10px;
}
.comment-body-top {
    display: flex;
    gap: 8px;
    align-items: baseline;
}
.comment-player {
    display: flex;
}
.comment-datetime {
    font-size: 14px;
    opacity: .6;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
.comment-top-right {
    margin-left: auto;
}
.comment-text {
    opacity: .8;
}
.comment-bottom {
    padding: 15px 20px;
    border-top: 1px dashed #ffffff1c;
    display: grid;
    grid-template-columns: 116px 1fr 200px;
    align-items: center;
}
.comment-votes {
    display: grid;
    grid-template-columns: 28px 40px 28px;
    align-items: center;
    gap: 4px;
}
.comment-votes-btn {
    padding: 5px 4px;
}
.comment-votes-btn.disabled {
    opacity: .3;
}
.comment-votes-btn-icon {
    width: 20px;
    height: 20px;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .5;
}
.comment-votes-btn-icon.plus {
    background-image: url('/img/plus.png');
    background-size: 13px 13px;
}
.comment-votes-btn-icon.minus {
    background-image: url('/img/minus.png');
    background-size: 13px 14px;
}
.comment-votes-modal {
    padding: 20px;
    max-height: 400px;
    overflow-y: scroll;
}
.comment-votes-value {
    font-variant-numeric: tabular-nums;
    position: relative;
    top: -1px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: .8;
    width: fit-content;
    margin-left: 50%;
    transform: translateX(-50%);
}
.comment-votes-value.clickable:hover {
    cursor: pointer;
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.726) inset;
}
.comment-vote {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    margin-bottom: 5px;
    padding-bottom: 7px;
    border-bottom: 1px dashed #ffffff45;
}
.comment-vote:last-of-type {
    border-bottom: none !important;
    margin-bottom: 0;
    padding-bottom: 0;
}
.comment-vote-at {
    font-size: 14px;
    opacity: .6;
    font-variant-numeric: tabular-nums;
}
.comment-vote-player {
    display: flex;
}
.comment-vote-type {
    font-weight: 700;
    opacity: .5;
    font-size: 23px;
    height: 12px;
    line-height: 4px;
}
.comment-action {
    display: flex;
    align-items: center;
    font-size: 14px;
    opacity: .6;
    width: fit-content;
    white-space: nowrap;
    height: fit-content;
}
.comment-action:hover {
    cursor: pointer;
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.726) inset;
}
#comment-report {
    margin-left: 10%;
    align-self: center;
}
.comment-reply {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-left: auto;
    width: fit-content;
    opacity: .7;
}
.comment-reply:hover {
    cursor: pointer;
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.726) inset;
}
.comment-replies {
    padding-left: 50px;
    position: relative;
    display: flex;
    flex-direction: column;
}
#report-modal {
    width: 400px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}
.comment-votes-modal {
    padding: 20px;
    max-height: 400px;
    overflow-y: scroll;
}
</style>
