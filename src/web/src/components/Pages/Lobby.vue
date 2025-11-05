<template>
    <div id="lobby">
        <Panel id="online">
            <Loader v-if="loading" />
            <template v-else>
                <div id="online-chart">
    
                </div>
                <div id="lobby-metrics" v-show="data.online.length > 0">
                    <div class="metric">
                        <div class="metric-value"><Pulse style="position: absolute; left: 22px"/>{{ onlineFormatted }}</div>
                        <div class="metric-name">онлайн</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{{ avgOnlineFormatted }}</div>
                        <div class="metric-name">средний</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">{{ maxOnlineFormatted }}</div>
                        <div class="metric-name">максимум</div>
                    </div>
                </div>
            </template>
        </Panel>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import Panel from './../UI/Panel.vue'
import Pulse from './../UI/Pulse.vue'
import { Online, online } from '../../api/lobby'
import Loader from '../UI/Loader.vue'

const data = reactive<{ online: Online[] }>({
    online: []
})

const loading = ref(true)

const onlineFormatted = computed(() => {
    let lastOnline = data.online.at(-1)
    if (lastOnline) {
        return Intl.NumberFormat('ru-RU').format(lastOnline.online)
    } else {
        return ''
    }
})

const avgOnlineFormatted = computed(() => {
    let value = Math.floor(data.online.reduce((acc, o) => acc + o.online, 0) / data.online.length)

    return Intl.NumberFormat('ru-RU').format(value)
})

const maxOnlineFormatted = computed(() => {
    let max = 0

    for (const o of data.online) {
        if (o.online > max) {
            max = o.online
        }
    }

    return Intl.NumberFormat('ru-RU').format(max)
})


online().then(r => {
    data.online = r
    loading.value = false
})

setInterval(() => {
    online(Math.floor(Date.now() / 1000) - 60).then(r => {
        data.online = [...data.online.slice(-(1440 - r.length)), ...r]
    })
}, 60_000)

</script>

<style scoped>
#online {
    width: 100%;
    height: 240px;
    display: grid;
    grid-template-columns: 1fr 180px;
}
#lobby-metrics {
    padding: 20px;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
}
.metric {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
}
.metric-value {
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.metric-name {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: .7;
    margin-top: 5px;
}
</style>
