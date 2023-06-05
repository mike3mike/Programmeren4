module.exports = {
    login(req, res, next) {
        let emailAdress = req.body.emailAdress;
        let password = req.body.password;
        const User = require('../objects/User');
        // Used to check emailAdress and password validity
        new User(req.body);
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
                let values = [emailAdress];
                // if (req.params.userId != undefined) {
                //     query += " OR id = ?";
                //     values.push(req.params.userId);
                // }
                conn.query(
                    query,
                    values,
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
        try {
            if (authHeader.startsWith("Bearer ")) {
                let reqJWTtoken = authHeader.substring(7, authHeader.length);
                var jwt = require('jsonwebtoken');
                jwt = jwt.verify(reqJWTtoken, "ajwtsecret");
                // if (JSON.parse(Buffer.from(reqJWTtoken.split(".")[1], "base64").toString()).userId != req.params.userId) {
                //     let error = Error("You need to be the owner.");
                //     error.status = 403;
                //     next(error);
                // }
                if (jwt.userId) {
                    const User = require('../objects/User');
                    const pool = require('../Database');
                    pool.getConnection(function (connectionError, conn) {
                        if (connectionError) {
                            return null;
                        }
                        if (conn) {
                            let query = "SELECT * FROM `user` WHERE id = ?";
                            let values = [jwt.userId];
                            // if (req.params.userId != undefined) {
                            //     query += " OR id = ?";
                            //     values.push(req.params.userId);
                            // }
                            conn.query(
                                query,
                                values,
                                function (queryError, results, fields) {
                                    if (queryError) return null;
                                    if (results.length == 0) {
                                        let error = new Error("User does not exist");
                                        error.status = 404
                                        next(error);
                                    } else {
                                        var user = new User(results[0]);
                                        req.user = user;
                                        next();
                                    }
                                }
                            );
                            pool.releaseConnection(conn);
                        }
                    });
                    // next()
                } else {
                    next({
                        status: 401,
                        message: "Something is wrong with your JWT token."
                    });
                };
            } else {
                next({
                    status: 401,
                    message: "Include a bearer token in the authorization header. The format is 'Bearer {token}'."
                });
            }
        } catch (e) {
            next({
                status: 401,
                message: "Include a bearer token in the authorization header. The format is 'Bearer {token}'."
            });
        }
    }
};