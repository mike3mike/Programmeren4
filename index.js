const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// app.use(function (req, res) {
//     // var send = res.send;
//     res.send = function (body) {
//         // body = JSON.stringify(body).replace('"isActive":1','"isActive":true').replace('"isActive":0','"isActive":false');
//         // body = JSON.parse(body);
//         console.log(body);
//         send.call(this, body);
//     };
// });
function responseInterceptor(req, res, next) {
var originalSend = res.send;

res.send = function(body){
    body = JSON.stringify(body).replace(/\"isActive\\":1/g,'\"isActive\\":true').replace(/\"isActive\\":0/g,'\"isActive\\":false').replace(/\"isVega\\":1/g,'\"isVega\\":true').replace(/\"isVega\\":0/g,'\"isVega\\":false').replace(/\"isVegan\\":1/g,'\"isVegan\\":true').replace(/\"isVegan\\":0/g,'\"isVegan\\":false').replace(/\"isToTakeHome\\":1/g,'\"isToTakeHome\\":true').replace(/\"isToTakeHome\\":0/g,'\"isToTakeHome\\":false');
    body = JSON.parse(body);
    console.log(body);
    originalSend.call(res, body);
};
next();
}

app.use(responseInterceptor);
const userRouter = require('./routes/user.routes');
app.use("/api", userRouter);
const mealRouter = require('./routes/meal.routes');
app.use("/api/meal", mealRouter);



app.use((err, req, res, next) => {
    // if (err.code != undefined) {
    //     console.log("Error code: " + err.code);
    // } else {
    //     console.log(err);
    // }
    // console.log(err);
    if (!res.headersSent) {
        if (err.status) {
            res.status(err.status).json(
                {
                    status: err.status,
                    errCode: err.code,
                    message: err.message,
                    data: {}
                }
            );
        } else if (err.code || err.message) {
            res.status(500).json(
                {
                    status: 500,
                    errCode: err.code,
                    message: err.message,
                    data: {}
                }
            );
        } else {
            res.status(500).json({
                status: 500,
                message: "",
                data: {}
            });
        }
    }
})

app.use((req, res) => {
    console.log(req.originalUrl);
    console.log("Status Code: 404");
    res.status(404).end();
})

app.listen(port, () => {
    console.log(`Application is running on ` + port + '.')
})

module.exports = app;