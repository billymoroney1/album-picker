const express = require('express')
const router = express.Router()
const db = require('../models')

router.get('/login', (req, res) => {
    res.render('auth/login')
})

router.post('/signup', (req, res)=>{
    console.log('signup form user input:', req.body)
    res.redirect('/auth/login')

    //check if user already exists
    //if it does, throw an error message
    // otherwise create a new user and store them in the db
    db.user.findOrCreate({
        where: {email: req.body.email},
        defaults: {
            name: req.body.name,
            password: req.body.password
        }
    })
    .then(([createdUser, wasCreated])=>{
        if(wasCreated){
            console.log(`just created the following user:`, createdUser)
        } else {
            console.log('An account associated with that email address already exists! Try logging in.')
        }
        //redirect to login page
        res.redirect('/auth/login')
    })
})

router.post('/login', (req, res)=>{
    console.log('trying to log in with ', req.body)
    res.redirect('/')
})

router.get('/signup', (req, res) => {
    res.render('auth/signup')
})


module.exports = router