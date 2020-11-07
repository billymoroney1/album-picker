const express = require('express')
const router = express.Router()
const db = require('../models')
const passport = require('../config/ppConfig.js')

router.get('/login', (req, res) => {
    res.render('auth/login')
})

router.post('/signup', (req, res)=>{
    console.log('signup form user input:', req.body)
    console.log(req.body.password)

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
            //log the new user in
            passport.authenticate('local', {
                successRedirect: '/',
                successFlash: 'Account created and logged in!'
            })(req, res) //IIFE
        } else {
            req.flash('error', 'email already exists, try logging in')
            res.redirect('/auth/login')
            // console.log('An account associated with that email address already exists! Try logging in.')

        }        
    })
    .catch(err=>{
        req.flash('error', err.message)
        res.redirect('/auth/signup') // redirect to signup page so they can try again
    })
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login',
    successRedirect: '/',
    failureFlash: 'Invalid email or password',
    successFlash: 'You are now logged in'
}))

router.get('/signup', (req, res) => {
    res.render('auth/signup')
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('Logged Out')
    res.redirect('/')
})

module.exports = router