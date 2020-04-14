import {HttpUtil} from "../../../utils/http-utils/http-util";

let singletonPattern = null;

export class CasterLoginService {
    http = new HttpUtil()

    constructor() {
        if (singletonPattern) {
            return singletonPattern
        }
        singletonPattern = this
    }

    /**
     * 登录
     */
    casterToLogin(params) {
        const url = '/lecturer/api/login'

        return new Promise((resolve, reject) => {
            this.http.post(url, {...params, appSign: 'hongsongzhibozhushou'}).then(res => {
                if (res && res.state && res.state.code === '0') {
                    resolve(res.data)
                } else {
                    reject(res)
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }
}