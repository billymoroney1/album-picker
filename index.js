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

//SPOTIFY WEB API IMPORT AND CREDENTIALS
const SpotifyWebApi = require('spotify-web-api-node')
const db = require('./models/index.js')

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
    spotifyApi.clientCredentialsGrant().then(
        function(data) {
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            localStorage.setItem('token', `${data.body['access_token']}`)
        },
        function(err) {
          console.log(
            'Something went wrong when retrieving an access token',
            err.message
          );
        }
      )
})

//GET search results
app.post('/search', (req, res) => {
        axios.get(`https://api.spotify.com/v1/search?q=album%3A${req.body.search}&type=album`, {
            headers: {
                'Accept': "application/x-www-form-urlencoded",
                'Content-Type': "application/x-www-form-urlencoded",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(results => {
            // res.send(results.data.albums.items)
            res.render('search', {results: results.data.albums.items})
        })
        .catch(err => {
            console.log(err)
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

app.post('/album', (req, res) => {
    db.album.findOrCreate({
        where: {
            name: `${req.body.name}`,
            artist: `${req.body.artist}`,
            releaseYear: `${req.body.releaseYear}`,
            pictureUrl: `${req.body.pictureUrl}`,
            spotify: `${req.body.spotify}`
        }
    }).then(([album, created]) => {
            db.user.findOne({
                where: {
                    id: `${res.locals.currentUser.dataValues.id}`
                }
            }).then(user => {
                user.addAlbum(album)
                res.redirect('/library')
            })
       })
    })

// Send album metadata and track list to /album
app.get('/album', (req, res) => {
    axios.get(`https://api.spotify.com/v1/albums/${req.query.id}`, {
            headers: {
                'Accept': "application/x-www-form-urlencoded",
                'Content-Type': "application/x-www-form-urlencoded",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).then(albumResults => {
                axios.get(`https://api.spotify.com/v1/albums/${req.query.id}/tracks`, {
                headers: {
                    'Accept': "application/x-www-form-urlencoded",
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }).then(trackList => {
                // res.send(trackList.data)
                // res.send(albumResults.data)
                res.render('album', {albumResults: albumResults.data, trackList: trackList.data})
            })
        })
        .catch(err => {
            console.log(err)
        })
})


app.get('/library', isLoggedIn, (req, res) => {
    db.album.findAll({
        where: {
            userId: `${res.locals.currentUser.dataValues.id}`
        }
    })
    .then(albums => {
        res.render('library', {albums: albums})
    })
})



app.listen(8000, ()=>{
    console.log('you\'re listening to the sweet sounds of port 8000')
})