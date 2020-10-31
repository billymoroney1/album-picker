const express = require('express')
const router = express.Router()

router.get('/login', (req, res) => {
    res.render('auth/login')
})

router.post('/signup', (req, res)=>{
    console.log('posting to /auth/signup')
    res.redirect('/auth/login')
})

router.post('/login', (req, res)=>{
    console.log('posting to /auth/login')
    res.redirect('/')
})

router.get('/signup', (req, res) => {
    res.render('auth/signup')
})


module.exports = router