import {HttpUtil} from "../../../utils/http-utils/http-util";

let singletonPattern = null;

export class LiveRoomListService {
    http = new HttpUtil()

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }

    /**
     * 获取房间列表
     */
    queryRoomList(sessionId) {
        const url = '/room/api/anchor/roomlist'
        const params = {
            appSign: 'hongsongzhibozhushou',
            sessionId: sessionId
        }

        return new Promise((resolve, reject) => {
            this.http.post(url, params).then(res => {
                if (res && res.state && res.state.code === '0') {
                    resolve(res.data)
                } else {
                    reject(res)
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }
}