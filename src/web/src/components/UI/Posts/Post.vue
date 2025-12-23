<template>
    <div class="post-wrapper">
        <Panel :class="{'post': true, 'expanded': expanded }">
            <div :class="{'post-top': true, 'blacklisted': postBlacklisted }">
                <div class="post-title">
                    <template v-if="! postBlacklisted">
                        <router-link :to="{ name: 'posts.view', params: { slug: post.slug } }">
                            {{ post.title }}
                        </router-link>
                    </template>
                    <template v-else>
                        <div class="post-title-blacklisted">
                            {{ t('posts.blacklist.title') }}
                        </div>
                    </template>
                </div>
                <div class="post-top-right">
                    <template v-if="userStore.isAuthenticated && post.player_id !== userStore.player.id">
                        <template v-if="! postBlacklisted">
                            <div class="post-action" id="post-hide-player" style="margin-left: auto" @click="hideAuthor()">{{ t('posts.hide_author') }}</div>
                        </template>
                        <template v-else>
                            <div class="post-action" id="post-show-player" style="margin-left: auto" @click="showAuthor()">{{ t('posts.show_author') }}</div>
                        </template>
                    </template>
                    <div class="post-player">
                        <router-link :to="{ name: 'players.detail', params: { id: post.player_id}}">{{ post.player_name }}</router-link>
                    </div>
                    <div class="post-datetime">{{ ago }}</div>
                </div>
            </div>
            <template v-if="! postBlacklisted">
                <div class="post-text" ref="postRef" @click="handleMarkdownClick">
                    <template v-if="post.text?.length > 0">
                        <Markdown :source="post.text" class="markdown" />
                    </template>
                    <template v-else>
                        <div class="post-no-text">{{ t('posts.no_text') }}</div>
                    </template>
                </div>
                <div class="post-bottom">
                    <div class="post-views">
                        <div class="post-views-icon" />
                        <div class="post-views-count">
                            {{ post.views_count }}
                        </div>
                    </div>
                    <div class="post-votes">
                        <div :class="{'post-votes-btn btn': true, 'disabled': ! canVote }" @click="canVote && sendVote(1)">
                            <div class="post-votes-btn-icon plus" />
                        </div>
                        <div :class="{'post-votes-value': true, 'clickable': userStore.isAuthenticated && props.post.votes.length > 0}" 
                            @click="userStore.isAuthenticated && props.post.votes.length > 0 && (votesModal.show = true)"
                        >
                            {{ votes }}
                        </div>
                        <div :class="{'post-votes-btn btn': true, 'disabled': ! canVote }" @click="canVote && sendVote(2)">
                            <div class="post-votes-btn-icon minus" />
                        </div>
                    </div>
                    <template v-if="userStore.isAuthenticated && userStore.hasNoRestriction">
                        <div class="post-action" id="post-report" @click="reportModal.show = true">{{ t('posts.report') }}</div>
                    </template>
                    <template v-else>
                        <div class="stub" />
                    </template>
                    <div class="post-comments">
                        <router-link :to="{ name: 'posts.view', params: { slug: post.slug } }">{{ comments }}</router-link>
                    </div>
                </div>
            </template>
        </Panel>
    </div>

    <Modal v-if="votesModal.show" @close="votesModal.show = false" :title="props.post.title">
        <div class="post-votes-modal">
            <div class="post-vote" v-for="vote in props.post.votes">
                <div class="post-vote-at">{{ datetime.from(vote.at) }}</div>
                <div class="post-vote-player">
                    <router-link :to="{ name: 'players.detail', params: { id: vote.player_id } }">{{ vote.player_name }}</router-link>
                </div>
                <div class="post-vote-type">{{ vote.type === 1 ? '+' : '-' }}</div>
            </div>
        </div>
    </Modal>

    <Modal v-if="linkModal.show" @close="linkModal.show = false" :title="t('posts.link_modal.title')">
        <div id="link-modal">
            <div id="link-modal-link-name">{{ linkModal.name }}</div>
            <div id="link-modal-link-url">{{ linkModal.url }}</div>
            <div class="btn" @click="confirmExternalLink" style="width:fit-content;margin-left:50%;transform:translateX(-50%)">
                <div class="btn-icon" style="background-image: url('/img/link.png')"/>
                {{ t('posts.link_modal.continue') }}
            </div>
        </div>
    </Modal>

    <Modal v-if="reportModal.show" @close="reportModal.show = false" :title="t('posts.report_modal.title')">
        <div id="report-modal">
            <div class="post-title" style="width: 100%;text-align: left; font-size: 16px">{{ props.post.title }}</div>
            <TextInput v-model="reportModal.reason" :placeholder="t('posts.report_modal.reason.placeholder')" :requirements="t('posts.report_modal.reason.requirements')" :max-length="32" />
            <div :class="{'btn': true, 'disabled': reportModal.reason.length < 3 || reportModal.reason.length > 32}" @click="sendReport">
                <div class="btn-icon" style="background-image: url('/img/report.png')"/>
                {{ t('posts.report_modal.send') }}
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { PostWithInfo, registerView, vote } from '../../../api/posts';
import Panel from '../Panel.vue';
// @ts-ignore
import Markdown from 'vue3-markdown-it';
import { datetime, timestamp } from '../../../helpers/timestamp';
import { useSettingsStore } from '../../../stores/settings';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { pluralize, pluralizeEn, pluralizePl } from '../../../helpers/string';
import { useUserStore } from '../../../stores/user';
import { useI18n } from 'vue-i18n';
import Modal from '../Modal.vue';
import router from '../../../router';
import { blacklist } from '../../../api/user';
import TextInput from '../Inputs/TextInput.vue';
import { add } from '../../../api/reports';
import { alerts } from '../alerts';

