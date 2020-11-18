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
const methodOverride = require('method-override')

// initialize node localStorage
const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

//SPOTIFY WEB API IMPORT AND CREDENTIALS
const SpotifyWebApi = require('spotify-web-api-node')
const db = require('./models/index.js')

let spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:8888/callback'
})

// <---------------------------------------->

app.set('view engine', 'ejs')
app.use(ejsLayouts)
app.use(express.static('public'))

//method override
app.use(methodOverride('_method'))

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
            axios.get(`https://api.spotify.com/v1/search?q=album%3A${req.body.search}&type=album&limit=2`, {
                headers: {
                    'Accept': "application/x-www-form-urlencoded",
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(albumResults => {
                axios.get(`https://api.spotify.com/v1/search?q=artist%3A${req.body.search}&type=artist&limit=2`, {
                headers: {
                    'Accept': "application/x-www-form-urlencoded",
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(artistResults => {
                axios.get(`https://api.spotify.com/v1/search?q=track%3A${req.body.search}&type=track&limit=20`, {
                headers: {
                    'Accept': "application/x-www-form-urlencoded",
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(trackResults => {
                // res.send(trackResults.data.tracks.items)
                // res.send(artistResults.data.artists.items)
                // res.send(albumResults)
                res.render('search/index', {albumResults: albumResults.data.albums.items, artistResults: artistResults.data.artists.items, trackResults: trackResults.data.tracks.items})
            })
            })            
        })
        .catch(err => {
            console.log(err)
        })  
}) 

app.post('/search/artist', (req, res) => {
    axios.get(`https://api.spotify.com/v1/artists/${req.body.artistId}/albums`, {
                headers: {
                    'Accept': "application/x-www-form-urlencoded",
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }).then(albums => {
                // res.send(albums.data.items)
                res.render('search/artist', {albums: albums.data.items})
            })
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

// DELETE album
app.delete('/album/:id', (req, res) => {
    db.album.destroy({
        where: {
            name: req.params.id
        }
    }).then(destroyed => {
        console.log(destroyed)
        res.redirect('/library')
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

// GET read playlists page
app.get('/playlists/index', (req, res) => {
    const trackLists = []
    db.playlist.findAll({
        where: {
            userId: `${res.locals.currentUser.dataValues.id}`
        }
    })
    .then(playlists => {
        playlists.forEach(playlist => {
            playlist.getTracks().then(tracks => {
                console.log(tracks)
                trackLists.push(tracks)
            })
        })
        console.log(trackLists)
        res.render('playlists/index', {playlists: playlists, trackLists: trackLists})
    })
})

// GET info for specific playlist
app.get('/playlists/show/:name', (req, res) => {
    console.log(req.params.name)
    db.playlist.findOne({
        where: {
            name: req.params.name
        }
    }).then(playlist => {
        db.track.findAll({
            where: {
                playlistId: playlist.id
            }
        }).then(tracks => {
            res.render('playlists/show', {playlist: playlist, tracks: tracks})
        })
    })
})

// GET list of available playlists to add a track to
app.get('/playlists/add', (req, res) => {
    db.playlist.findAll({
        where: {
            userId: `${res.locals.currentUser.dataValues.id}`
        }
    })
    .then(playlists => {
        res.render('playlists/add', {playlists: playlists, trackName: req.query.name, trackPic: req.query.pictureUrl, trackLength: req.query.length})
    })
})

// GET read playlist edit form
app.get('/playlists/:id', (req, res) => {
    db.playlist.findOne({
        where: {
            name: req.params.id
        }
    }).then(playlist => {
        playlist.getTracks().then(tracks => {
            res.render('playlists/edit', {playlist: playlist, tracks: tracks})
        })
    })
})

// PUT update playlist
app.put('/playlists/:id', (req, res) => {
    db.playlist.findOne({
        where: {
            name: req.params.id
        }
    }).then(playlist => {
        playlist.name = `${req.body.name}`
        playlist.save()
        res.redirect(`/playlists/${playlist.name}`)
    })
})

// DELETE delete playlist
app.delete('/playlists/:id', (req, res) => {
    db.playlist.destroy({
        where: {
            name: req.params.id
        }
    }).then(destroyed => {
        console.log(destroyed)
        res.redirect('/playlists/index')
    })
})

// DELETE track from playlist
app.delete('/track/:name', (req, res) => {
    db.track.destroy({
        where: {
            name: req.params.name
        }
    }).then(destroyed => {
        console.log(destroyed)
        res.redirect(`/playlists/show/${req.body.name}`)
    })
})


// POST find or create new playlist 
app.post('/playlists', (req, res) => {
    db.playlist.findOrCreate({
        where: {
            name: req.body.name
        }
    }).then(([playlist, created]) => {
        db.user.findOne({
            where: {
                id: `${res.locals.currentUser.dataValues.id}`
            }
        }).then(user => {
            user.addPlaylist(playlist)
            res.redirect('/playlists/index')
        })
    })
})

// POST create new track, add to playlist
app.post('/track', (req, res) => {
    db.track.findOrCreate({
        where: {
            name: req.body.trackName
        }
    }).then(([track, created]) => {
        db.playlist.findOne({
            where: {
                name: req.body.playlist
            }
        }).then(playlist => {
            playlist.addTrack(track)
            res.redirect('/library')
        })
    })
})


app.listen(process.env.PORT || 8000, ()=>{
    console.log('you\'re listening to the sweet sounds of port 8000')
})