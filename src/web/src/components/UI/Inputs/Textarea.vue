<template>
    <div :class="{'textarea-wrapper': true, 'empty': modelValue.length === 0 }" :data-placeholder="props.placeholder" :data-requirements="props.requirements">
        <textarea type="text" 
            v-model="modelValue"
            spellcheck="false" 
            autocomplete="one-time-code"
            :max-length="props.maxLength"
        />
        <template v-if="props.maxLength">
            <div class="textarea-length">{{ length }}</div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const modelValue = defineModel<string>({ default: '' })

const props = defineProps<{
    placeholder?: string
    requirements?: string
    maxLength?: number
}>()

const length = computed<string>(() => {
    return `${Intl.NumberFormat('ru-RU').format(modelValue.value.length ?? 0)}/${Intl.NumberFormat('ru-RU').format(props.maxLength ?? 0)}`
})

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
    left: 11px;
    color: #ffffff4a;
    font-size: 16px;
    line-height: 16px;
    top: 11px;
}
.input-wrapper.empty::after {
    content: attr(data-requirements);
    pointer-events: none;
    position: absolute;
    right: 11px;
    color: #ffffff4a;
    font-size: 14px;
    line-height: 16px;
    top: 11px;
    transform: translateY(-50%);
}
.textarea-wrapper textarea {
    width: 100%;
    height: 100%;
    resize: none;
}
.textarea-length {
    content: attr(data-requirements);
    pointer-events: none;
    position: absolute;
    bottom: 6px;
    color: #ffffff7d;
    font-size: 14px;
    line-height: 16px;
    right: 6px;
}
</style>