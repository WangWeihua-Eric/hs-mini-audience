// 云函数入口文件
const cloud = require('wx-server-sdk')

//引入request-promise用于做网络请求
const rp = require('request-promise');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    const method = event.method
    const header = event.header
    const param = event.param

    const options = {
        uri: event.url,
        json: true // Automatically parses the JSON string in the response
    };

    switch (method) {
        case 'GET': {
            options.qs = param
            options.headers = {
                'User-Agent': 'Request-Promise'
            }

            break;
        }
        case 'POST': {
            options.method = method
            options.formData = param
            options.headers = header
            break;
        }
    }

    return await rp(options)
        .then((res) => {
            return res
        })
        .catch((err) => {
            return err
        });
}