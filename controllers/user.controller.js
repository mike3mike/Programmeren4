const pool = require('../Database');
const User = require('../objects/User');

const userController = {
    registerUser: (req, res, next) => {
        let reqData = req.body;
        try {
            let user = new User({
                firstName: reqData.firstName,
                lastName: reqData.lastName,
                street: reqData.street,
                city: reqData.city,
                emailAddress: reqData.emailAddress,
                password: reqData.password,
                phoneNumber: reqData.phoneNumber
            });
            let userValues = Object.values(user);
            let userValuesWithoutNull = userValues.filter(i => i != undefined).flatMap((i) => {
                if (Array.isArray(i)) {
                    return i;
                }
                else {
                    return i
                }
            });
            let columns = [`firstName`, `lastName`, `street`, `city`, `emailAddress`, `password`, `passwordHash`, `phoneNumber`];
            if (columns.length != userValuesWithoutNull.length) next("Not every required attribute is present.");
            pool.getConnection(function (connectionError, conn) {
                if (connectionError) {
                    next(connectionError);
                }
                if (conn) {
                    let query = "INSERT INTO `user` (" + columns.join(",") + ") VALUES (" + ("?,".repeat(columns.length)).substring(0, (columns.length * 2) - 1) + ")";
                    conn.query(
                        query,
                        userValuesWithoutNull,
                        function (queryError, results, fields) {
                            if (queryError) {
                                res.status(403).json({
                                    "Error": queryError.code
                                });
                                next(queryError);
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
        } catch (e) {
            res.status(400).json({
                "Error": e.message
            });
            next(e.message);
        }
    },

    getUserList: (req, res, next) => {
        try {
            let parameters = Object.entries(req.query);
            let columns = ["firstName", "lastName", "street", "city", "emailAddress", "password", "phoneNumber"];
            let correctParameters = [];
            parameters.forEach(([key, value], index) => {
                if (columns.indexOf(key) == -1 && correctParameters.length == index) {
                    res.status(200).json({
                        data: []
                    });
                    next(e.message);
                } else {
                    correctParameters.push([key, value]);
                }
            })
            if (parameters.length == correctParameters.length) {
                pool.getConnection(function (connectionError, conn) {
                    if (connectionError) {
                        next();
                    }
                    if (conn) {
                        whereQuery = correctParameters.length > 0 ? "WHERE " : "";
                        correctParameters.forEach((i, index) => {
                            whereQuery += (i[0] + " = " + "'" + i[1] + "'");
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
            res.status(400).json({
                "Error": e.message
            });
            next(e.message);
        }
    },

    getProfileById: (req, res, next) => {
        var id = req.params.userId;
        pool.getConnection(function (err, conn) {
            if (err) {  console.log('error', err); }
            if (conn) {
                conn.query(
                    'SELECT  *, user.id AS userId FROM `user` JOIN meal_participants_user mpu ON mpu.userId = user.id JOIN meal m ON m.id = mpu.mealId WHERE user.id = ' + id,
                    function (err, results) {
                        if (err) {
                            console.log(err.sqlMessage, ' ', err.errno, '', err.code);
                        } else {
                            results.forEach(record => {
                                if (record.userId != loggedInUser.id){
                                    record.password = "";
                                    record.passwordHash = "";
                                }
                            });
                            if (results.length == 0){
                                res.status(404).json(results);
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
        var id = loggedInUser.id;
        pool.getConnection(function (err, conn) {
            if (err) { console.log('error', err); }
            if (conn) {
                conn.query(
                    'SELECT m.* FROM `user` JOIN meal_participants_user mpu ON mpu.userId = user.id JOIN meal m ON m.id = mpu.mealId WHERE user.id = ' + id,
                    function (err, results) {
                        if (err) {
                            console.log(err.sqlMessage, ' ', err.errno, '', err.code);
                        } else {
                            let loggedInUserResult = loggedInUser;
                            loggedInUserResult.meals = results;
                            res.status(200).json(loggedInUserResult);
                        }
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    updateUser: (req, res, next) => {
        let reqBody = req.body;
        if (!loggedInUser) {
            let error = Error("You need to be logged in.");
            error.status = 401;
            throw error;
        }
        if (loggedInUser.id != req.params.userId) {
            console.log(loggedInUser.id, req.params.userId);
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
            if (err) { console.log('error', err); }
            if (conn) {
                let query = 'UPDATE `user` SET ';
                let columns = ["firstName", "lastName", "street", "city", "emailAddress", "password", "phoneNumber"];
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
        if (!loggedInUser) {
            let error = Error("You need to be logged in.");
            error.status = 401;
            throw error;
        }
        if (loggedInUser.id != req.params.userId) {
            console.log(loggedInUser.id, req.params.userId);
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
                        if (err) {
                            next(err);
                        }
                        res.status(200).json(
                            {
                                message: "User met ID " + id + " is verwijderd"
                            }
                        );
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    }
}

module.exports = userController;