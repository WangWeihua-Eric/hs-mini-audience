import {HttpUtil} from "../../../../utils/http-utils/http-util";

let singletonPattern = null;

export class RoomInfoService {
    http = new HttpUtil()

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }

    /**
     * 查询房间信息
     */
    queryRoomInfo(sessionId, roomId) {
        const roomIdTemp = roomId.replace('room_', '')
        return new Promise((resolve, reject) => {
            const url = '/room/api/room'
            const params = {
                appSign: 'hongsongkebiao',
                sessionId: sessionId,
                roomId: roomIdTemp
            }
            this.http.get(url, params).then(res => {
                if (res && res.state && res.state.code === '0') {
                    resolve(res.data)
                } else {
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
        })
    }
}