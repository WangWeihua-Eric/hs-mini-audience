import {getStorage, wxLogin} from "../wx-utils/wx-base-utils";
import {HttpUtil} from "../http-utils/http-util";
import {UserBase} from "./user-base";

const userBase = new UserBase()

/**
 * 获取 sessionId
 */
export function getSessionId() {
    const http = new HttpUtil()
    return wxLogin().then(res => {
        if (res.code) {
            const url = '/auth/api/wechatlogin'
            const param = {
                appSign: 'livehouse',
                code: res.code
            }
            return http.post(url, param, 'login')
        }
    })
}

export function isSessionReady() {
    return new Promise((resolve, reject) => {
        if (userBase.getGlobalData().sessionId) {
            //  成功获取 sessionId
            resolve(true)
        } else {
            setTimeout(() => {
                isSessionReady().then(res => {
                    resolve(res)
                })
            }, 100)
        }
    })
}

export function initSessionId() {
    getStorage('sessionId').then(sessionInfo => {
        checkSessionInfo(sessionInfo)
    }).catch(error => {
        setSessionId()
    })
}

function setSessionId() {
    getSessionId().then(res => {
        if (res && res.state && res.state.code === '0' && res.data) {
            const sessionId = res.data.sessionId
            if (sessionId) {
                userBase.setGlobalData(res.data)
                wx.setStorage({
                    key:"sessionId",
                    data: {
                        ...res.data,
                        updateTime: new Date().getTime()
                    }
                })

            }
        }
    })
}

function checkSessionInfo(sessionInfo) {
    const nowTime = new Date().getTime()
    if (sessionInfo) {
        const updateTime = sessionInfo.updateTime
        const sessionId = sessionInfo.sessionId
        const authed = sessionInfo.authed
        const userId = sessionInfo.userId
        if (sessionId && updateTime && (nowTime - updateTime) < 6 * 60 * 60 * 1000) {
            userBase.setGlobalData({sessionId: sessionId, authed: authed, userId: userId})
        } else {
            setSessionId()
        }
    } else {
        setSessionId()
    }
}