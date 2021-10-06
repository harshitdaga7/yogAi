const express = require('express')
const app = express()
const port = 3000
const path = require('path')
app.use('/', express.static('dist'))
app.get('/', (req, res) => {

    res.sendFile('./dist/index.html',{ root: '' })
})
app.get('/index.html', (req, res) => {

  res.sendFile('./dist/index.html',{ root: '' })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})