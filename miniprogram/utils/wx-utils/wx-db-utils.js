const db = wx.cloud.database({
    env: 'live-house-nodecloud-1'
});

export function getWithWhere(position, params) {
    return new Promise((resolve, reject) => {
        db.collection(position).where(params).get({
            success: (res) => {
                // res.data 是包含以上定义的两条记录的数组
                resolve(res.data)
            },
            fail: (error) => {
                reject(error)
            }
        })
    })
}

export function getWithWhereOrderByLimit(position, params, orderBy, sort, limit) {
    return new Promise((resolve, reject) => {
        db.collection(position).where(params).orderBy(orderBy, sort).limit(limit)
            .get({
                success: res => {
                    resolve(res.data)
                },
                fail: error => {
                    reject(error)
                }
            })
    })
}