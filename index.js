const User = require('./User.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.raw({ inflate: true, limit: '100kb', type: 'application/json' }));
// app.use(express.json());
const port = 3000;
const Database = require('./Database.js');
let database = new Database();

app.post("/api/register", (req, res, next) => {
    let json = JSON.parse(req.body);
    try {
        let user = new User(database, json.firstName, json.lastName, json.street, json.city, json.emailAddress, json.password, json.phoneNumber, json.phoneNumber);
        database.users.push(user);
        res.json({
            data: user
        });
    } catch (e) {
        res.status(422).json({
            error: e.message
        });
    }
    next();
})

app.get("/api/user", (req, res, next) => {
    let parameters = Object.entries(req.query);
    let columns = ["firstName", "lastName", "street", "city", "emailAddress", "password", "phoneNumber"];
    let correctParameters = [];
    parameters.forEach(([key, value]) => {
        if (columns.indexOf(key) == -1) {
            res.status(200).json([]);
        } else {
            correctParameters.push([key, value]);
        }
    })
    if (parameters.length == correctParameters.length) {
        if (correctParameters.length == 1) {
            res.status(200).json(database.users.filter(i => i[correctParameters[0][0]] == correctParameters[0][1]));
        } else if (correctParameters.length == 2) {
            res.status(200).json(database.users.filter(i => i[correctParameters[0][0]] == correctParameters[0][1] && i[correctParameters[1][0]] == correctParameters[1][1]));
        }
    }
    next();
})

app.use("*", (req, res, next) => {
    res.status(404).end();
})

app.listen(port, () => {
    console.log(`Application is running.`)
})

module.exports = app;