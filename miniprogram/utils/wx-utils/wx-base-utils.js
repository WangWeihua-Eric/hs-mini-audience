/**
 * 查询是否授权
 * @param scope 授权内容
 */
export function getSetting(scope) {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (res) => {
                resolve(res.authSetting[scope])
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({
            success: res => {
                resolve(res)
            },
            fail: error => {
                reject(error)
            }
        })
    })
}

/**
 * 获取订阅授权
 */
export function getSettingWithSubscriptions() {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            withSubscriptions: true,
            success: res => {

                resolve(res)
                // res.authSetting = {
                //   "scope.userInfo": true,
                //   "scope.userLocation": true
                // }
                // res.subscriptionsSetting = {
                //   mainSwitch: true, // 订阅消息总开关
                //   itemSettings: {   // 每一项开关
                //     SYS_MSG_TYPE_INTERACTIVE: 'accept', // 小游戏系统订阅消息
                //     SYS_MSG_TYPE_RANK: 'accept'
                //     zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE: 'reject', // 普通一次性订阅消息
                //     ke_OZC_66gZxALLcsuI7ilCJSP2OJ2vWo2ooUPpkWrw: 'ban',
                //   }
                // }
            },
            fail: error => {
                reject(error)
            }
        })

    })
}

/**
 * 获取微信缓存
 */
export function getStorage(key) {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key: key,
            success: (res) => {
                resolve(res.data)
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}

/**
 * 分享来源获取
 */
export function getShareInfo(shareTicket) {
    return new Promise((resolve, reject) => {
        wx.getShareInfo({
            shareTicket: shareTicket,
            success: (shareInfo) => {
                resolve(shareInfo)
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}

export function wxLogin() {
    return new Promise((resolve, reject) => {
        wx.login({
            success : res => {
                if (res.code) {
                    resolve(res)
                } else {
                    reject(res)
                }
            },
            fail: error => {
                reject(error)
            }
        })
    })
}

export function wxSubscribeMessage(tmplIds) {
    return new Promise((resolve, reject) => {
        wx.requestSubscribeMessage({
            tmplIds: tmplIds,
            success: res => {
                resolve(res)
            },
            fail: error => {
                reject(error)
            }
        })
    })
}

/**
 * 微信页面跳转
 */
export function pageJump(url) {
    return new Promise((resolve, reject) => {
        wx.navigateTo({
            url: url,
            success: res => {
                resolve(res)
            },
            fail: error => {
                reject(error)
            }
        })
    })
}

/**
 * 返回上一个小程序
 */
export function backJump(extraData = {}) {
    return new Promise((resolve, reject) => {
        wx.navigateBackMiniProgram({
            extraData: extraData,
            success: (res) => {
                // 返回成功
                resolve(res)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

/**
 * 跳转新小程序
 */
export function jumpNewMini(appId, path = '', envVersion = 'trial') {
    return new Promise((resolve, reject) => {
        wx.navigateToMiniProgram({
            appId: appId,
            path: path,
            envVersion: envVersion,
            success: (res) => {
                resolve(res)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}

/**
 * 获取系统信息
 */
export function getSystemInfo() {
    return new Promise((resolve, reject) => {
        wx.getSystemInfo({
            success: res => {
                resolve(res)
            },
            fail: err => {
                reject(err)
            }
        })
    })
}

/**
 * 下载在线文件
 */
export function getOnlineFile(url) {
    return new Promise((resolve, reject) => {
        wx.downloadFile({
            url: url,
            success: res => {
                resolve(res)
            },
            fail: err => {
                reject(err)
            }
        })
    })
}

/**
 * 保存图片到相册
 */
export function saveImg(filePath) {
    return new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
            filePath: filePath,
            success: res => {
                resolve(res)
            },
            fail: err => {
                reject(err)
            }
        })
    })
}