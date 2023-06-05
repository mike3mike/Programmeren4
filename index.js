const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// const userRouter = require('./routes/user.routes');
// app.use("/api", userRouter);
app.all((req, res, next) => {
    res.json(req.body);
})
// const mealRouter = require('./routes/meal.routes');
// app.use("/api/meal", mealRouter);
// const participationRouter = require('./routes/participation.routes');
// app.use("/api", participationRouter);

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