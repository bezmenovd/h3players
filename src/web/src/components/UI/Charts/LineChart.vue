<template>
    <div class="chart">
        <div class="chart-line">
            <svg :width="props.width" :height="props.height" :view-box="`0 0 ${props.width} ${props.height}`">
                <polyline v-for="(line, key) in lines"
                    :key="key"
                    fill="none"
                    :stroke="props.color"
                    stroke-width="1"
                    :points="line.map(([x, y]) => `${x},${y}`).join(' ')"/>
            </svg>
        </div>
        <div class="chart-ui">
            <div v-for="(block, key) in noData"
                class="no-data"
                :key="key"
                :style="`right: ${props.width - block[1]}px; width: ${block[1] - block[0]}px`"
            >
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted } from 'vue';

const props = defineProps<{
    width: number,
    height: number,
    data: (number|null)[],
    max: number,
    color: string,
}>()

const lines = computed<[number, number][][]>(() => {
    let result: [number, number][][] = []
    let currentLine: [number, number][] = []

    props.data.forEach((value, i) => {
        if (value !== null) {
            currentLine.push([i, props.height - Math.round((value / props.max) * props.height)])
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

</script>

<style>
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
    background: #ff000017;
    height: 100%;
    top: 0;
}
</style>
