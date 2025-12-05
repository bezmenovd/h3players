<template>
    <div class="chart" :id="id" :style="`height: ${ props.height ?? '100%' }`">
        <div class="chart-content" :style="`${ showScroll ? `height: calc(100% - 16px)` : `height: 100%` }`">
            <template v-if="show">
                <div class="chart-line" :style="`width: ${fullWidthRef}px; right: ${right}px`">
                    <svg width="100%" height="100%" :viewBox="`0 0 ${fullWidthRef} ${heightRef}`">
                        <template v-for="(itemLines, j) in lines">
                            <polyline v-for="(line, key) in itemLines"
                                :key="key"
                                fill="none"
                                :stroke="props.colors[j]"
                                stroke-width="1"
                                :points="line.map(([x, y]) => `${x},${y}`).join(' ')"
                            />
                        </template>
                    </svg>
                </div>
                <div class="chart-no-data" v-if="props.showNoData" :style="`width: ${fullWidthRef}px; right: ${right}px`">
                    <div v-for="(block, key) in noData"
                        class="chart-no-data-item"
                        :key="key"
                        :style="`right: ${widthRef - block[1]}px; width: ${block[1] - block[0]}px`"
                    >
                    </div>
                </div>
                <div class="chart-grid-yaxis" v-if="props.showGrid">
                    <template v-for="label in yLabels">
                        <div class="chart-grid-yaxis-label" :style="`bottom: ${ Math.min(Math.max(Math.round((label / props.max[0]) * heightRef - 7), 0), heightRef-14) }px`">{{ label }}</div>
                        <div class="chart-grid-yaxis-line" v-if="label > 0 && label < props.max[0]" :style="`bottom: ${ Math.round((label / props.max[0]) * heightRef) }px; width: ${widthRef}px; left: ${ String(label).length * 7.5 + 4 }px`"></div>
                    </template>
                </div>
                <div class="chart-grid-xaxis-wrapper" v-if="props.showGrid">
                    <div class="chart-grid-xaxis" :style="`width: ${fullWidthRef}px; right: ${right}px`">
                        <template v-for="(label, pos) in xLabels">
                            <div class="chart-grid-xaxis-label" :style="`left: ${ Math.min(Math.max(Math.round((pos / props.data.length) * fullWidthRef), 0), fullWidthRef) }px`">{{ label }}</div>
                            <div class="chart-grid-xaxis-line" :style="`left: ${ Math.min(Math.max(Math.round((pos / props.data.length) * fullWidthRef), 0), fullWidthRef) }px`"></div>
                        </template>
                    </div>
                </div>
                <div class="chart-ui">
                    <div class="cursor" :style="`left: ${cursorX-1}px`" v-if="mouse.in">
                        <div class="cursor-line" v-if="props.data[cursorIndex]" />
                        <div class="cursor-tooltip" v-if="props.data[cursorIndex]" :style="tooltipStyle">
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
                            <div class="cursor-dot" v-if="props.data[cursorIndex]" :style="`bottom: ${ ((props.data[cursorIndex]![j]) / props.max[j]) * heightRef }px; background: radial-gradient(circle, ${color} 0%, ${color} 30%, transparent 90%);`" :key="j"/>
                        </template>
                    </div>
                </div>
            </template>
        </div>
        <div class="chart-scroll" v-if="showScroll">
            <div class="chart-scroll-button" :style="`width: ${ scrollButtonWidth }px; left: ${ scrollButtonX }px`"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { generateYLabels } from './linechart';

const props = defineProps<{
    id: string,
    height?: string,
    size?: number,
    colors: string[],
    data: (number[]|undefined)[]
    labels: (string|undefined)[],
    max: number[],
    formatters: ((value: number) => string)[]
    showNoData?: boolean,
    showGrid?: boolean,
    xLabels?: { [key: number]: string },
}>()

const widthRef = ref(0)
const heightRef = ref(0)

const fullWidthRef = ref(0)

const show = ref(false)

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
                currentLines[j].push([Math.round(i / (props.data.length-1) * fullWidthRef.value), Math.round(heightRef.value - (Number(props.data[i]![j]) / props.max[j]) * heightRef.value)])
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
                result.push([currentNoDataStart, Math.round(i / (props.data.length-1) * fullWidthRef.value)])
                currentNoDataStart = -1
            }
        } else {
            if (currentNoDataStart === -1) {
                currentNoDataStart = Math.round(i / (props.data.length-1) * fullWidthRef.value)
            }
        }
    }

    if (currentNoDataStart !== -1) {
        result.push([currentNoDataStart, fullWidthRef.value])
    }

    return result
})