const settingsStore = useSettingsStore()
const userStore = useUserStore()

const { t } = useI18n()

const props = defineProps<{
    post: PostWithInfo
}>()

const expanded = ref(false)

const now = ref(timestamp.now())

const ago = computed<string>(() => {
    if (now.value - props.post.created_at < 60) {
        if (settingsStore.language === 1) {
            return `только что`
        }
        if (settingsStore.language === 3) {
            return `właśnie`
        }
        return `just now`
    }
    if (now.value - props.post.created_at < 3600) {
        let count = Math.floor((now.value - props.post.created_at) / 60)
        if (settingsStore.language === 1) {
            return `${count} ${pluralize(count, 'минуту', 'минуты', 'минут')} назад`
        }
        if (settingsStore.language === 3) {
            return `${count} ${pluralizePl(count, 'minuta', 'minuty', 'minut')} temu`
        }
        return `${count} ${pluralizeEn(count, 'minute')} ago`
    }
    if (now.value - props.post.created_at < 86400) {
        let count = Math.floor((now.value - props.post.created_at) / 3600)
        if (settingsStore.language === 1) {
            return `${count} ${pluralize(count, 'час', 'часа', 'часов')} назад`;
        }
        if (settingsStore.language === 3) {
            return `${count} ${pluralizePl(count, 'godzina', 'godziny', 'godzin')} temu`;
        }
        return `${count} ${pluralizeEn(count, 'hour')} ago`;
    }

    return datetime.from(props.post.created_at)
})

const votes = computed<number>(() => {
    let value = 0

    for (let i = 0; i < props.post.votes.length; i++) {
        value += props.post.votes[i].type === 1 ? 1 : -1
    }

    return value
})

const comments = computed<string>(() => {
    const count = props.post.comments.length;

    if (count === 0) {
        if (settingsStore.language === 1) return 'Нет комментариев';
        if (settingsStore.language === 3) return 'Brak komentarzy';
        return 'No comments';
    }

    if (settingsStore.language === 1) {
        return `${count} ${pluralize(count, 'комментарий', 'комментария', 'комментариев')}`;
    }
    
    if (settingsStore.language === 3) {
        return `${count} ${pluralizePl(count, 'komentarz', 'komentarze', 'komentarzy')}`;
    }

    return `${count} ${pluralizeEn(count, 'comment')}`;
})

const postBlacklisted = computed<boolean>(() => {
    return userStore.blacklist.includes(props.post.player_id)
})

const hideAuthor = () => {
    userStore.blacklist.push(props.post.player_id)
    blacklist(props.post.player_id)
}

const showAuthor = () => {
    userStore.blacklist = userStore.blacklist.filter(id => id !== props.post.player_id)
    blacklist(props.post.player_id, false)
}

const voted = ref(false)

const canVote = computed<boolean>(() => {
    return userStore.isAuthenticated && ! voted.value && props.post.votes.find(v => v.player_id === userStore.player.id) === undefined
})

const sendVote = (type: number) => {
    voted.value = true

    let now = timestamp.now()

    vote(2, props.post.id, type).then(() => {
        props.post.votes.push({
            at: now,
            player_id: userStore.player!.id!,
            player_name: userStore.player!.name!,
            type: type,
        })
    })
}

const postRef = ref(null);

let observer = null;
let viewTimeout: NodeJS.Timeout|undefined = undefined;

const viewRegistered = ref(false);

onMounted(() => {
    const updateNow = setInterval(() => {
        now.value = timestamp.now()
    }, 10000)

    onBeforeUnmount(() => {
        clearInterval(updateNow)
    })

    if (userStore.isAuthenticated) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !viewRegistered.value) {
                    viewTimeout = setTimeout(() => {
                        registerView(props.post.id).then(() => {
                            viewRegistered.value = true
                            // @ts-ignore
                            observer!.unobserve(postRef.value)
                        })
                    }, 1000);
                } else {
                    viewTimeout && clearTimeout(viewTimeout);
                }
            });
        }, {
            threshold: 0.1
        });
    
        // @ts-ignore
        postRef.value && observer.observe(postRef.value)
    }
})

