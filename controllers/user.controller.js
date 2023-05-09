const pool = require('../Database');
const User = require('../objects/User');

function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

const userController = {
    login: (req, res, next) => {
        res.send("Welcome " + req.user.firstName + "\r\nToken: " + req.user.jwtToken);
    },

    registerUser: (req, res, next) => {
        let reqBody = req.body;
        try {
            let user = new User(reqBody);
            let userEntries = Object.entries(user);
            let userValuesWithoutNull = userEntries.filter(value => value[1] != undefined);
            userValuesWithoutNull = Object.fromEntries(userValuesWithoutNull);
            let columns = [`firstName`, `lastName`, `street`, `city`, `emailAddress`, `passwordHash`, `passwordSalt`, `phoneNumber`];
            let columnsWithValues = {};
            let everyColumnPresent = columns.flat().every((element) => {
                let count = Object.keys(userValuesWithoutNull).filter(i => i == element).length;
                if (count == 1) {
                    columnsWithValues[element] = userValuesWithoutNull[element];
                    return true;
                }
                return false;
            });
            if (everyColumnPresent) {
                pool.getConnection(function (connectionError, conn) {
                    if (connectionError) {
                        next(connectionError);
                    }
                    if (conn) {
                        let query = "INSERT INTO `user` (" + columns.join(",") + ") VALUES (" + ("?,".repeat(columns.length)).substring(0, (columns.length * 2) - 1) + ")";
                        conn.query(
                            query,
                            Object.values(columnsWithValues),
                            function (queryError, results, fields) {
                                if (queryError) {
                                    let error = new Error(queryError.message);
                                    error.status = 403
                                    next(error);
                                } else {
                                    user.id = results.insertId;
                                    res.status(201).json({
                                        data: user
                                    });
                                }
                            }
                        );
                        pool.releaseConnection(conn);
                    }
                });
            } else {
                next("Not every required attribute is present");
            }
        } catch (e) {
            let error = new Error(e.message);
            error.status = 400
            next(error);
        }
    },

    getUserList: (req, res, next) => {
        try {
            let parameters = Object.entries(req.query);
            let columns = ["firstName", "lastName", "street", "city", "emailAddress", "password", "phoneNumber", "isActive"];
            let correctParameters = [];
            parameters.forEach(([key, value], index) => {
                if (columns.indexOf(key) == -1 && correctParameters.length == index) {
                    res.status(200).json({
                        data: []
                    });
                } else {
                    correctParameters.push([key, value]);
                }
            })
            if (parameters.length == correctParameters.length) {
                pool.getConnection(function (connectionError, conn) {
                    if (connectionError) {
                        next(connectionError);
                    }
                    if (conn) {
                        whereQuery = correctParameters.length > 0 ? " WHERE " : "";
                        correctParameters.forEach((i, index) => {
                            replaceDict = {"true":"1", "false":"2"};
                            replacedValue = i[1].replace("true", 1).replace("false", "0");
                            whereQuery += (i[0] + " = " + "'" + replacedValue + "'");
                            if (index != correctParameters.length - 1) {
                                whereQuery += " AND ";
                            }
                        })
                        conn.query(
                            'SELECT * FROM `user`' + whereQuery,
                            function (queryError, results, fields) {
                                if (queryError) {
                                    res.status(403).json({
                                        "Error": queryError.code
                                    });
                                    next(queryError);
                                } else {
                                    res.status(200).json({
                                        data: results
                                    });
                                }
                            }
                        );
                        pool.releaseConnection(conn);
                    }
                });
            }
        } catch (e) {
            let error = new Error(e);
            error.status = 400
            next(error);
        }
    },

    getProfileById: (req, res, next) => {
        var paramId = req.params.userId;
        let reqJWTtoken = req.headers.authorization.substring(7, req.headers.authorization.length);
        let loggedInUserId = parseJwt(reqJWTtoken).id;
        pool.getConnection(function (err, conn) {
            if (err) { next(err); }
            if (conn) {
                conn.query(
                    'SELECT  *, user.id AS userId FROM `user` LEFT JOIN meal_participants_user mpu ON mpu.userId = user.id LEFT JOIN meal m ON m.id = mpu.mealId WHERE user.id = ' + paramId,
                    function (err, results) {
                        if (err) { next(err) } else {
                            results.forEach(record => {
                                if (record.userId != loggedInUserId){
                                    record.passwordHash = "";
                                    record.passwordSalt = "";
                                }
                            });
                            if (results.length == 0){
                                next({
                                    status: 404,
                                    message: "User not found"
                                });
                            } else {
                                res.status(200).json(results);
                            }
                        }
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    getProfile: (req, res, next) => {
        pool.getConnection(function (err, conn) {
            if (err) { next(err); }
            let loggedInUser = req.user;
            console.log(loggedInUser);
            if (conn) {
                conn.query(
                    'SELECT m.* FROM `user` LEFT JOIN meal_participants_user mpu ON mpu.userId = user.id LEFT JOIN meal m ON m.id = mpu.mealId WHERE user.id = ' + loggedInUser.id,
                    function (err, results) {
                        if (err) { next(err); } else {
                        if (results.length == 0){
                            next({
                                status: 404,
                                message: "User not found"
                            });
                        } else {
                            loggedInUser.meals = results;
                            res.status(200).json(loggedInUser);
                        }
                    }
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    updateUser: (req, res, next) => {
        let reqBody = req.body;
        let loggedInUser = req.user;
        if (loggedInUser.id != req.params.userId) {
            let error = Error("You need to be the owner.");
            error.status = 403;
            throw error;
        }
        // User doens't have postcode, so that validity cannot be checked
        Object.entries(reqBody).forEach(([key, value]) => {
            switch (key) {
                case "id":
                    break;
                case "emailAddress":
                    loggedInUser.setEmailAddress(value);
                    break;
                case "phoneNumber":
                    loggedInUser.setPhoneNumber(value);
                    break
                default:
                    loggedInUser[key] = value;
            }
        });
        pool.getConnection(function (err, conn) {
            if (err) { next(err) }
            if (conn) {
                let query = 'UPDATE `user` SET ';
                let columns = ["firstName", "lastName", "street", "city", "emailAddress", "passwordHash", "passwordSalt", "phoneNumber"];
                columns.forEach((columnName) => {
                    query += columnName + " = '" + loggedInUser[columnName] + "',\r\n";
                })
                query = query.substring(0, query.length - 3);
                query += "\r\nWHERE id = " + loggedInUser.id;
                conn.query(
                    query,
                    function (err, results) {
                        if (err) {
                            next(err);
                        }
                    }
                );
                conn.query(
                    "SELECT * FROM `user` WHERE id = ?",
                    [loggedInUser.id],
                    function (err, results) {
                        if (err) {
                            next(err);
                        } else {
                            res.status(200).json(results);
                        }
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    deleteUser: (req, res, next) => {
        var id = req.params.userId;
        let loggedInUser = req.user;
        if (loggedInUser.id != req.params.userId) {
            let error = Error("You need to be the owner.");
            error.status = 403;
            throw error;
        }
        pool.getConnection(function (err, conn) {
            if (err) { console.log('error', err); }
            if (conn) {
                let query = 'DELETE FROM `user` WHERE id = ?';
                conn.query(
                    query,
                    [id],
                    function (err, results) {
                        if (err) { next(err); } else {
                            res.status(200).json(
                            {
                                message: "User met ID " + id + " is verwijderd"
                            }
                        )};
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    }
}

module.exports = userController;