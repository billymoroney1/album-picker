require('dotenv').config()
const express = require('express')
const app = express()
const ejsLayouts = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('./config/ppConfig.js')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn.js')

app.set('view engine', 'ejs')
app.use(ejsLayouts)

//session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,

}))


//passport middleware
app.use(passport.initialize())
app.use(passport.session())

//flash middleware
app.use(flash())

//CUSTOM middleware
app.use((req, res, next)=>{
    res.locals.alerts = req.flash()
    res.locals.currentUser = req.user
    next()
})


//body parse
app.use(express.urlencoded({extended: false}))

// use controllers 
app.use('/auth', require('./controllers/auth.js'))

app.get('/', (req, res) =>{
    res.render('home')
})

//GET search results
app.get('/search', (req, res) => {
    console.log(req.body)
    res.render('search')
}) 

app.get('/library', isLoggedIn, (req, res) => {
    res.render('library')
})



app.listen(8000, ()=>{
    console.log('you\'re listening to the sweet sounds of port 8000')
})