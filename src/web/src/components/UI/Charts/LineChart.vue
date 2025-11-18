<template>
    <div class="chart" :id="id" :style="`height: ${props.height}px`">
        <div class="chart-line">
            <svg :width="props.width" :height="props.height" :viewBox="`0 0 ${props.width} ${props.height}`">
                <template v-for="(itemLines, j) in lines">
                    <polyline v-for="(line, key) in itemLines"
                        :key="key"
                        fill="none"
                        :stroke="props.colors[j]"
                        stroke-width="1"
                        :points="line.map(([x, y]) => `${x},${y}`).join(' ')"/>
                </template>
            </svg>
        </div>
        <div class="chart-ui">
            <div v-for="(block, key) in noData"
                class="no-data"
                :key="key"
                :style="`right: ${props.width - block[1]}px; width: ${block[1] - block[0]}px`"
            >
            </div>
            <div class="cursor" :style="`left: ${cursorX-1}px`" v-if="mouse.in">
                <div class="cursor-line" v-if="props.data[cursorIndex]" />
                <div class="cursor-tooltip" :style="tooltipStyle">
                    <div class="cursor-values">
                        <template v-for="(color, j) in props.colors">
                            <div 
                                v-if="props.data[cursorIndex]"
                                :key="j"
                                class="cursor-value" 
                                :style="`top: ${(j*16)}px`"
                            >
                                <div class="cursor-value-dot" :style="`background-color: ${color};`"/>
                                {{ props.formatters[j](props.data[cursorIndex]![j]) }}
                            </div>
                        </template>
                    </div>
                    <div v-if="props.labels[cursorIndex]" class="cursor-label">{{ props.labels[cursorIndex] }}</div>
                </div>
                <template v-for="(color, j) in props.colors">
                    <div class="cursor-dot" v-if="props.data[cursorIndex]" :style="`bottom: ${ ((props.data[cursorIndex]![j]) / props.max) * props.height }px; background: ${color};`" :key="j"/>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, reactive, ref } from 'vue';

const props = defineProps<{
    id: string,
    width: number,
    height: number,
    colors: string[],
    data: (number[]|undefined)[]
    labels: (string|undefined)[],
    max: number,
    formatters: ((value: number) => string)[]
    showNoData: boolean,
}>()

const lines = computed<[number, number][][][]>(() => {
    let result: [number, number][][][] = []
    let currentLines: [number, number][][] = []
    let itemLength = props.colors.length

    for (let j = 0; j < itemLength; j++) {
        result[j] = []
        currentLines[j] = []
    }

    for (let i = 0; i < props.data.length; i++) {
        if (props.data[i] !== undefined) {
            for (let j = 0; j < itemLength; j++) {
                currentLines[j].push([Math.round(i / props.data.length * props.width), Math.round(props.height - (Number(props.data[i]![j]) / props.max) * props.height)])
            }
        } else {
            for (let j = 0; j < itemLength; j++) {
                if (currentLines[j].length > 0) {
                    result[j].push(currentLines[j])
                    currentLines[j] = []
                }
            }
        }
    }

    for (let j = 0; j < itemLength; j++) {
        if (currentLines[j].length > 0) {
            result[j].push(currentLines[j])
        }
    }
    
    return result
})

const noData = computed<[number, number][]>(() => {
    if (! props.showNoData) {
        return []
    }

    let result: [number, number][] = []
    let currentNoDataStart: number = -1

    for (let i = 0; i < props.data.length; i++) {
        if (props.data[i] !== undefined) {
            if (currentNoDataStart !== -1) {
                result.push([currentNoDataStart, i])
                currentNoDataStart = -1
            }
        } else {
            if (currentNoDataStart === -1) {
                currentNoDataStart = i
            }
        }
    }

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

const mouse = reactive({
    in: false,
    x: 0,
    offset: 0,
})

const width = computed<number>(() => {
    return document.querySelector(`#${props.id} .chart-ui`)?.getBoundingClientRect().width ?? 0
})

const valuePadding = computed<number>(() => {
    let maxLength = 0

    props.data.forEach(item => {
        if (item) {
            item.forEach((val, j) => {
                let valStr = props.formatters[j](val)
                if (valStr.length > maxLength) {
                    maxLength = valStr.length
                }
            })
        }
    })

    return 22 + (maxLength * 6.5)
})

const labelPadding = computed<number>(() => {
    let maxLength = 0

    props.labels.forEach(label => {
        if (label && label.length > maxLength) {
            maxLength = label.length
        }
    })

    return 22 + (maxLength * 6.5)
})

const tooltipStyle = computed<string>(() => {
    if (cursorX.value < labelPadding.value) {
        return `transform: translateX(${(labelPadding.value - cursorX.value)}px)`
    }
    if (width.value - cursorX.value < valuePadding.value) {
        return `transform: translateX(-${(valuePadding.value - (width.value - cursorX.value))}px)`
    }

    return ''
})

onMounted(() => {
    let uiElement = document.querySelector(`#${props.id} .chart-ui`)! as HTMLElement
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
    position: relative;
    overflow: hidden;
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
.cursor-tooltip {
    position: absolute;
    top: 5px;
}
.cursor-label {    
    position: absolute;
    background: #2e3245;
    padding: 3px 8px 3px 6px;
    white-space: nowrap;
    font-size: 12px;
    right: 0px;
}
.cursor-values {
    position: absolute;
    display: flex;
    left: 0px;
    padding-left: 1px;
    flex-direction: column;
    background: #2e3245;
}
.cursor-value {
    padding: 3px 6px;
    white-space: nowrap;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
}
.cursor-value-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    position: relative;
    top: 1px;
}
.cursor-line {
    height: 100%;
    width: 1px;
    background: #2e3245c9;
}
.cursor-dot {
    width: 3px;
    height: 3px;
    position: absolute;
    border-radius: 50%;
    transform: translate(-1px, 1px);
}
</style>
