const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.json({
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        authPayload: req.headers.authorization ? JSON.parse(Buffer.from(req.headers.authorization.substring(7, req.headers.authorization.length).split(".")[1], "base64").toString()) : "ll"
    });
    next();
})

// const userRouter = require('./routes/user.routes');
// app.use("/api", userRouter);
// const mealRouter = require('./routes/meal.routes');
// app.use("/api/meal", mealRouter);

// app.use((err, req, res, next) => {
//     // if (err.code != undefined) {
//     //     console.log("Error code: " + err.code);
//     // } else {
//     //     console.log(err);
//     // }
//     // console.log(err);
//     if (!res.headersSent) {
//         if (err.status) {
//             res.status(err.status).json(
//                 {
//                     status: err.status,
//                     errCode: err.code,
//                     message: err.message,
//                     data: {}
//                 }
//             );
//         } else if (err.code || err.message) {
//             res.status(500).json(
//                 {
//                     status: 500,
//                     errCode: err.code,
//                     message: err.message,
//                     data: {}
//                 }
//             );
//         } else {
//             res.status(500).json({
//                 status: 500,
//                 message: "",
//                 data: {}
//             });
//         }
//     }
// })

// app.use((req, res) => {
//     console.log(req.originalUrl);
//     console.log("Status Code: 404");
//     res.status(404).end();
// })

app.listen(port, () => {
    console.log(`Application is running on ` + port + '.')
})

module.exports = app;