<template>
    <div class="title">
        <div class="title-text">
            {{ props.text }}
            <slot name="in-text"/>
        </div>
        <div class="title-content">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    text: string
}>()

</script>

<style scoped>
.title {
    display: flex;
    align-items: center;
    height: 50px;
    padding-bottom: 20px;
    justify-content: space-between;
}
.title-text {
    color: white;
    font-size: 24px;
    align-items: center;
    display: flex;
}
.title-content {
    height: 100%;
    display: flex;
    align-items: center;
}

@media (max-width: 1600px) {
    .title {
        height: 40px;
        padding: 6px 0px;
        margin-bottom: 14px;
    }
    .title-text {
        font-size: 20px;
    }
}

</style>
