<template>
    <div class="table-footer">
        <div class="table-nav">
            <div :class="{'table-nav-btn start': true, disabled: !canPrev}" @click="toStart"></div>
            <div :class="{'table-nav-btn prev': true, disabled: !canPrev}" @click="toPrev"></div>
            <div :class="{'table-nav-btn next': true, disabled: !canNext}" @click="toNext"></div>
            <div :class="{'table-nav-btn end': true, disabled: !canNext}" @click="toEnd"></div>
        </div>
        <div class="table-info">{{ info }}</div>
        <slot />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  total: number
  limit: number
}>()

const route = useRoute()
const router = useRouter()

const offset = computed(() => {
    const v = Number(route.query.offset)
    return Number.isFinite(v) && v >= 0 ? v : 0
})

const info = computed(() => {
    const start = offset.value + 1
    const end = Math.min(offset.value + props.limit, props.total)
    return `${start}-${end} из ${props.total}`
})

function setOffset(v: number) {
    router.replace({
        query: {
            ...route.query,
            offset: String(v)
        }
    })
}

const canPrev = computed(() => offset.value > 0)
const canNext = computed(() => offset.value + props.limit < props.total)

const toStart = () => setOffset(0)
const toPrev = () => canPrev.value && setOffset(offset.value - props.limit)
const toNext = () => canNext.value && setOffset(offset.value + props.limit)
const toEnd  = () => {
    const last = Math.floor((props.total - 1) / props.limit) * props.limit
    setOffset(last)
}

</script>

<style scoped>
.table-footer {
    background: #2e3245;
    border-top: 2px solid #2a2e40;
    height: 50px;
    display: flex;
    align-items: center;
}
.table-nav {
    display: grid;
    grid-template-columns: 48px 48px 48px 48px;
    height: 100%;
    padding-top: 2px;
}
.table-nav-btn {
    background-size: 20px 20px;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(1);
    opacity: .45;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
.table-nav-btn.disabled {
    opacity: .2;
}
.table-nav-btn:not(.disabled):hover {
    cursor: pointer;
    opacity: .6;
}
.table-nav-btn.start {
    background-image: url('/img/table/end.png');
}
.table-nav-btn.prev {
    background-image: url('/img/table/page.png');
}
.table-nav-btn.next {
    background-image: url('/img/table/page.png');
    transform: rotate(180deg);
}
.table-nav-btn.end {
    background-image: url('/img/table/end.png');
    transform: rotate(180deg);
}
.table-info {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 10px;
    font-variant-numeric: tabular-nums;
    opacity: .7;
    font-size: 14px;
}
</style>