const cursorIndex = computed<number>(() => {
    if (props.data.length <= 1 || fullWidthRef.value <= 0) {
        return 0
    }
    
    const currentShift = fullWidthRef.value - widthRef.value + right.value
    const absoluteX = mouse.x + currentShift 
    const index = Math.round((absoluteX / fullWidthRef.value) * (props.data.length-1))
    
    return Math.max(0, Math.min((props.data.length-1), index))
})

const cursorX = computed<number>(() => {
    if (props.data.length <= 1) {
        return 0
    }

    const theoreticalX = Math.round((cursorIndex.value / (props.data.length-1)) * fullWidthRef.value)
    const currentShift = fullWidthRef.value - widthRef.value + right.value
    const value = theoreticalX - currentShift

    return value
})

const mouse = reactive({
    in: false,
    x: 0,
})

const labelWidth = ref(0)
const valuesWidth = ref(0)

watch(cursorIndex, async () => {
    await nextTick() 
    
    const labelEl = document.querySelector(`#${props.id} .cursor-label`) as HTMLElement
    const valuesEl = document.querySelector(`#${props.id} .cursor-values`) as HTMLElement
    
    labelWidth.value = labelEl ? labelEl.getBoundingClientRect().width : 0
    valuesWidth.value = valuesEl ? valuesEl.getBoundingClientRect().width : 0
}, { immediate: true })

const tooltipStyle = computed<string>(() => {
    const currentLabelWidth = labelWidth.value
    const currentValuesWidth = valuesWidth.value
    
    if (cursorX.value < currentLabelWidth) {
        return `transform: translateX(${(currentLabelWidth - cursorX.value)}px)`
    }

    if (widthRef.value - cursorX.value < currentValuesWidth) {
        return `transform: translateX(-${(currentValuesWidth - (widthRef.value - cursorX.value))}px)`
    }

    return ''
})

const showScroll = computed<boolean>(() => {
    return props.size ? props.size > 0 : false
})
const useScroll = computed<boolean>(() => {
    return props.size ? props.size < props.data.length : false
})

const scrollButtonWidth = ref(0)
const scrollButtonX = ref(0)
const scrollPos = computed<number>(() => {
    return Math.round(((scrollButtonX.value - 2) / (widthRef.value - 4)) * props.data.length)
})
const right = computed<number>(() => {
    if (! useScroll.value) {
        return 0
    }

    return Math.min(0, ((props.data.length - props.size!) - scrollPos.value) * (fullWidthRef.value / props.data.length) * -1)
})

const yLabels = ref<number[]>([])

let scrollHandler: (event: PointerEvent) => void

onMounted(async () => {
    let chartContentElement = document.querySelector(`#${props.id} .chart-content`)! as HTMLElement
    let chartContentRect = chartContentElement.getBoundingClientRect()
    let offsetLeft = chartContentRect.left

    widthRef.value = chartContentElement.clientWidth
    heightRef.value = chartContentElement.clientHeight

    fullWidthRef.value = props.size ? (widthRef.value / props.size) * props.data.length : widthRef.value

    if (showScroll.value) {
        scrollButtonWidth.value = Math.min(Math.round((props.size! / props.data.length) * (widthRef.value - 4)), widthRef.value-4)
        scrollButtonX.value = Math.round(((props.data.length - props.size!) / props.data.length) * (widthRef.value - 2)) + 2
    }

    if (props.showGrid) {
        yLabels.value = generateYLabels(props.max[0])
        props.max[0] = yLabels.value[yLabels.value.length-1]
    }

    show.value = true
    
    await nextTick()

    let uiElement = document.querySelector(`#${props.id} .chart-ui`)! as HTMLElement

    {
        uiElement.addEventListener('mousemove', (event) => {
            mouse.in = true
            mouse.x = event.clientX - offsetLeft
        })
    
        uiElement.addEventListener('mouseleave', () => {
            mouse.in = false
        })
    }

    if (useScroll.value) {
        let scrollButtonElement = document.querySelector(`#${props.id} .chart-scroll-button`)! as HTMLElement
        let scrolling = false
    
        scrollButtonElement.addEventListener('pointerdown', (event: PointerEvent) => {
            scrolling = true
            scrollButtonElement.setPointerCapture(event.pointerId);
        })
        scrollButtonElement.addEventListener('pointerup', (event: PointerEvent) => {
            if (! scrolling) {
                return
            }
            scrolling = false
            scrollButtonElement.releasePointerCapture(event.pointerId);
        })

        scrollHandler = (event: PointerEvent) => {
            if (! scrolling) {
                return
            }

            let newScrollXValue = scrollButtonX.value + event.movementX
            newScrollXValue = Math.max(newScrollXValue, 2)
            newScrollXValue = Math.min(newScrollXValue, widthRef.value - 2 - scrollButtonWidth.value)
            scrollButtonX.value = newScrollXValue
        }

        window.addEventListener('pointermove', scrollHandler)

        uiElement.addEventListener('wheel', (event: WheelEvent) => {
            let delta = Math.round(event.deltaX + event.deltaY) * (widthRef.value / props.size!) / 100
            let newScrollXValue = scrollButtonX.value + delta
            newScrollXValue = Math.max(newScrollXValue, 2)
            newScrollXValue = Math.min(newScrollXValue, widthRef.value - 2 - scrollButtonWidth.value)
            scrollButtonX.value = newScrollXValue
        })

    }
})

