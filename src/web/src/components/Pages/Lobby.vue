<template>
    <div id="lobby">
        <Panel id="online">
            <Loader v-if="loading" />
            <template v-else>
                <div id="online-chart">
    
                </div>
                <div id="lobby-metrics">
                    <div id="lobby-metrics-online">
                        <template v-if="onlineFormatted">
                            <Pulse /> {{ onlineFormatted }} онлайн
                        </template>
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


online().then(r => {
    data.online = r
    loading.value = false
})

setInterval(() => {
    online(Math.floor(Date.now() / 1000) - 60).then(r => {
        data.online = [...data.online.slice(-(2000 - r.length)), ...r]
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
#lobby-metrics-online {
    display: flex;
    gap: 7px;
    align-items: center;
}
</style>
