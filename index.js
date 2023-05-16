const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const userRouter = require('./routes/user.routes');
app.use("/api", userRouter);

app.all((req, res, next) => {
    console.log(req.body);
})

app.use((err, req, res, next) => {
    // if (err.code != undefined) {
    //     console.log("Error code: " + err.code);
    // } else {
    //     console.log(err);
    // }
    if (!res.headersSent) {
        if (err.status) {
            res.status(err.status).json(
                {
                    status: err.status,
                    errCode: err.code,
                    message: err.message
                }
            );
        } else if (err.code || err.message) {
            res.status(500).json(
                {
                    status: 500,
                    errCode: err.code,
                    message: err.message
                }
            );
        } else {
            res.status(500).json({
                status: 500
            });
        }
    }
})

app.use((req, res) => {
    console.log("Status Code: 404");
    res.status(404).end();
})

app.listen(port, () => {
    console.log(`Application is running on ` + port + '.')
})

module.exports = app;