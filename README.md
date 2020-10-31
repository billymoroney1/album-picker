1. initialize npm, git
2. make gitignore with node_modules
3. make entry point file

4. set up express and home route to test

const express = require('express')
const app = express()

app.get('/', (req, res) =>{
    res.send('express auth home route')
})

app.listen(8000, ()=>{
    console.log('you\'re listening to the sweet sounds of port 8000')
})

5. create controllers and include this code in entry point:

app.use('/auth', require('./controllers/auth.js'))

6. in controller, require express, create a router

const router = express.Router()

and export that router

module.exports = router

7. make routes in controller

router.get('/login', (req, res) => {
    res.send('GET /login successfully hit')
})

8. Set up views

npm i ejs express-ejs-layouts

const ejsLayouts = require('express-ejs-layouts')
app.set('view engine', 'ejs')
app.use(ejsLayouts)

9. Make layout.ejs, boilerplate, <%- body %>, etc

10. change any 'res.send' to res.render('with a file path here')

11. When making a form:



