<template>
    <div class="posts-button" @click="emit('click')" />
</template>

<script setup lang="ts">

const emit = defineEmits(['click'])

</script>

<style scoped>
.posts-button {
    width: 24px;
    height: 24px;
    background-image: url('/img/posts.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 19px 18px;
    opacity: .4;
    filter: invert(1);
}
.posts-button:hover {
    cursor: pointer;
    opacity: .6;
}
</style>
