let singletonPattern = null;

export class UserBase {

    globalData = {}

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }

    getGlobalData() {
        return this.globalData
    }

    setGlobalData(data) {
        this.globalData = {
            ...this.globalData,
            ...data
        }
    }

    initGlobalData() {
        this.globalData = {}
    }
}