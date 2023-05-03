const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// app.use(bodyParser.raw({ inflate: true, limit: '100kb', type: 'application/json' }));
app.use(express.json());
const port = 3000;

const User = require('./objects/User');
// The documentation says that there is no account information for the logged in user in the body, so for now it is hardcoded
loggedInUser = new User({
    id: 139,
    firstName: "Mike", 
    lastName: "Leijten", 
    street: "Teststreet", 
    city: "Testcity", 
    emailAddress: "m.leijten3@student.avans.nl", 
    password: "Testtest123", 
    phoneNumber: "0612345678"
});

const userRouter = require('./routes/user.routes');
app.use("/api/user", userRouter);

app.use((err, req, res, next) => {
    if (err.code != undefined) {
        console.log("Error: " + err.code);
    } else {
        console.log(err);
    }
    if (!res.headersSent) {
        if (err.status) {
            res.status(err.status).send();
        } else {
            res.status(500).send();
        }
    }
    
})

app.use((req, res) => {
    console.log("Status Code: 404");
    res.status(404).end();
})

app.listen(port, () => {
    console.log(`Application is running.`)
})

module.exports = app;