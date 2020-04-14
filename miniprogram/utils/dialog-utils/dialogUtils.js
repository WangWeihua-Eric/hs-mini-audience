let singletonPattern = null;

export class DialogUtils {

    dialogP0 = []
    dialogP1 = []
    dialogP2 = []

    //  轮训检查状态 false：空闲中；true：检查中
    loopCheckStatus = false

    //  弹窗状态 false：空闲中；true：弹窗中
    dialogStatus = false

    //  当前选中 tab
    activeTab = 0

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }

    /**
     * 提交弹窗
     * @param dialogId  弹窗模版 id
     * @param dialogLevel   弹窗等级 (P0、P1、P2)
     * @param dialogPosition    弹窗 tab [0,2,3]
     */
    commitDialog(dialogId, dialogLevel, dialogPosition) {
        const dialogItem = {
            dialogId: dialogId,
            dialogLevel: dialogLevel,
            dialogPosition: dialogPosition
        }
        this.checkDialogLevel(dialogItem)
    }

    /**
     * 检查弹窗等级
     */
    checkDialogLevel(dialog) {
        const level = dialog.dialogLevel
        switch (level) {
            case 'P0': {
                this.addDialogQueueOfP0(dialog)
                break
            }
            case 'P1': {
                this.addDialogQueueOfP1(dialog)
                break
            }
            case 'P2': {
                this.addDialogQueueOfP2(dialog)
                break
            }
        }
    }

    /**
     * 添加 P0 队列
     */
    addDialogQueueOfP0(dialog) {
        this.dialogP0.push(dialog)
        this.checkDialogQueue()
    }

    /**
     * 添加 P1 队列
     */
    addDialogQueueOfP1(dialog) {
        this.dialogP1.push(dialog)
        this.checkDialogQueue()
    }

    /**
     * 添加 P2 队列
     */
    addDialogQueueOfP2(dialog) {
        this.dialogP2.push(dialog)
        this.checkDialogQueue()
    }

    /**
     * 检查弹窗队列
     */
    checkDialogQueue() {
        if (this.loopCheckStatus) {
            return
        }
        this.loopCheckStatus = true

        //  检查 P0 队列

        //  检查 P1 队列

        //  检查 P2 队列
    }
}