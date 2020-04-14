import {UserBase} from "../../user-utils/user-base";
import {RoomService} from "../../../service/roomService";

const webimhandler = require('../../../pages/components/mlvb-live-room/webim_handler');
const liveroom = require('../../../pages/components/mlvb-live-room/mlvbliveroomcore.js');

let singletonPattern = null;

export class CasterActiveService {
    userBase = new UserBase()
    roomService = new RoomService()

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }

    /**
     * 刷新等待列表
     */
    updateLinkList() {
        const sessionId = this.userBase.getGlobalData().sessionId
        const roomId = this.userBase.getGlobalData().roomId
        return this.roomService.linkmicList(sessionId, roomId)
    }

    /**
     * 接受连麦
     */
    resolveLink(userID, userName, userAvatar) {
        const preLinkUserInfo = {
            userID: userID,
            userName: userName,
            userAvatar: userAvatar
        }

        this.userBase.setGlobalData({
            preLinkUserInfo: preLinkUserInfo,
            linkOk: false
        })

        const customMsg = {
            cmd: "CasterPreLink",
            data: {
                userId: userID,
                time: new Date().getTime(),
                userName: this.userBase.getGlobalData().userName
            }
        }
        const strCustomMsg = JSON.stringify(customMsg);
        webimhandler.sendCustomMsg({data: strCustomMsg, text: "notify"}, null)

        wx.showModal({
            content: '需要 25s 等待用户接听',
            showCancel: false
        })

        setTimeout(() => {
            if (!this.userBase.getGlobalData().linkOk) {
                this.userBase.setGlobalData({
                    preLinkUserInfo: {}
                })
                const sessionId = this.userBase.getGlobalData().sessionId
                const roomId = this.userBase.getGlobalData().roomId
                this.roomService.teacherLinkmicPop(sessionId, roomId, userID).then(() => {})
                wx.showModal({
                    content: '用户超时未接听',
                    showCancel: false
                })
            }
        }, 25000)
    }

    /**
     * 拒绝连麦
     */
    rejectLink(userID, userName, userAvatar) {
        const preLinkUserInfo = {
            userID: userID,
            userName: userName,
            userAvatar: userAvatar
        }

        liveroom.rejectJoinAnchor({
            data: preLinkUserInfo
        });

        const sessionId = this.userBase.getGlobalData().sessionId
        const roomId = this.userBase.getGlobalData().roomId
        this.roomService.teacherLinkmicPop(sessionId, roomId, userID).then(() => {})
    }
}