<template>
    <div :class="{'input-wrapper': true, 'empty': modelValue.length === 0 }" :data-placeholder="props.placeholder" :data-requirements="props.requirements">
        <input type="text" 
            v-model="modelValue" 
            :maxlength="props.maxLength"
            spellcheck="false" 
            autocomplete="one-time-code"
        />
    </div>
</template>

<script setup lang="ts">

const modelValue = defineModel<string>({ default: '' })

const props = defineProps<{
    placeholder?: string
    requirements?: string
    maxLength?: number
}>()

</script>

<style scoped>
.input-wrapper {
    width: 100%;
    position: relative;
}
.input-wrapper.empty::before {
    content: attr(data-placeholder);
    pointer-events: none;
    position: absolute;
    left: 11px;
    color: #ffffff4a;
    font-size: 16px;
    line-height: 16px;
    top: calc(50% + 1px);
    transform: translateY(-50%);
}
.input-wrapper.empty::after {
    content: attr(data-requirements);
    pointer-events: none;
    position: absolute;
    right: 11px;
    color: #ffffff4a;
    font-size: 14px;
    line-height: 16px;
    top: calc(50% + 1px);
    transform: translateY(-50%);
}
.input-wrapper input {
    width: 100%;
    height: 38px;
}
</style>