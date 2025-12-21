<template>
    <Panel class="post">
        <div class="post-top">
            <div class="post-title">
                <router-link :to="{ name: 'posts.view', params: { slug: post.slug } }">
                    {{ post.title }}
                </router-link>
            </div>
            <div class="post-top-right">
                <div class="post-player">
                    <router-link :to="{ name: 'players.detail', params: { id: post.player_id}}">{{ post.player_name }}</router-link>
                </div>
                <div class="post-datetime">{{ ago }}</div>
            </div>
        </div>
        <div class="post-text">
            <Markdown :source="post.text" class="markdown" />
        </div>
        <div class="post-bottom"></div>
    </Panel>
</template>

<script setup lang="ts">
import { PostWithInfo } from '../../../api/posts';
import Panel from '../Panel.vue';
// @ts-ignore
import Markdown from 'vue3-markdown-it';
import { datetime, timestamp } from '../../../helpers/timestamp';
import { useSettingsStore } from '../../../stores/settings';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { pluralize, pluralizeEn, pluralizePl } from '../../../helpers/string';

const settingsStore = useSettingsStore()

const props = defineProps<{
    post: PostWithInfo
}>()

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
.post {
}
.post-title {
    font-size: 20px;
    font-weight: 500;
}
.post-top {
    padding: 15px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px dashed #ffffff47;
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
.post-player {
    display: flex;
    align-items: flex-end;
    position: relative;
    /* top: 1px; */
}
.post-datetime {
    font-size: 14px;
    opacity: .6;
}
.post-text {
    padding: 20px;
}
.post-bottom {
    border-top: 1px dashed #ffffff47;
    padding: 15px;
}
</style>

<style>
.markdown h1 {
    font-size: 17px;
}
.markdown h2 {
    font-size: 16px;
}
.markdown h3 {
    font-size: 15px;
}
</style>
