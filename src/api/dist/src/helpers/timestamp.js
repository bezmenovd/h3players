"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.date = exports.datetime = exports.timestamp = void 0;
exports.timestamp = {
    now() {
        return Math.floor(Date.now() / 1000);
    },
    startOfDay() {
        let start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        return Math.floor(start.getTime() / 1000);
    },
    // from(datetime: string): number {
    //     let 
    // }
};
exports.datetime = {
    from(timestamp) {
        let date = new Date(timestamp * 1000);
        let year = date.getFullYear();
        let month = String(date.getMonth()).padStart(2, '0');
        let day = String(date.getDate()).padStart(2, '0');
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
};
exports.date = {
    from(timestamp) {
        let date = new Date(timestamp * 1000);
        let year = date.getFullYear();
        let month = String(date.getMonth()).padStart(2, '0');
        let day = String(date.getDate()).padStart(2, '0');
        return `${day}.${month}.${year}`;
    },
};
