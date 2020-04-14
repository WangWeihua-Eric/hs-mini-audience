import {backJump, getSetting, jumpNewMini, pageJump} from "../../../utils/wx-utils/wx-base-utils";
import {formatTime, formatTimeHM} from "../../../utils/time-utils/time-utils";
import {UserBase} from "../../../utils/user-utils/user-base";
import {getWithWhere} from "../../../utils/wx-utils/wx-db-utils";
import {RoomService} from "../../../service/roomService";

const liveroom = require('../../components/mlvb-live-room/mlvbliveroomcore.js')

const app = getApp()
const roomService = new RoomService()
const userBase = new UserBase()

let loadOptions = {}

Page({
    component: null,
    data: {
        userName: '',
        roomID: '',
        roomName: '',
        pureAudio: false,
        role: 'audience',
        showLiveRoom: false,
        rooms: [],
        comment: [],
        linked: false,
        debug: false,
        frontCamera: true,
        inputMsg: [],
        muted: false,
        toview: '',
        beauty: 5,
        shouldExit: false,
        phoneNum: '',
        headerHeight: app.globalData.headerHeight,
        statusBarHeight: app.globalData.statusBarHeight,
        inputFocus: false,
        scopeUserInfo: true,
        noLogin: false,
        roomInfo: {},
        canLink: false
    },

    refresh(options) {
        wx.showLoading({
            title: '登录房间中',
        })

        const userId = options.userId
        const userName = options.userName
        const userAvatar = options.userAvatar

        const loginInfo = {
            sdkAppID: userBase.getGlobalData().roomAppId,
            userID: userId,
            userSig: userBase.getGlobalData().userSig,
            userName: userName,
            userAvatar: userAvatar
        }

        //MLVB 登录
        liveroom.login({
            data: loginInfo,
            success: (res) => {
                //登录成功
                wx.hideLoading()
                this.setData({
                    roomID: options.roomID,
                    roomName: options.roomName,
                    userName: userName,
                    role: 'audience',
                    showLiveRoom: true
                }, function () {
                    this.start();
                })
            },
            fail: (ret) => {
                //登录失败
                wx.hideLoading()
                wx.showModal({
                    title: '登录失败',
                    content: ret.errMsg,
                    showCancel: false,
                    complete: () => {}
                })
            }
        })
    },

    onLoad: function (options) {
        loadOptions = options
        const userId = options.userId
        const userName = options.userName
        const userAvatar = options.userAvatar
        const roomID = options.roomID
        const roomName = options.roomName
        const sessionId = options.sessionId
        const role = options.type === 'create' ? 'anchor' : 'audience'
        if (role !== 'audience') {
            this.setData({
                roomID: roomID,
                roomName: roomName,
                userName: userName,
                role: role,
                showLiveRoom: true
            }, function () {
                this.start();
            })
        } else {
            if (!userId || !userName || !userAvatar || !roomID || !roomName || !sessionId) {
                getWithWhere('inreview', {position: 'inreview'}).then(inReviewRes => {
                    if (inReviewRes.length) {
                        const inReviewInfo = inReviewRes[0]
                        if (inReviewInfo.inreview) {
                            //  审核中
                            this.setData({
                                noLogin: true
                            })
                        } else {
                            //  未审核
                            this.toLogin()
                        }
                    } else {
                        //  未审核
                        this.toLogin()
                    }
                }).catch(() => {
                    //  未审核
                    this.toLogin()
                })
            } else {
                const userInfo = {
                    userId: userId,
                    userName: userName,
                    userAvatar: userAvatar,
                    roomID: roomID,
                    roomName: roomName,
                    sessionId: sessionId
                }

                userBase.setGlobalData(userInfo)

                roomService.queryRoomInfo(sessionId, roomID).then(roomInfo => {
                    this.formatRoomInfo(roomInfo)
                    userBase.setGlobalData(roomInfo)
                    const roomStatus = roomInfo.roomStatus
                    this.setData({
                        roomInfo: roomInfo
                    })

                    if (roomStatus === 0) {
                        // 未开播
                        this.setData({
                            noLogin: true
                        })

                        // this.setData({
                        //     noLogin: false
                        // })
                        // this.refresh(options)
                    } else if (roomStatus === 1 || roomStatus === 2) {
                        //  直播中
                        this.setData({
                            noLogin: false
                        })
                        this.refresh(options)
                        roomService.queryLinkmicState(sessionId, roomID).then(res => {
                            if (res === 'on') {
                                this.setData({
                                    canLink: true
                                })
                            }
                        })
                    } else {
                        //  直播结束
                        this.setData({
                            noLogin: true
                        })
                    }
                })
            }
        }
    },

    toLogin() {
        this.setData({
            noLogin: true,
            roomInfo: {
                roomStatus: 0,
                anchorAvatar: 'cloud://live-house-nodecloud-1.6c69-live-house-nodecloud-1-1301787655/define.png'
            }
        })
    },

    formatRoomInfo(data) {
        const start = data.startTime
        const end = data.finishTime
        if (data.roomStatus === 0) {
            data.desc = `${formatTime(start)} - ${formatTimeHM(end)}`
        } else if (data.roomStatus === 3) {
            data.desc = '我们将在6小时内提供回看视频，敬请期待'
        }
    },

    onReady: function () {
        var self = this;
        wx.setNavigationBarTitle({
            title: self.data.roomName
        })
    },

    onRoomEvent: function (e) {
        var self = this;
        var args = e.detail;
        switch (args.tag) {
            case 'roomClosed': {
                const roomInfo = this.data.roomInfo
                roomInfo.roomStatus = 3
                roomInfo.desc = '我们将在6小时内提供回看视频，敬请期待'
                self.setData({
                    noLogin: true,
                    roomInfo: roomInfo
                })
                break;
            }
            case 'error': {
                // wx.showToast({
                //     title: `${args.detail}[${args.code}]`,
                //     icon: 'none',
                //     duration: 1500
                // })
                if (args.code == 5000) {
                    this.data.shouldExit = true;
                } else {
                    if (args.code === -9003) {
                        self.setData({
                            noLogin: true
                        })
                        console.log(this.data.noLogin)
                    }
                    if (args.code != -9004) {
                        // setTimeout(() => {
                        //     wx.navigateBack({delta: 1})
                        // }, 1500)
                    } else {
                        self.setData({
                            linked: false,
                            phoneNum: ''
                        })
                    }
                }
                break;
            }
            case 'linkOn': { // 连麦连上
                self.setData({
                    linked: true,
                    phoneNum: ''
                })
                break;
            }
            case 'linkOut': { //连麦断开
                self.setData({
                    linked: false,
                    phoneNum: ''
                })
                break;
            }
            case 'recvTextMsg': {
                console.log('收到消息:', e.detail.detail);
                var msg = e.detail.detail;
                self.data.comment.push({
                    content: msg.message,
                    name: msg.userName,
                    time: msg.time
                });
                self.setData({
                    comment: self.data.comment,
                    toview: ''
                });
                // 滚动条置底
                self.setData({
                    toview: 'scroll-bottom'
                });
                break;
            }
            case 'requestJoinAnchor': { //收到连麦请求
                var jioner = args.detail;
                var showBeginTime = Math.round(Date.now());
                wx.showModal({
                    content: `${jioner.userName} 请求连麦`,
                    cancelText: '拒绝',
                    confirmText: '接受',
                    success: function (sm) {
                        var timeLapse = Math.round(Date.now()) - showBeginTime;
                        if (timeLapse < 25000) {
                            if (sm.confirm) {
                                console.log('用户点击同意')
                                self.component && self.component.respondJoinAnchor(true, jioner);
                            } else if (sm.cancel) {
                                console.log('用户点击取消')
                                self.component && self.component.respondJoinAnchor(false, jioner);
                            }
                        } else {
                            wx.showToast({
                                title: '连麦超时',
                            })
                        }
                    }
                })
                break;
            }
            default: {
                console.log('onRoomEvent default: ', e)
                break;
            }
        }
    },

    start: function () {
        var self = this;
        self.component = self.selectComponent("#id_liveroom")
        console.log('self.component: ', self.component)
        console.log('self:', self);
        self.component.start();
    },
    onLinkClick: function () {
        var self = this;
        self.component && self.component.requestJoinAnchor();
        self.setData({
            phoneNum: 'phone-1'
        })
        self.setInternal();
    },
    setInternal: function () {
        var self = this;
        setTimeout(() => {
            if (!self.data.phoneNum) {
                return;
            }

            var curPhoneNum = '';
            switch (self.data.phoneNum) {
                case 'phone-1':
                    curPhoneNum = 'phone-2';
                    break;
                case 'phone-2':
                    curPhoneNum = 'phone-3';
                    break;
                case 'phone-3':
                    curPhoneNum = 'phone-1';
                    break;
                default:
                    break;
            }
            self.setData({
                phoneNum: curPhoneNum
            })
            self.setInternal();
        }, 500);
    },
    goRoom: function (e) {
        var self = this;
        var index = parseInt(e.currentTarget.dataset.index);
        var roomID = self.data.rooms[index].roomID;
        self.setData({
            roomID: roomID
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (this.data.shouldExit) {
            wx.showModal({
                title: '提示',
                content: "收到退房通知",
                showCancel: false,
                complete: function () {
                    wx.navigateBack({delta: 1});
                }
            });
        }
        var self = this;
        self.component && self.component.resume();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        var self = this;
        self.component && self.component.pause();
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        var self = this;
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '红松看看吧',
            path: 'pages/mlvb-live-room-demo/live-room-page/room',
            imageUrl: 'cloud://live-house-nodecloud-1.6c69-live-house-nodecloud-1-1301787655/define.png'
        }
    },

    showLog: function () {
        var self = this;
        self.setData({
            debug: !self.data.debug
        })
    },
    changeMute: function () {
        var self = this;
        self.setData({
            muted: !self.data.muted
        })
    },
    setBeauty: function () {
        var self = this;
        self.setData({
            beauty: self.data.beauty == 5 ? 0 : 5
        })
    },
    sendTextMsg() {
        this.setData({
            inputFocus: true
        })
        // this.component && this.component.sendTextMsg('老师你好啊')
    },
    changeCamera: function () {
        var self = this;
        self.component && self.component.switchCamera();
        self.setData({
            frontCamera: !self.data.frontCamera
        })
    },
    bindInputMsg: function (e) {
        this.data.inputMsg = e.detail.value;
    },
    onBack: function () {
        wx.navigateBack({
            delta: 1
        });
    },

    onClickGetUserInfo() {
        getSetting('scope.userInfo').then(scopeRes => {
            if (scopeRes) {
                //  已授权
                this.setData({
                    scopeUserInfo: true
                })
                this.refresh(loadOptions)
            } else {
                //  未授权
                this.setData({
                    scopeUserInfo: false
                })
            }
        }).catch(err => {
            //  接口出错当未授权处理
            this.setData({
                scopeUserInfo: false
            })
        })
    },

    onJumpServer() {
        const roomInfo = this.data.roomInfo
        if (roomInfo.anchorAvatar) {
            backJump().then(() => {}).catch(() => {
                jumpNewMini('wxa7740225caabc3ea').then(() => {}).catch(() => {})
            })
        } else {
            const url = '../../caster-login/caster-login'
            pageJump(url).then(() => {}).catch(() => {})
        }
    }
})
