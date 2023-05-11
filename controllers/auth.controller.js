module.exports = {
    login(req, res, next) {
        let emailAdress = req.body.emailAdress;
        let password = req.body.password;
        const User = require('../objects/User');
        // Used to check emailAdress and password validity
        new User({ emailAdress: emailAdress, password: password });
        if (emailAdress == null) {
            let error = new Error("emailAdress is required");
            error.status = 400
            next(error);
        }
        const pool = require('../Database');
        pool.getConnection(function (connectionError, conn) {
            if (connectionError) {
                return null;
            }
            if (conn) {
                let query = "SELECT * FROM `user` WHERE emailAdress = ?";
                conn.query(
                    query,
                    [emailAdress],
                    function (queryError, results, fields) {
                        if (queryError) return null;
                        if (results.length == 0) {
                            let error = new Error("User does not exist");
                            error.status = 404
                            next(error);
                        } else {
                            var user = new User(results[0]);
                            user.setJWTtoken(password);
                            req.user = user;
                            next();
                        }
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    validate(req, res, next) {
        let authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            let reqJWTtoken = authHeader.substring(7, authHeader.length);
            var jwt = require('jsonwebtoken');
            jwt = jwt.verify(reqJWTtoken, "ajwtsecret");
            console.log("Validated id: " + jwt.id);
            if (jwt.id) {
                let user = new User();
                user.id = jwt.id;
                req.user = user;
                next()
            } else {
                next("Something is wrong with your JWT token.");
            };
        } else {
            next({ message: "Include a bearer token in the authorization header. The format is 'Bearer {JWT token}'." });
        }
    }
};