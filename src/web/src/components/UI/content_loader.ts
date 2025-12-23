import { reactive } from 'vue'

export const contentLoader = reactive({
    visible: false,
    show() {
        this.visible = true
    },
    hide() {
        this.visible = false
    }
})
