/**
 * 格式化时间戳为 M:D H:M
 */
export function formatTime(time) {
    const thisTime = new Date(time)
    const startTime = new Date(new Date().toLocaleDateString()).getTime() // 当天 0 点
    const endTime = new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 // 当天 24 点

    if (startTime < time && time < endTime) {
        return `今天 ${addZeroForDay(thisTime.getHours())}:${addZeroForDay(thisTime.getMinutes())}`
    } else {
        return `${thisTime.getMonth() + 1}月${thisTime.getDate()}日 ${addZeroForDay(thisTime.getHours())}:${addZeroForDay(thisTime.getMinutes())}`
    }
}

/**
 * 格式化时间戳 H:M
 * @param time
 * @returns {string}
 */
export function formatTimeHM(time) {
    const thisTime = new Date(time)
    return `${addZeroForDay(thisTime.getHours())}:${addZeroForDay(thisTime.getMinutes())}`
}

/**
 * 日期补 0 操作
 */
export function addZeroForDay(num) {
    return num < 10 ? '0' + num : num
}

let timeHandler = false

export function debounceForFunction(time = 1000) {
    if (timeHandler) {
        return true
    }
    timeHandler = true
    setTimeout(() => {
        timeHandler = false
    }, time)
    return false
}