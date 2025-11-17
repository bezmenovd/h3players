<template>
    <Title :text="info.name"></Title>
    <Panel id="players-detail">
        <Loader v-if="loading"/>
        <template v-else>

        </template>
    </Panel>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import Panel from '../../UI/Panel.vue'
import Loader from '../../UI/Loader.vue'
import Title from '../../UI/Title.vue'
import { getPlayer } from '../../../api/players'
import { useRoute } from 'vue-router'
import { useNavigationStore } from '../../../stores/navigation'

const navigationStore = useNavigationStore()

const loading = ref(true)
const route = useRoute()

const info = reactive({
    id: parseInt(String(route.params.id)),
    name: '',
})

onMounted(async () => {
    navigationStore.setReturnPage({ name: 'players' })

    getPlayer(info.id).then(data => {
        info.name = data.name

        // loading.value = false
    })
})

onUnmounted(async () => {
    navigationStore.clearReturnPage()
})

</script>

<style>
#players-detail {
    min-height: 300px;
}
</style>
