angular.module('app').service('qService', function($http, config) {
    this.getQ = (beginDate, endDate, cohortId) => {
        console.log('Begin API call', new Date())
        let url = `${config.dev_mtn_api}historical/questions/?admin_token=${config.admin_token}&after=${beginDate}&before=${endDate}`
        if (cohortId) url += `&cohortId=${cohortId}`
        return $http.get(
            url,
            {headers: { 'Access-Control-Allow-Origin': '*' }}
        )
    }

    this.divideQDays = (qbody, beginDate, endDate) => {
        console.log('Begin divideQDays', new Date())        
        let beginFD = this.dateFormatter(beginDate)
        let endFD = this.dateFormatter(endDate)
        let qArr = []
        for (let d = beginFD; d < endFD; d.setDate(d.getDate() + 1)) {
            if (d.getDay() != 0 && d.getDay() != 6) qArr.push([new Date(d).toISOString().substring(0, 10)])
        }
        console.log(qbody.length)
        for (let q of qbody) {
            for (let i = 0; i < qArr.length; i++) {
                let day = qArr[i][0]
                let qTWE = new Date(q.timeWhenEntered).getTime()
                if (q.timeWhenEntered.substring(0, 10) == day
                    && qTWE < new Date(`${day}T23:10:00.000Z`).getTime()
                    && qTWE >= new Date(`${day}T14:50:00.000Z`).getTime()) {
                    qArr[i].push(q)
                    break
                }
            }
        }
        this.setQs(qArr)
    }

    this.dateFormatter = (date) => {
        //console.log(date)
        let dateArr = date.split('-')
        let fDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
        //console.log(fDate)
        return fDate
    }

    this.setQs = (qArr) => {
        console.log('Begin setQs', new Date())        
        let helpQ = []
            totalQ = []
            waitQ = []
            beginTime = new Date(`2000-01-01T14:50:00.000Z`).getTime()
            endTime = new Date(`2000-01-01T23:10:00.000Z`).getTime()
        for (let i = 0; i < 100; i++) {
            if (i % 25 == 0) console.log(new Date(), i + '% done')
            let min = beginTime + (i * 300000)
            max = beginTime + ((i + 1) * 300000)
            helpQ.push(this.pushSingleQ(min, max, qArr, 'timeMentorBegins', 'timeQuestionAnswered'))
            totalQ.push(this.pushSingleQ(min, max, qArr, 'timeWhenEntered', 'timeQuestionAnswered'))        
            waitQ.push(this.pushSingleQ(min, max, qArr, 'timeWhenEntered', 'timeMentorBegins', 'timeQuestionAnswered'))
        }
        console.log('Done!', new Date())        
        console.log('Help: ', helpQ)
        console.log('Total: ', totalQ)
        console.log('Wait: ', waitQ)
    }

    this.pushSingleQ = (min, max, qArr, q1, q2, q3) => {
        let count = 0
            sum = 0
        for (let dayQs of qArr) {
            for (let i = 1; i < dayQs.length; i++) {
                let q = dayQs[i]
                if (q[q1]) {
                    let qMin = new Date(`2000-01-01T${new Date(q[q1]).toISOString().substring(11, 24)}`).getTime()
                    if (qMin < max) {
                        let qMax = max
                        if (q[q2]) qMax = new Date(`2000-01-01T${new Date(q[q2]).toISOString().substring(11, 24)}`).getTime()
                        else if (q[q3]) qMax = new Date(`2000-01-01T${new Date(q[q3]).toISOString().substring(11, 24)}`).getTime()
                        if (qMax >= min) {
                            if (qMax >= max) qMax = max
                            sum += qMax - qMin
                            count++
                        }
                    }
                }
            }
        }
        if (count > 0) {
            return (sum/(count * 60000)).toFixed(2)
        }
        else return '0'
    }
})