const votesModal = reactive({
    show: false,
})

const linkModal = reactive({
    show: false,
    name: '',
    url: '',
})

const handleMarkdownClick = (event: MouseEvent) => {
    expanded.value = true

    const target = event.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor) {
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        try {
            const url = new URL(href, window.location.origin);

            if (url.host !== window.location.host) {
                event.preventDefault();
                linkModal.url = href;
                linkModal.name = anchor.innerText || href;
                linkModal.show = true;
            } else {
                event.preventDefault();
                router.push(url.pathname + url.search + url.hash);
            }
        } catch (e) {
            console.error('Link error:', e);
        }
    }
}

const confirmExternalLink = () => {
    window.open(linkModal.url, '_blank');
    linkModal.show = false;
}

const reportModal = reactive({
    show: false,
    reason: '',
})

const sendReport = () => {
    add(2, props.post.id, reportModal.reason).then(() => {
        alerts.send('', t('posts.report_modal.success'))
        reportModal.show = false
    }).catch(err => {
        reportModal.show = false
    })
}

</script>

<style scoped>
.post {
}
.post-title {
    font-size: 20px;
    font-weight: 500;
}
.post-top {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
}
.post-top:not(.blacklisted) {
    border-bottom: 1px dashed #ffffff1c;
}
.post-top-right {
    display: flex;
    align-items: flex-end;
    gap: 6px;
}
.post-title {
    display: flex;
    position: relative;
    top: 1px;
    align-items: flex-end;
}
.post-title-blacklisted {
    opacity: .5;
}
.post-player {
    display: flex;
    align-items: flex-end;
    position: relative;
    /* top: 1px; */
}
.post-datetime {
    font-size: 14px;
    opacity: .6;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
.post-text {
    padding: 20px;
}
.post-no-text {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: .8;
}
.post-bottom {
    border-top: 1px dashed #ffffff1c;
    padding: 15px 20px;
    display: grid;
    grid-template-columns: 100px 116px 1fr 200px;
}
.post-views {
    display: flex;
    align-items: center;
    gap: 8px;
}
.post-views-icon {
    width: 18px;
    height: 18px;
    background: url('/img/view.png');
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .3;
}
.post-views-count {
    opacity: .6;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    position: relative;
    top: -1px;
}
.post-votes {
    display: grid;
    grid-template-columns: 28px 40px 28px;
    align-items: center;
    gap: 4px;
}
.post-votes-btn {
    padding: 5px 4px;
}
.post-votes-btn.disabled {
    opacity: .3;
}
.post-votes-btn-icon {
    width: 20px;
    height: 20px;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .5;
}
.post-votes-btn-icon.plus {
    background-image: url('/img/plus.png');
    background-size: 13px 13px;
}
.post-votes-btn-icon.minus {
    background-image: url('/img/minus.png');
    background-size: 13px 14px;
}
.post-votes-modal {
    padding: 20px;
    max-height: 400px;
    overflow-y: scroll;
}
.post-votes-value {
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
.post-votes-value.clickable:hover {
    cursor: pointer;
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.726) inset;
}
.post-vote {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    margin-bottom: 5px;
    padding-bottom: 7px;
    border-bottom: 1px dashed #ffffff45;
}
.post-vote:last-of-type {
    border-bottom: none !important;
    margin-bottom: 0;
    padding-bottom: 0;
}
.post-vote-at {
    font-size: 14px;
    opacity: .6;
    font-variant-numeric: tabular-nums;
}
.post-vote-player {
    display: flex;
}
.post-vote-type {
    font-weight: 700;
    opacity: .5;
    font-size: 23px;
    height: 12px;
    line-height: 4px;
}
#link-modal {
    display: grid;
    padding: 20px;
    gap: 20px;
}
.post-comments {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    opacity: .7;
}
.post-action {
    display: flex;
    align-items: center;
    font-size: 14px;
    opacity: .6;
    width: fit-content;
    white-space: nowrap;
    height: fit-content;
}
.post-action:hover {
    cursor: pointer;
    box-shadow: 0 -2px 0 0 rgba(255, 255, 255, 0.726) inset;
}
#post-report {
    margin-left: 10%;
    align-self: center;
}
#post-hide-player {
    margin-right: 10px;
}
#post-show-player {
    margin-right: 10px;
}
#report-modal {
    width: 400px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}
</style>

<style>
.post .markdown h1 {
    font-size: 19px;
    font-weight: 500;
}
.post .markdown h2 {
    font-size: 18px;
    font-weight: 500;
}
.post .markdown h3 {
    font-size: 17px;
    font-weight: 500;
}
.post .markdown img {
    max-width: 100%;
}
</style>
