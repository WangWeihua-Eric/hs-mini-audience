import {CasterLoginService} from "./service/casterLoginService";
import {pageJump} from "../../utils/wx-utils/wx-base-utils";
import Toast from '@vant/weapp/toast/toast';
import {UserBase} from "../../utils/user-utils/user-base";

const md5 = require('md5');
const casterLoginService = new CasterLoginService()
const userBase = new UserBase()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        phoneValue: '18610637369',
        pwValue: '123456',
        title: '红松看看吧讲师端',  //  红松直播讲师端
        subtitle: '学知识、交朋友'    //  学知识、交朋友
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {

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

    onPhChange(event) {
        // event.detail 为当前输入的值
        this.setData({
            phoneValue: event.detail
        })
    },

    onPwChange(event) {
        // event.detail 为当前输入的值
        this.setData({
            pwValue: event.detail
        })
    },

    toLoginBtn() {
        Toast.loading({
            mask: true,
            message: '登录中...'
        })

        const phone = this.data.phoneValue
        const pw = this.data.pwValue
        if (!phone || !pw) {
            this.loginError()
            return
        }
        const phoneMd5 = md5(phone)
        const pwMd5 = md5(phoneMd5 + pw)
        const params = {
            phone: phone,
            passwd: pwMd5
        }

        casterLoginService.casterToLogin(params).then(res => {
            const sessionId = res.sessionId
            userBase.setGlobalData({sessionId: sessionId})
            const url = `../liveRoomList/liveRoomList?sessionId=${sessionId}`
            pageJump(url).then(() => {
            }).catch(() => {
            })

        }).catch(() => {
            this.loginError()
        })
    },

    loginError() {
        wx.showModal({
            title: '登录失败',
            content: '请输入正确的手机号和密码',
            showCancel: false,
            success: () => {}
        })
    }
})