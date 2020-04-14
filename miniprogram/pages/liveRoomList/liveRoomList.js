import {LiveRoomListService} from "./service/liveRoomListService";
import {formatTime} from "../../utils/time-utils/time-utils";
import {pageJump} from "../../utils/wx-utils/wx-base-utils";
import {RoomService} from "../../service/roomService";
import Toast from '@vant/weapp/toast/toast';
import {RoomInfoData} from "../../data/room-info-data";
import {UserBase} from "../../utils/user-utils/user-base";

const liveRoomListService = new LiveRoomListService()
const roomService = new RoomService()
const roomInfo = new RoomInfoData()
const userBase = new UserBase()

Page({
    sessionId: '',

    /**
     * 页面的初始数据
     */
    data: {
        roomList: [],
        inReviewData: {
            roomCoverImg: 'cloud://live-house-nodecloud-1.6c69-live-house-nodecloud-1-1301787655/define.png',
            roomName: '红松看看吧',
            openRoomTime: ''
        }
    },

    refresh() {
        if (this.sessionId) {
            liveRoomListService.queryRoomList(this.sessionId).then(roomList => {
                this.formatRoomList(roomList)
                this.setData({
                    roomList: roomList
                })
            }).catch(() => {
            })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const sessionId = options.sessionId
        this.sessionId = sessionId
        this.refresh()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        Toast.clear()
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

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

    },

    /**
     * 去直播
     */
    jumpToLive(event) {
        Toast.loading({
            mask: true,
            message: '进入房间...'
        })

        const index = event.currentTarget.dataset.value
        const liveRoomInfo = this.data.roomList[index]
        roomInfo.setRoomInfo(liveRoomInfo)
        const roomName = liveRoomInfo.roomName
        const roomId = liveRoomInfo.roomId
        const userName = liveRoomInfo.anchorName
        const userSig = liveRoomInfo.userSig
        const roomAppId = liveRoomInfo.roomAppId

        userBase.setGlobalData({
            roomId: roomId,
            userName: userName
        })

        roomService.loginRoom(roomId, userName, userSig, roomAppId).then(() => {
            const url = `../mlvb-live-room-demo/live-room-page/room?type=create&roomName=${roomName}&userName=${userName}&pureAudio=false`
            pageJump(url).then(() => {
            }).catch(() => {
            })
        }).catch(() => {
            wx.showModal({
                content: '进房间失败',
                showCancel: false
            })
        })
    },

    /**
     * 格式化房间信息
     */
    formatRoomList(roomList) {
        roomList.forEach(item => {
            const startTime = item.startTime
            item.roomCoverImg = 'cloud://live-house-nodecloud-1.6c69-live-house-nodecloud-1-1301787655/define.png'
            item.roomName = '红松看看吧'
            item.openRoomTime = ''
            item.openRoomTime = formatTime(startTime)
        })
    }
})