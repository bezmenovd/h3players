<template>
    <div :class="{'textarea-wrapper': true, 'empty': modelValue.length === 0 }" :data-placeholder="props.placeholder">
        <textarea type="text" 
            v-model="modelValue"
            spellcheck="false" 
            autocomplete="one-time-code"
        />
    </div>
</template>

<script setup lang="ts">

const modelValue = defineModel<string>({ default: '' })

const props = defineProps<{
    placeholder: string
}>()

</script>

<style scoped>
.textarea-wrapper {
    width: 100%;
    position: relative;
}
.textarea-wrapper.empty::before {
    content: attr(data-placeholder);
    pointer-events: none;
    position: absolute;
    left: 12px;
    color: #ffffff4a;
    font-size: 16px;
    line-height: 16px;
    top: 8px;
}
.textarea-wrapper textarea {
    width: 100%;
    height: 100%;
    resize: none;
}
</style>