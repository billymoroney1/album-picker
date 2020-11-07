const bcrypt = require('bcrypt')
const saltRounds = 10

const myPlaintextPassword = "password"
let myHashPassword = ""

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
         // store in database
         console.log('myPlaintextPassword', myPlaintextPassword)
         console.log("hash",hash)
         myhash = hash
         bcrypt.compare(myPlaintextPassword, myhash, function(err, result) {
             // result == true
             console.log(result)
         });
    })
})

// const hash = bcrypt.hashSync(myTextPassword, 10)
// console.log(hash)