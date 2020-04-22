import {HttpUtil} from "../utils/http-utils/http-util";

const liveroom = require('../pages/components/mlvb-live-room/mlvbliveroomcore.js')

let singletonPattern = null;

export class RoomService {
    http = new HttpUtil()

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }

    /**
     * 登录房间
     */
    loginRoom(roomId, userName, userSig, roomAppId) {

        const loginInfo = {
            sdkAppID: roomAppId,
            userID: roomId,
            userSig: userSig,
            userName: userName,
            userAvatar: ''
        }

        return new Promise((resolve, reject) => {
            //  MLVB 登录
            liveroom.login({
                data: loginInfo,
                success: (res) => {
                    //  登录成功
                    resolve(res)
                },
                fail: (err) => {
                    //  登录失败
                    reject(err)
                }
            })
        })
    }

    /**
     * 获取连麦列表
     */
    linkmicList(sessionId, roomId) {
        return new Promise((resolve, reject) => {
            const url = '/room/api/linkmic/list'
            const params = {
                appSign: 'hongsongkebiao',
                sessionId: sessionId,
                roomId: roomId
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

    /**
     * 老师拒绝连麦
     */
    teacherLinkmicPop(sessionId, roomId, userId) {
        return new Promise((resolve, reject) => {
            const url = '/room/api/anchor/linkmic/pop'
            const params = {
                appSign: 'hongsongkebiao',
                sessionId: sessionId,
                roomId: roomId,
                userId: userId
            }
            this.http.post(url, params).then(res => {
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

    /**
     * 加入连麦
     */
    linkmicPush(sessionId, roomId) {
        return new Promise((resolve, reject) => {
            const url = '/room/api/linkmic/push'
            const params = {
                appSign: 'hongsongkebiao',
                sessionId: sessionId,
                roomId: roomId
            }
            this.http.post(url, params).then(res => {
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

    /**
     * 取消连麦
     */
    linkmicPop(sessionId, roomId) {
        return new Promise((resolve, reject) => {
            const url = '/room/api/linkmic/pop'
            const params = {
                appSign: 'hongsongkebiao',
                sessionId: sessionId,
                roomId: roomId
            }
            this.http.post(url, params).then(res => {
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

    /**
     * 查询连麦权限
     */
    queryLinkmicState(sessionId, roomId) {
        const roomIdTemp = roomId.replace('room_', '')
        return new Promise((resolve, reject) => {
            const url = '/room/api/linkmic/state'
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

    /**
     * 查询问题 tag
     */
    queryConfig(sessionId, roomId) {
        const roomIdTemp = roomId.replace('room_', '')
        const url = '/room/api/config'
        const params = {
            sessionId: sessionId,
            roomId: roomIdTemp,
            appSign: 'hongsongkebiao',
            version: 1
        }
        return this.http.newGet(url, params)
    }

    /**
     * 保存用户标签
     */
    savetags(sessionId, groupId, tagIds) {
        const url = '/user/api/savetags'
        const params = {
            sessionId: sessionId,
            groupId: groupId,
            tagIds: tagIds.toString()
        }
        return this.http.newPost(url, params)
    }

    /**
     * 提交连麦反馈
     */
    savecsi(sessionId, csiData, csiType = 'linkmic') {
        const url = '/user/api/savecsi'
        const params = {
            sessionId: sessionId,
            csiType: csiType,
            csiData: JSON.stringify(csiData)
        }
        return this.http.newPost(url, params)
    }

    /**
     * 查询当前连麦的人
     */
    querylinkmicOnmicList(sessionId, roomId) {
        const roomIdTemp = roomId.replace('room_', '')
        const url = '/room/api/linkmic/onmiclist'
        const params = {
            sessionId: sessionId,
            roomId: roomIdTemp,
        }
        return this.http.newGet(url, params)
    }

    /**
     * 获取房间支付鉴权
     */
    getRoomPayInfo(sessionId, code, productId, data) {
        const url = '/order/api/wechat/micro/order'
        const params = {
            appSign: 'hongsongkankanba',
            sessionId: sessionId,
            code: code,
            productId: productId,
            data: data
        }
        return this.http.newGet(url, params)
    }
}