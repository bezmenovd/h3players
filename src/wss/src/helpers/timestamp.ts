
export default {
    now() {
        return Math.floor(Date.now() / 1000)
    },
    startOfDay() {
        let start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        return Math.floor(start.getTime() / 1000)
    }
}
