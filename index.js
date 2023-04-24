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

function compare(a, b) {
    if (a.emailAddress < b.emailAddress)
        return -1;
    if (a.emailAddress > b.emailAddress)
        return 1;
    return 0;
}

app.get("/api/user", (req, res, next) => {
    let parameters = Object.keys(req.query);
    let columns = ["firstName", "lastName", "street", "city", "emailAddress", "password", "phoneNumber"];
    let invalidParameter;
    parameters.forEach((parameter) => {
        if (columns.indexOf(parameter) == -1 && !invalidParameter) {
            res.status(200).json([]);
            invalidParameter = true;
        }
    })
    if (!invalidParameter) {
        res.status(200).json(database.users.sort(compare));
    }
})

app.use("*", (req, res, next) => {
    res.status(404).end();
})

app.listen(port, () => {
    console.log(`Application is running.`)
})

module.exports = app;