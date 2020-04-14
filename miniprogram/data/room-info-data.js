let singletonPattern = null;

export class RoomInfoData {
    roomInfo = {}
    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }

    setRoomInfo(info) {
        this.roomInfo = {
            ...this.roomInfo,
            ...info
        }
    }

    getRoomInfo() {
        return this.roomInfo
    }
}