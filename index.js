require('dotenv').config()
const express = require('express')
const app = express()
const ejsLayouts = require('express-ejs-layouts')
const session = require('express-session')
const passport = require('./config/ppConfig.js')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn.js')
const axios = require('axios')

// initialize node localStorage
const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')
localStorage.setItem('testKey', 'did this work')
console.log('did the local storage module work: ', localStorage.getItem('testKey'))



//SPOTIFY WEB API IMPORT AND CREDENTIALS
const SpotifyWebApi = require('spotify-web-api-node')

let spotifyApi = new SpotifyWebApi({
    clientId: '0a36f996eac1468cb98f0f1e9746dcbe',
    clientSecret: 'aa2291e2834447059749e58155c3242a',
    redirectUri: 'http://localhost:8888/callback'
})

// <---------------------------------------->

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
app.post('/search', (req, res) => {
    let token = ''
    spotifyApi.clientCredentialsGrant().then(
        function(data) {
          console.log('The access token expires in ' + data.body['expires_in']);
          console.log('The access token is ' + data.body['access_token']);
      
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);
          token = data.body['access_token']
        },
        function(err) {
          console.log(
            'Something went wrong when retrieving an access token',
            err.message
          );
        }
      ).then(data => {
        axios.get(`https://api.spotify.com/v1/search?q=album%3A${req.body.search}&type=album`, {
            headers: {
                'Accept': "application/x-www-form-urlencoded",
                'Content-Type': "application/x-www-form-urlencoded",
                'Authorization': `Bearer ${token}`
            }
        })
        .then(results => {
            console.log(results.data.albums.items)
            res.render('search', {results: results.data.albums.items})
        })
        .catch(err => {
            console.log(err)
        })
      })


      //PROMISES TO PUT AFTER THE ERROR MESSAGE ABOVE IF SEARCHING FOR TRACKS
    //   .then(data => {spotifyApi.searchTracks(req.body.search)
    //   .then(function(data) {
    //     console.log('Track search results', data.body);
    //     // res.send(data.body.tracks.items.name)
    //     res.render('search', {results: data.body.tracks.items})
    //   }, function(err) {
    //     console.error(err);
    //   })
    // })
    
}) 

app.get('/library', isLoggedIn, (req, res) => {
    res.render('library')
})



app.listen(8000, ()=>{
    console.log('you\'re listening to the sweet sounds of port 8000')
})