<template>
    <div class="chart">
        <div class="chart-line">
            <svg :width="props.width" :height="props.height" :viewBox="`0 0 ${props.width} ${props.height}`">
                <polyline v-for="(line, key) in lines"
                    :key="key"
                    fill="none"
                    :stroke="props.color"
                    stroke-width="1"
                    :points="line.map(([x, y]) => `${x},${y}`).join(' ')"/>
            </svg>
        </div>
        <div class="chart-ui" ref="ui">
            <div v-for="(block, key) in noData"
                class="no-data"
                :key="key"
                :style="`right: ${props.width - block[1]}px; width: ${block[1] - block[0]}px`"
            >
            </div>
            <div class="cursor" :style="`left: ${cursorX}px`" v-if="mouse.in">
                <div class="cursor-line" v-if="props.data[cursorIndex]" />
                <div class="cursor-value" v-if="props.data[cursorIndex]">{{ props.data[cursorIndex] }}</div>
                <div class="cursor-label" v-if="props.labels[cursorIndex]">{{ props.labels[cursorIndex] }}</div>
                <div class="cursor-dot" v-if="props.data[cursorIndex]" :style="`bottom: ${ ((props.data[cursorIndex]!) / props.max) * props.height }px; background: ${props.color}`"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, reactive, ref } from 'vue';

const props = defineProps<{
    width: number,
    height: number,
    data: (number|null)[],
    labels: (string|null)[],
    max: number,
    color: string,
}>()

const lines = computed<[number, number][][]>(() => {
    let result: [number, number][][] = []
    let currentLine: [number, number][] = []

    props.data.forEach((value, i) => {
        if (value !== null) {
            currentLine.push([Math.round(i / props.data.length * props.width), Math.round(props.height - (value / props.max) * props.height)])
        } else {
            if (currentLine.length > 0) {
                result.push(currentLine)
                currentLine = []
            }
        }
    })

    if (currentLine.length > 0) {
        result.push(currentLine)
    }

    return result
})

const noData = computed<[number, number][]>(() => {
    let result: [number, number][] = []
    let currentNoDataStart: number = -1

    props.data.forEach((value, i) => {
        if (value !== null) {
            if (currentNoDataStart !== -1) {
                result.push([currentNoDataStart, i])
                currentNoDataStart = -1
            }
        } else {
            if (currentNoDataStart === -1) {
                currentNoDataStart = i
            }
        }
    })

    if (currentNoDataStart !== -1) {
        result.push([currentNoDataStart, props.width])
    }

    return result
})

const cursorIndex = computed<number>(() => {
    return props.data.length > 0 ? Math.round((mouse.x + mouse.offset) / props.data.length * props.width) : 0
})

const cursorX = computed<number>(() => {
    return Math.round((mouse.x / props.data.length * props.width) * (props.data.length / props.width))
})

const ui = ref<HTMLElement | null>(null)
const mouse = reactive({
    in: false,
    x: 0,
    offset: 0,
})

const width = computed<number>(() => {
    return ui.value?.getBoundingClientRect().width ?? 0
})

onMounted(() => {
    let uiElement = ui.value!
    let uiRect = uiElement.getBoundingClientRect()
    let offsetLeft = uiRect.left

    uiElement.addEventListener('mousemove', (event) => {
        mouse.in = true
        mouse.offset = props.width - width.value
        mouse.x = event.clientX - offsetLeft
    })

    uiElement.addEventListener('mouseleave', () => {
        mouse.in = false
    })
})

</script>

<style scoped>
.chart {
    width: 100%;
    max-width: 100%;
    height: 100%;
    position: relative;
    overflow-x: hidden;
    background: #242737;
}
.chart-line {
    width: 100%;
    height: 100%;
}
.chart-ui {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
}
.chart svg {
    right: 0;
    position: absolute;
}
.no-data {
    position: absolute;
    background: #ff000026;
    height: 100%;
    top: 0;
}
.cursor {    
    position: absolute;
    height: 100%;
    top: 0;
    width: fit-content;
}
.cursor-label {    
    position: absolute;
    top: 5px;
    right: 1px;
    background: #2e3245;
    padding: 3px 6px;
    white-space: nowrap;
    font-size: 12px;
}
.cursor-value {    
    position: absolute;
    top: 5px;
    left: 1px;
    background: #2e3245;
    padding: 3px 6px;
    white-space: nowrap;
    font-size: 12px;
}
.cursor-line {
    height: 100%;
    width: 1px;
    background: #2e3245;
}
.cursor-dot {
    width: 3px;
    height: 3px;
    position: absolute;
    border-radius: 50%;
    transform: translate(-1px, 1px);
}
</style>
