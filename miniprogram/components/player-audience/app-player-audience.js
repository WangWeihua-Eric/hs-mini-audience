import {RoomService} from "../../service/roomService";
import {UserBase} from "../../utils/user-utils/user-base";
import {getSetting, requestPayment, wxLogin} from "../../utils/wx-utils/wx-base-utils";
import {RoomInfoData} from "../../data/room-info-data";
import {debounceForFunction} from "../../utils/time-utils/time-utils";

const webimhandler = require('../../pages/components/mlvb-live-room/webim_handler');
const liveroom = require('../../pages/components/mlvb-live-room/mlvbliveroomcore.js');

const roomService = new RoomService()
const userBase = new UserBase()
const roomInfoData = new RoomInfoData()

let roseNumber = 0
let roseTimeHandle = null
let isShowTag = true
let showPopLastTime = 0
let timeHandler = null
let time = 0
let payInfo = null

Component({
    component: null,

    /**
     * 组件的属性列表
     */
    properties: {
        roomTextList: {type: Array, value: []},
        showUserImgList: {type: Array, value: []},
        roomInfoData: {type: Object, value: {}},
        requestLinkError: {type: Boolean, value: false},
        requestLinkOk: {type: Boolean, value: false},
        linkPusherInfo: {type: Object, value: {}},
        preLinkInfo: {type: Object, value: {}},
        canLink: {type: Boolean, value: false},
        casterCloseLinkNumber: {type: Number, value: 0},
        roomData: {type: Object, value: {}},
        enterRoomList: {type: Array, value: []},
        linkMicPrice: {type: Object, value: {}}
    },

    observers: {
        "roomTextList": function (roomTextList) {
            if (roomTextList && roomTextList.length) {
                const id = `text-${roomTextList.length - 1}`
                this.setData({
                    toIndex: id
                })
            }
        },
        "showUserImgList": function (showUserImgList) {
            console.log('showUserImgList', showUserImgList)
            this.setData({
                userImgList: showUserImgList
            })
        },
        "casterCloseLinkNumber": function (casterCloseLinkNumber) {
            if (casterCloseLinkNumber) {
                const nowTime = new Date().getTime()
                if ((nowTime - showPopLastTime) > 60000) {
                    showPopLastTime = nowTime
                    this.setData({
                        showPop: true
                    })
                }
            }
        },
        "linkPusherInfo": function (linkPusherInfo) {
            if (!linkPusherInfo.url) {
                this.setData({
                    requestLinkOk: false
                })
            } else {
                isShowTag = true
                this.setData({
                    requestLinkOk: true
                })
            }
        },
        "requestLinkError": function (requestLinkError) {
            if (requestLinkError) {
                this.setData({
                    show: false
                })
                wx.showModal({
                    content: '老师拒绝了您的连麦，请重新申请',
                    showCancel: false
                })
                this.onCancelLink()
            }
        },
        "preLinkInfo": function (preLinkInfo) {
            const customMsg = {
                cmd: "AudienceToLink",
                data: {
                    link: true,
                    userId: userBase.getGlobalData().userId
                }
            }
            if (preLinkInfo && preLinkInfo.userName) {
                this.setData({
                    show: false
                })
                wx.showModal({
                    content: `${preLinkInfo.userName}老师邀请您通话`,
                    cancelText: '拒绝',
                    confirmText: '接受',
                    success: (res) => {

                        const nowTime = new Date().getTime()
                        if ((nowTime - preLinkInfo.time) > 25 * 1000) {
                            //  接听超时
                            wx.showModal({
                                content: '已经超过接听时间',
                                showCancel: false
                            })
                        } else {
                            if (res.confirm) {
                                //  接受
                                const strCustomMsg = JSON.stringify(customMsg);
                                webimhandler.sendCustomMsg({data: strCustomMsg, text: "notify"}, null)
                                this.onCancelLink()
                            } else {
                                //  拒绝
                                customMsg.data.link = false
                                const strCustomMsg = JSON.stringify(customMsg);
                                webimhandler.sendCustomMsg({data: strCustomMsg, text: "notify"}, null)
                                this.onCancelLink()
                            }
                        }
                    }
                })
            }
        },

        "enterRoomList": function (enterRoomList) {
            if (enterRoomList && enterRoomList.length) {
                this.setData({
                    showOnceTag: true,
                    onceTagList: enterRoomList
                })
            }
        },

        "requestLinkOk": function (requestLinkOk) {
            if (requestLinkOk) {
                if (!timeHandler) {
                    this.loopTime()
                }
            } else {
                if (timeHandler) {
                    clearTimeout(timeHandler)
                    timeHandler = null
                    time = 0
                }
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        value: '',
        toIndex: '',
        keyBoardHeight: 0,
        focusInput: false,
        userImgList: [],
        show: false,
        bgColor: 'rgba(0,0,0,0.75)',
        inCallLink: false,
        callTime: 0,
        linkWiteList: [],
        inWite: false,
        index: 0,
        needSelectTag: false,
        selectTagList: [],
        selectedIds: [],
        showPop: false,
        showOnceTag: false,
        selectOnceTagIds: [],
        onceTagList: [],
        toUsers: [],
        timeDes: '',
        prePayShow: false
    },

    lifetimes: {
        attached() {
            this.updateLinkWiteList()
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        loopTime() {
            timeHandler = setTimeout(() => {
                time++
                let timeDes = ''
                timeDes = time / 60
                timeDes = parseInt(timeDes.toString()) + ' 分 '
                const secend = time % 60
                timeDes = timeDes + secend + ' 秒 '
                this.setData({
                    timeDes: timeDes
                })
                this.loopTime()
            } ,1000)
        },
        onConfirm(event) {
            const text = event.detail
            if (!text) {
                return
            }
            this.setData({
                value: ''
            })
            const params = {
                text: text
            }
            if (this.data.toUsers && this.data.toUsers.length) {
                const toUsersTemp = this.data.toUsers.filter(item => item.selected)
                const toName = toUsersTemp[0].nickname ? toUsersTemp[0].nickname : '连麦者'
                if (toName && toName !== '老师') {
                    params.toName = toName
                }
            }
            this.triggerEvent('sendTextMsgEvent', params)
        },
        onFocus(event) {
            const keyBoardHeight = event.detail.height
            this.setData({
                keyBoardHeight: keyBoardHeight
            })
        },
        onClickInput() {
            const toUsersTemp = roomInfoData.getRoomInfo().toUsers
            if (this.data.toUsers && this.data.toUsers.length) {
                if (this.data.toUsers[0].nickname === toUsersTemp[0]) {
                    this.setData({
                        focusInput: true
                    })
                } else {
                    this.refreshToName(toUsersTemp)
                }
            } else {
                this.refreshToName(toUsersTemp)
            }
        },
        refreshToName(toUsersTemp) {
            const toUsers = []
            toUsersTemp.forEach((item, index) => {
                const toUsersItem = {
                    id: index,
                    nickname: item,
                    selected: false
                }
                toUsers.push(toUsersItem)
            })
            if (toUsers.length) {
                toUsers[0].selected = true
            }
            this.setData({
                focusInput: true,
                toUsers: toUsers
            })
        },
        onBlur() {
            this.setData({
                focusInput: false
            })
        },
        onSendRose() {
            this.realSendRose()
        },
        realSendRose() {
            if (roseTimeHandle) {
                clearTimeout(roseTimeHandle)
            }
            roseNumber++
            roseTimeHandle = setTimeout(() => {
                this.readyRose(roseNumber)
            }, 5000)
        },
        readyRose(number = 0) {
            if (!number) {
                return
            }
            const userInfo = liveroom.getAccountInfo()
            const customMsg = {
                cmd: "AudienceCallLike",
                data: {
                    userID: userInfo.userID,
                    userName: userInfo.userName,
                    userAvatar: userInfo.userAvatar,
                    number: number
                }
            }
            const strCustomMsg = JSON.stringify(customMsg);
            webimhandler.sendCustomMsg({data: strCustomMsg, text: "notify"}, null)
            roseNumber = 0
        },

        onLinkTeacher() {
            if (!this.data.canLink) {
                wx.showModal({
                    content: '老师尚未开启连麦，开启后可申请和老师视频连麦哦',
                    showCancel: false
                })
                return
            }

            const tagList = roomInfoData.getRoomInfo().tagList

            let needSelectTag = false

            if (isShowTag && tagList && tagList.length) {
                needSelectTag = true
            }

            this.setData({
                needSelectTag: needSelectTag,
                selectTagList: tagList
            })

            Promise.all([getSetting('scope.record'), getSetting('scope.camera')]).then(res => {
                if (res && res[0] && res[1]) {
                    this.updateLinkWiteList()
                    this.setData({show: true});
                } else {
                    wx.showModal({
                        content: '请打开小程序设置中的摄像头、麦克风权限才能连麦成功',
                        showCancel: false
                    })
                }
            }).catch(() => {
                wx.showModal({
                    content: '请打开小程序设置中的摄像头、麦克风权限才能连麦成功',
                    showCancel: false
                })
            })
        },
        updateLinkWiteList(setInWiteFalse = false) {
            roomService.linkmicList(userBase.getGlobalData().sessionId, userBase.getGlobalData().roomId).then(linkWiteList => {
                if (linkWiteList) {
                    linkWiteList.forEach((item, index) => {
                        if (item.userId === userBase.getGlobalData().userId) {
                            item.order = '我'
                            this.setData({
                                inWite: true,
                                index: index
                            })
                        }
                    })
                }
                this.setData({
                    linkWiteList: linkWiteList ? linkWiteList : []
                })
                if (setInWiteFalse) {
                    this.setData({
                        inWite: false
                    })
                }
            })
        },

        onClickQuestion() {
            if (this.data.selectedIds && this.data.selectedIds.length) {
                roomService.savetags(userBase.getGlobalData().sessionId, roomInfoData.getRoomInfo().groupId, this.data.selectedIds).then(() => {
                    isShowTag = false
                    this.onClickLink()
                    this.setData({
                        needSelectTag: false,
                        selectTagList: []
                    })
                }).catch(() => {
                    wx.showModal({
                        content: '提问失败，请重试',
                        showCancel: false
                    })
                })
            }
        },

        onClickLink() {
            roomService.linkmicPush(userBase.getGlobalData().sessionId, userBase.getGlobalData().roomId).then(() => {
                this.triggerEvent('lintTeacher')
                this.setData({
                    inWite: true
                })
                this.updateLinkWiteList()
            }).catch(() => {
                wx.showModal({
                    content: '当前连线人数较多，请稍候',
                    showCancel: false
                })
            })
        },
        onCancelLink() {
            roomService.linkmicPop(userBase.getGlobalData().sessionId, userBase.getGlobalData().roomId).then(() => {
                isShowTag = true
                this.updateLinkWiteList(true)
            }).catch(() => {
            })
        },

        onCloseSheet() {
            this.setData({
                show: false,
                focusInput: false
            });
        },

        onCallDown() {
            this.triggerEvent('onCallDown')
        },

        onSelectTag(event) {
            const itemInfo = event.currentTarget.dataset.value

            let selectedIds = this.data.selectedIds
            const selectTagList = this.data.selectTagList
            selectTagList.forEach(item => {
                if (item.id === itemInfo.id) {
                    item.selected = true
                    selectedIds = [item.id]
                } else {
                    item.selected = false
                }
            })
            this.setData({
                selectTagList: selectTagList,
                selectedIds: selectedIds
            })
        },

        onClosePop() {
            this.setData({
                showPop: false
            })
        },

        onCloseOnceTag() {
            this.setData({
                showOnceTag: false
            })
        },

        onNoHelp() {
            const csiData = {
                roomId: userBase.getGlobalData().roomId,
                value: 0
            }
            this.submitSavecsi(csiData)
        },

        onCanHelp() {
            const csiData = {
                roomId: userBase.getGlobalData().roomId,
                value: 1
            }
            this.submitSavecsi(csiData)
        },

        submitSavecsi(csiData) {
            roomService.savecsi(userBase.getGlobalData().sessionId, csiData).then(() => {
                this.onClosePop()
            }).catch(() => {
                wx.showModal({
                    content: '提交失败，请重试',
                    showCancel: false
                })
            })
        },

        onSelectOnceTag(event) {
            const itemInfo = event.currentTarget.dataset.value
            const onceTagList = this.data.onceTagList
            let selectOnceTagIds = []
            onceTagList.forEach(item => {
                if (item.id === itemInfo.id) {
                    if (item.selected) {
                        item.selected = false
                    } else {
                        item.selected = true
                        selectOnceTagIds = [itemInfo.id]
                    }
                } else {
                    item.selected = false
                }
            })
            this.setData({
                onceTagList: onceTagList,
                selectOnceTagIds: selectOnceTagIds
            })
        },

        onConmitOnceTag() {
            if (this.data.selectOnceTagIds && this.data.selectOnceTagIds.length) {
                this.setData({
                    showOnceTag: false
                })
                roomService.savetags(userBase.getGlobalData().sessionId, roomInfoData.getRoomInfo().groupId, this.data.selectOnceTagIds).then(() => {}).catch(() => {
                    setTimeout(() => {
                        this.retryCommitTag()
                    }, 1000)
                })
            } else {
                wx.showModal({
                    content: '请选一个颜色来代表您今天的心情哦',
                    showCancel: false
                })
            }
        },

        retryCommitTag() {
            roomService.savetags(userBase.getGlobalData().sessionId, roomInfoData.getRoomInfo().groupId, this.data.selectOnceTagIds).then(() => {}).catch(() => {})
        },

        onSelectToUser(event) {
            const itemInfo = event.currentTarget.dataset.value
            const toUsers = this.data.toUsers
            toUsers.forEach(item => {
                if (item.id === itemInfo.id) {
                    item.selected = true
                } else {
                    item.selected = false
                }
            })
            this.setData({
                toUsers: toUsers
            })
        },

        none() {

        },

        onClosePrePayShow() {
            this.setData({
                prePayShow: false
            })
            payInfo = null
        },

        onToPay() {
            if (debounceForFunction(15000)) {
                return
            }
            if (payInfo) {
                requestPayment(payInfo).then(() => {
                    this.payOk()
                }).catch(() => {})
            } else {
                this.newPayStep()
            }
        },

        newPayStep() {
            wxLogin().then(codeRes => {
                const code = codeRes.code
                const sessionId = userBase.getGlobalData().sessionId
                const pid = this.data.linkMicPrice.pid
                const extData = {
                    roomId: userBase.getGlobalData().roomId
                }
                return roomService.getRoomPayInfo(sessionId, code, pid, JSON.stringify(extData))
            }).then(res => {
                payInfo = res
                requestPayment(res).then(() => {
                    this.payOk()
                }).catch(() => {})
            })
        },

        payOk() {
          // 支付成功
            this.onClosePrePayShow()
            const linkMicPrice = this.data.linkMicPrice
            linkMicPrice.tips = 0
            this.setData({
                linkMicPrice: linkMicPrice
            })

            if(!this.data.canLink) {
                wx.showModal({
                    title: '支付成功',
                    content: '老师还未开启连麦权限，老师开启后就能申请连麦啦，老师会按顺序选取接听，请耐心等候！若没有被接听或中途中断，可以联系小江班主任退款哦！',
                    showCancel: false
                })
            } else {
                wx.showModal({
                    title: '支付成功',
                    content: '现在可以申请连麦啦，老师会按顺序选取接听，请耐心等候！若没有被接听或中途中断，可以联系小江班主任退款哦！',
                    showCancel: false,
                    success: () => {
                        this.onLinkTeacher()
                    }
                })
            }
        },

        onPrePay() {
            this.setData({
                prePayShow: true
            })

            wxLogin().then(codeRes => {
                const code = codeRes.code
                const sessionId = userBase.getGlobalData().sessionId
                const pid = this.data.linkMicPrice.pid
                const extData = {
                    roomId: userBase.getGlobalData().roomId
                }
                return roomService.getRoomPayInfo(sessionId, code, pid, JSON.stringify(extData))
            }).then(res => {
                payInfo = res
            })
        }
    }
})
