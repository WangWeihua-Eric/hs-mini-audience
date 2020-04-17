import {getSessionId, newGetSessionId} from "../user-utils/user-base-utils";
import {UserBase} from "../user-utils/user-base";
import {getUserInfo} from "./wx-base-utils";

export function login(cloudID) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'login',
            data: {
                UnionID: wx.cloud.CloudID(cloudID),
                obj: {
                    shareInfo: wx.cloud.CloudID(cloudID), // 非顶层字段的 CloudID 不会被替换，会原样字符串展示
                }
            },
            success: res => {
                resolve(res)
            },
            fail: error => {
                reject(error)
            }
        })
    })
}

export function http(url, param, method, header = {'content-type': 'application/x-www-form-urlencoded'}) {
    if (!param.appSign) {
        param = {
            ...param,
            appSign: 'hongsongkankanba'
        }
    }
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'http',
            data: {
                url: url,
                param: param,
                method: method,
                header: header
            },
            success: res => {
                if (res && res.result && res.result.state && res.result.state.code === '401') {
                    getUserInfo().then(userInfo => {
                        return newGetSessionId(userInfo)
                    }).then((sessionInfo) => {
                        if (sessionInfo) {
                            const sessionId = sessionInfo.sessionId
                            if (sessionId) {
                                wx.cloud.callFunction({
                                    name: 'http',
                                    data: {
                                        url: url,
                                        param: {
                                            ...param,
                                            sessionId: sessionId
                                        },
                                        method: method,
                                        header: header
                                    },
                                    success: again => {
                                        resolve(again)
                                    },
                                    fail: againError => {
                                        reject(againError)
                                    }
                                })
                                wx.setStorage({
                                    key:"sessionId",
                                    data: {
                                        ...sessionInfo,
                                        updateTime: new Date().getTime()
                                    }
                                })

                            } else {
                                reject('sessionInfo 响应空')
                            }
                        }
                    })
                } else {
                    resolve(res)
                }
            },
            fail: error => {
                reject(error)
            }
        })
    })
}