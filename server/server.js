const express = require('express')
      bodyParser = require('body-parser')
      questions = require('./questions')
      config = require('./config.js')
      app = module.exports = express()
      port = 3000

let helpQ = []
    totalQ = []
    waitQ = []
    date = new Date().toISOString().substring(0, 10)

//checks every 8 hours if it's a new day; does some daily tasks if true
setTimeout(function dailyTasks() {
      let currentDate = new Date().toISOString().substring(0, 10)
      if (date != currentDate) {
            date = currentDate
            helpQ = []
            totalQ = []
            waitQ = []
      }
      else console.log('Same day')
      setTimeout(dailyTasks, 28800000)
}, 28800000)

//checks for new q data every 5 minutes
function updateQ() {
      questions.getCurrentQ()
      setTimeout(updateQ, 300000)
}

updateQ()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.getHelpQ = () => {return helpQ}
app.setHelpQ = (newQ) => {helpQ = newQ; console.log(helpQ)}
app.getTotalQ = () => {return totalQ}
app.setTotalQ = (newQ) => {totalQ = newQ; console.log(totalQ)}
app.getWaitQ = () => {return waitQ}
app.setWaitQ = (newQ) => {waitQ = newQ; console.log(waitQ)}

app.listen(port, () => console.log(`Today is ${date}. Listening on port ${port} . . .`))