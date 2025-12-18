<template>
    <div class="query-input-box"
        :class="{ 'empty': query!.length === 0 }"
        :data-placeholder="props.placeholder"
    >
        <input
            type="text" class="query-input" spellcheck="false" :maxlength="props.maxlength" autocomplete="one-time-code"
            :style="{'width': props.width}"
            v-model="query"
            @keyup="change"
            @focus="queryFocus.focus()" @blur="queryFocus.blur()"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
    maxlength: number
    placeholder: string
    width?: string
}>()

const emit = defineEmits(['change'])

const route = useRoute()

const query = ref<string>(route.query.query ? String(route.query.query) : '')

const change = () => {
    emit('change', {value: query.value})
}

const queryFocus = reactive({
    is: true,
    focus() {
        this.is = true
    },
    blur() {
        setTimeout(() => { this.is = false }, 200)
    }
})
</script>

<style scoped>
input {
    line-height: 20px;
    padding: 8px 10px;
}
.query-input {
    height: fit-content;
}
.query-input-box {
    position: relative;
    width: fit-content;
}
.query-input-box.empty::before {
    content: attr(data-placeholder);
    pointer-events: none;
    position: absolute;
    left: 12px;
    color: #ffffff63;
    font-size: 17px;
    top: 50%;
    transform: translateY(-50%);
}
.query-input-box.disabled input {
    background: #363c4b;
}
</style>
