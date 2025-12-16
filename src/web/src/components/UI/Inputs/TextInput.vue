<template>
    <div :class="{'input-wrapper': true, 'empty': modelValue.length === 0 }" :data-placeholder="props.placeholder">
        <input type="text" v-model="modelValue" :maxlength="props.maxLength"/>
    </div>
</template>

<script setup lang="ts">

const modelValue = defineModel<string>({ default: '' })

const props = defineProps<{
    placeholder: string
    maxLength?: number
}>()

</script>

<style>
.input-wrapper {
    width: 100%;
    position: relative;
}
.input-wrapper.empty::before {
    content: attr(data-placeholder);
    pointer-events: none;
    position: absolute;
    left: 12px;
    color: #ffffff63;
    font-size: 17px;
    top: 50%;
    transform: translateY(-50%);
}
.input-wrapper input {
    width: 100%;
}
</style>