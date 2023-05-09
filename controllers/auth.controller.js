module.exports = {
    login(req, res, next) {
        let emailAddress = req.body.emailAddress;
        let password = req.body.password;
        const User = require('../objects/User');
        // Used to check emailAddress and password validity
        new User({emailAddress: emailAddress, password: password});
        if (emailAddress == null){
            let error = new Error("emailAddress is required");
            error.status = 400
            next(error);
        }
        const pool = require('../Database');
        pool.getConnection(function (connectionError, conn) {
            if (connectionError) {
                return null;
            }
            if (conn) {
                let query = "SELECT * FROM `user` WHERE emailAddress = ?";
                conn.query(
                    query,
                    [emailAddress],
                    function (queryError, results, fields) {
                        if (queryError) return null;
                        if (results.length == 0){
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
        if (authHeader.startsWith("Bearer ")){
            let reqJWTtoken = authHeader.substring(7, authHeader.length);
            var jwt = require('jsonwebtoken');
            jwt = jwt.verify(reqJWTtoken, "ajwtsecret");
            console.log("Validated id: " + jwt.id);
            if (jwt.id) {
                next()
            } else {
                next("Something is wrong with your JWT token.");
            };
       }
       return false;
    }
};