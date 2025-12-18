<template>
    <div id="changelog">
        <div class="version" v-for="version in changelog()">
            <div class="version-name">{{ version.version }}</div>
            <div class="version-date">{{ version.date }}</div>
            <div class="version-changes">
                <div class="version-change" v-for="change in version.changes">
                    <div class="version-change-description">{{ change }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ru from '../../content/changelog/ru.json';
import en from '../../content/changelog/en.json';
import pl from '../../content/changelog/pl.json';
import { useSettingsStore } from '../../stores/settings';

const settingsStore = useSettingsStore()

type ChangelogItem = {
    version: string
    date: string
    changes: string[]
}

const changelog = (): ChangelogItem[] => {
    if (settingsStore.language === 1) {
        return ru
    }
    if (settingsStore.language === 3) {
        return pl
    }
    return en
}


</script>

<style scoped>
#changelog {
    display: grid;
    gap: 50px;
}
.version {
    font-variant-numeric: tabular-nums;
    display: flex;
    gap: 20px;
    font-size: 15px;
}
.version-changes {
    gap: 5px;
    display: grid;
}
.version-change {
    display: flex;
    gap: 5px;
}
.version-name {
    display: flex;
    align-items: baseline;
    font-weight: bold;
}
.version-date {
    display: flex;
    align-items: baseline;
    opacity: .8;
}
</style>
