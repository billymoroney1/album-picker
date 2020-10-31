const express = require('express')
const app = express()
const ejsLayouts = require('express-ejs-layouts')

app.set('view engine', 'ejs')
app.use(ejsLayouts)

// use controllers 
app.use('/auth', require('./controllers/auth.js'))

app.get('/', (req, res) =>{
    res.send('express auth home route')
})

app.listen(8000, ()=>{
    console.log('you\'re listening to the sweet sounds of port 8000')
})