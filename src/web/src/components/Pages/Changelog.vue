<template>
    <div id="changelog">
        <div class="version" v-for="version in changelog">
            <div class="version-name">{{ version.version }}</div>
            <div class="version-date">{{ version.date }}</div>
            <div class="version-changes">
                <div class="version-change" v-for="change in version.changes">
                    <div class="version-change-type">{{ {'feature': '+', 'fix': '*'}[change.type] }}</div>
                    <div class="version-change-description">{{ change.description }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import changelog from '../../meta/changelog.json';

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
.version-change {
    display: flex;
    gap: 5px;
}
.version-name {
    font-size: 15px;
    display: flex;
    align-items: center;
    font-weight: bold;
}
.version-date {
    font-size: 15px;
    display: flex;
    align-items: center;
}
</style>
