import {RoomService} from "../../service/roomService";
import {UserBase} from "../../utils/user-utils/user-base";
import {getSetting} from "../../utils/wx-utils/wx-base-utils";
import {RoomInfoData} from "../../data/room-info-data";

const webimhandler = require('../../pages/components/mlvb-live-room/webim_handler');
const liveroom = require('../../pages/components/mlvb-live-room/mlvbliveroomcore.js');

const roomService = new RoomService()
const userBase = new UserBase()
const roomInfoData = new RoomInfoData()

let roseNumber = 0
let roseTimeHandle = null
let isShowTag = true

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
        roomData: {type: Object, value: {}}
    },

    observers: {
        "roomTextList": function(roomTextList) {
            if(roomTextList && roomTextList.length) {
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
                this.setData({
                    showPop: true
                })
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
                    content: '老师拒绝了您的连麦',
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
        showPop: false
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
        onConfirm(event) {
            const text = event.detail
            if (!text) {
                return
            }
            this.setData({
                value: ''
            })
            this.triggerEvent('sendTextMsgEvent', {text: text})
        },
        onFocus(event) {
            const keyBoardHeight = event.detail.height
            this.setData({
                keyBoardHeight: keyBoardHeight
            })
        },
        onClickInput() {
            this.setData({
                focusInput: true
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
                    content: '老师尚未开启连麦，开启后可免费申请和老师视频连麦哦',
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
                    this.setData({ show: true });
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
                if(setInWiteFalse) {
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
            }).catch(() => {})
        },
        onCloseSheet() {
            this.setData({ show: false });
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
                    item.selected = !item.selected
                    if (item.selected) {
                        if (selectedIds.length < 2) {
                            selectedIds.push(item.id)
                        } else {
                            item.selected = !item.selected
                            wx.showModal({
                                content: '最多选 2 个症状',
                                showCancel: false
                            })
                        }
                    } else {
                        selectedIds = selectedIds.filter(id => id !== item.id)
                    }
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
        }
    }
})
