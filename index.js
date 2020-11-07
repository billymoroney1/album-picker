const express = require('express')
const app = express()
const ejsLayouts = require('express-ejs-layouts')
const session = require('express-session')

app.set('view engine', 'ejs')
app.use(ejsLayouts)

//session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,

}))


//body parse
app.use(express.urlencoded({extended: false}))

// use controllers 
app.use('/auth', require('./controllers/auth.js'))

app.get('/', (req, res) =>{
    if(req.user) {
        res.send(`current user: ${req.user.name}`)
    } else {
        res.send('No user currently logged in')
    }
})

app.listen(8000, ()=>{
    console.log('you\'re listening to the sweet sounds of port 8000')
})