onUnmounted(() => {
    if (scrollHandler) {
        window.removeEventListener('pointermove', scrollHandler)
    }
})

</script>

<style scoped>
.chart {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    outline: 1px solid #454959;
    display: block;
}
.chart-content {
    width: 100%;
    height: 100%;
    position: relative;
}
.chart-grid-yaxis {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1;
}
.chart-grid-yaxis-label {
    position: absolute;
    left: 0;
    pointer-events: none;
    opacity: .4;
    font-variant-numeric: tabular-nums;
    font-size: 12px;
    padding: 1px;
}
.chart-grid-yaxis-line {
    position: absolute;
    height: 1px;
    border: 1px dashed #ffffff0f;
}
.chart-grid-xaxis {
    pointer-events: none;
    position: absolute;
    bottom: 0;
    height: 100%;
    z-index: 1;
}
.chart-grid-xaxis-wrapper {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 60px;
    height: 100%;
    width: calc(100% - 60px);
    overflow: hidden;
}
.chart-grid-xaxis-label {
    position: absolute;
    bottom: 0;
    pointer-events: none;
    opacity: .4;
    font-variant-numeric: tabular-nums;
    font-size: 12px;
    padding: 1px;
    transform: translateX(-50%);
}
.chart-grid-xaxis-line {
    position: absolute;
    width: 1px;
    height: calc(100% - 16px);
    bottom: 16px;
    border: 1px dashed #ffffff0f;
    transform: translateX(-2px);
}
.chart-scroll {
    height: 16px;
    width: 100%;
    border-top: 1px solid #454959;
    padding: 2px;
    position: relative;
}
.chart-scroll-button {
    background: #ffffff10;
    position: absolute;
    top: 2px;
    height: calc(100% - 4px);
    width: 100px;
}
.chart-scroll-button:hover {
    background: #ffffff1a;
    cursor: pointer;
}
.chart-line {
    height: 100%;
    position: absolute;
    z-index: 2;
    top: 0;
    right: 0;
}
.chart-ui {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 5;
    top: 0;
    right: 0;
}
.chart svg {
    right: 0;
    position: absolute;
}
.chart-no-data {
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
}
.chart-no-data-item {
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
    z-index: 99;
}
.cursor-label {    
    position: absolute;
    border: 1px solid #454959;
    border-right: none;
    padding: 3px 8px 3px 6px;
    white-space: nowrap;
    font-size: 12px;
    right: 0px;
    font-variant-numeric: tabular-nums;
}
.cursor-values {
    position: absolute;
    display: flex;
    left: 0px;
    padding-left: 1px;
    flex-direction: column;
    border: 1px solid #454959;
    /* border-left: none; */
}
.cursor-value {
    padding: 3px 6px;
    white-space: nowrap;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-variant-numeric: tabular-nums;
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
    background: #ffffff1c;
}
.cursor-dot {
    width: 3px;
    height: 3px;
    position: absolute;
    border-radius: 50%;
    transform: translate(-1px, 1px);
}
</style>
