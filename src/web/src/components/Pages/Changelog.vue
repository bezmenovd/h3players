<template>
    <div id="changelog">
        <div class="version" v-for="version in changelog()">
            <div class="version-name">{{ version.version }}</div>
            <div class="version-date">{{ version.date }}</div>
            <div class="version-changes">
                <div class="version-change" v-for="change in version.changes">
                    <!-- <div class="version-change-type">{{ {'feature': '+', 'fix': '*'}[change.type] }}</div> -->
                    <div class="version-change-description">{{ change.description }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import ru from '../../meta/changelog/ru.json';
import en from '../../meta/changelog/en.json';
import pl from '../../meta/changelog/pl.json';
import { useSettingsStore } from '../../stores/settings';

const settingsStore = useSettingsStore()

type ChangelogItem = {
    version: string
    date: string
    changes: {
        type: string
        description: string
    }[]
}

const changelog = (): ChangelogItem[] => {
    if (settingsStore.language === 1) {
        return ru
    }
    if (settingsStore.language === 2) {
        return en
    }
    if (settingsStore.language === 3) {
        return pl
    }
    throw new Error('unknown language')
}


</script>

<style scoped>
#changelog {
    display: grid;
    gap: 20px;
}
.version {
    font-variant-numeric: tabular-nums;
    display: grid;
    grid-template-columns: 60px 100px 1fr;
    gap: 20px;
}
.version-changes {
    gap: 3px;
    display: grid;
}
.version-change {
    display: flex;
    gap: 5px;
}
.version-name {
    font-size: 15px;
    display: flex;
    align-items: baseline;
    font-weight: bold;
    padding-top: 1px;
}
.version-date {
    font-size: 14px;
    display: flex;
    align-items: baseline;
    padding-top: 1px;
    opacity: .8;
}
</style>
