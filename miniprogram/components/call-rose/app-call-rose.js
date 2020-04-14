let roseNumber = 0
let timeHander = null

Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {
        callTip0: false,
        callTip1: false,
        callTip2: false,
        callTip3: false,
        callTip4: false,
        callTip5: false,
        callTip6: false,
        callTip7: false,
        callTip8: false,
        callTip9: false,
        callTip10: false,
        callTip11: false,
        callTip12: false,
        callTip13: false,
        callTip14: false,
        callTip15: false
    },

    lifetimes: {
        attached() {
            timeHander = setTimeout(() => {
                this.loopRose()
            }, 3000)
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        loopRose(time) {
            clearTimeout(timeHander)
            this.onSendRose()
            timeHander = setTimeout(() => {
                const nextTime = Math.round(Math.random() * 2000)
                this.loopRose(nextTime)
            }, time)
        },
        onSendRose() {
            switch (roseNumber) {
                case 0: {
                    this.setData({
                        callTip0: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip0: false
                        })
                    }, 1400)
                    break
                }
                case 1: {
                    this.setData({
                        callTip1: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip1: false
                        })
                    }, 1400)
                    break
                }
                case 2: {
                    this.setData({
                        callTip2: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip2: false
                        })
                    }, 1400)
                    break
                }
                case 3: {
                    this.setData({
                        callTip3: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip3: false
                        })
                    }, 1400)
                    break
                }
                case 4: {
                    this.setData({
                        callTip4: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip4: false
                        })
                    }, 1400)
                    break
                }
                case 5: {
                    this.setData({
                        callTip5: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip5: false
                        })
                    }, 1400)
                    break
                }
                case 6: {
                    this.setData({
                        callTip6: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip6: false
                        })
                    }, 1400)
                    break
                }
                case 7: {
                    this.setData({
                        callTip7: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip7: false
                        })
                    }, 1400)
                    break
                }
                case 8: {
                    this.setData({
                        callTip8: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip8: false
                        })
                    }, 1400)
                    break
                }
                case 9: {
                    this.setData({
                        callTip9: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip9: false
                        })
                    }, 1400)
                    break
                }
                case 10: {
                    this.setData({
                        callTip10: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip10: false
                        })
                    }, 1400)
                    break
                }
                case 11: {
                    this.setData({
                        callTip11: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip11: false
                        })
                    }, 1400)
                    break
                }
                case 12: {
                    this.setData({
                        callTip12: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip12: false
                        })
                    }, 1400)
                    break
                }
                case 13: {
                    this.setData({
                        callTip13: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip13: false
                        })
                    }, 1400)
                    break
                }
                case 14: {
                    this.setData({
                        callTip14: true
                    })
                    roseNumber++
                    setTimeout(() => {
                        this.setData({
                            callTip14: false
                        })
                    }, 1400)
                    break
                }
                case 15: {
                    this.setData({
                        callTip15: true
                    })
                    roseNumber = 0
                    setTimeout(() => {
                        this.setData({
                            callTip15: false
                        })
                    }, 1400)
                    break
                }
            }
        }
    }
})
