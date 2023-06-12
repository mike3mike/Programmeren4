const pool = require('../Database');
const Meal = require('../objects/Meal');
const { login } = require('./auth.controller');

const mealController = {
    addMeal: (req, res, next) => {
        let reqBody = req.body;
        try {
            let meal = new Meal(reqBody);
            let mealEntries = Object.entries(meal);
            let mealValuesWithoutNull = mealEntries.filter(value => value[1] != undefined);
            mealValuesWithoutNull = Object.fromEntries(mealValuesWithoutNull);
            let columns = ["name", "description", "price", "dateTime", "maxAmountOfParticipants", "imageUrl"];
            let columnsWithValues = {};
            let everyColumnPresent = columns.every((element) => {
                let count = Object.keys(mealValuesWithoutNull).filter(i => i == element).length;
                if (count == 1) {
                    columnsWithValues[element] = mealValuesWithoutNull[element];
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
                        let query = "INSERT INTO `meal` (" + columns.join(",") + ") VALUES (" + ("?,".repeat(columns.length)).substring(0, (columns.length * 2) - 1) + ")";
                        conn.query(
                            query,
                            Object.values(columnsWithValues),
                            function (queryError, results, fields) {
                                if (queryError) {
                                    let error = new Error(queryError.message);
                                    error.status = 403
                                    next(error);
                                } else {
                                    meal.id = results.insertId;
                                    res.status(201).json({
                                        status: 201,
                                        message: "Register meal",
                                        data: meal
                                    });
                                }
                            }
                        );
                        pool.releaseConnection(conn);
                    }
                });
            } else {
                let error = new Error("Not every required attribute is present");
                error.status = 400;
                next(error);
            }
        } catch (e) {
            let error = new Error(e.message);
            error.status = 400
            next(error);
        }
    },

    changeMeal: (req, res, next) => {
        let reqBody = req.body;
        try {
            let meal = new Meal(reqBody);
            let mealEntries = Object.entries(meal);
            let mealValuesWithoutNull = mealEntries.filter(value => value[1] != undefined);
            mealValuesWithoutNull = Object.fromEntries(mealValuesWithoutNull);
            let columns = ["name", "price", "maxAmountOfParticipants"];
            let columnsWithValues = {};
            let everyColumnPresent = columns.every((element) => {
                let count = Object.keys(mealValuesWithoutNull).filter(i => i == element).length;
                if (count == 1) {
                    columnsWithValues[element] = mealValuesWithoutNull[element];
                    return true;
                }
                return false;
            });
            if (everyColumnPresent) {
                pool.getConnection(function (err, conn) {
                    if (err) { next(err) }
                    if (conn) {
                        conn.query(
                            "SELECT * FROM `meal` WHERE id = ?",
                            [req.params.mealId],
                            function (err, results) {
                                if (err) { next(err); }
                                if (results.length == 0) {
                                    let error = new Error("Meal does not exist.");
                                    error.status = 404
                                    next(error);
                                } else {
                                    conn.query(
                                        "SELECT m.id FROM meal m WHERE m.id = ? AND (m.cookId = ? OR m.cookId is NULL) LIMIT 1",
                                        [req.params.mealId, req.user.id],
                                        function (err, results) {
                                            console.log(results);
                                            if (err) { next(err); } else {
                                                if (results.length == 0) {
                                                    let error = new Error("User does not have meal.");
                                                    error.status = 403
                                                    next(error);
                                                } else {
                                                    let query = 'UPDATE `meal` SET ';
                                                    let meal = new Meal(req.body);
                                                    let columns = Object.entries(columnsWithValues).filter(value => value[1] != undefined);
                                                    columns.forEach(([key, value]) => {
                                                        query += key + " = '" + req.body[key] + "',\r\n";
                                                    })
                                                    query = query.substring(0, query.length - 3);
                                                    query += "\r\nWHERE id = " + req.params.mealId;

                                                    conn.query(
                                                        query,
                                                        function (err, results) {
                                                            if (err) {
                                                                next(err);
                                                            } else {
                                                                meal.id = req.params.mealId;
                                                                res.status(200).json({
                                                                    status: 200,
                                                                    message: "Update Meal",
                                                                    data: meal
                                                                });
                                                            }
                                                        }
                                                    );
                                                }
                                            }
                                        }
                                    );
                                }
                            }
                        );

                        pool.releaseConnection(conn);
                    }
                });
            } else {
                let error = new Error("Not every required attribute is present");
                error.status = 400;
                next(error);
            }
        } catch (e) {
            let error = new Error(e.message);
            error.status = 400
            next(error);
        }
    },

    getMeals: (req, res, next) => {
        pool.getConnection(function (connectionError, conn) {
            if (connectionError) {
                next(connectionError);
            }
            if (conn) {
                let query = "SELECT * FROM `meal`";
                conn.query(
                    query,
                    function (queryError, results, fields) {
                        if (queryError) {
                            let error = new Error(queryError.message);
                            error.status = 403
                            next(error);
                        } else {
                            res.status(201).json({
                                status: 200,
                                message: "Get meal list",
                                data: results
                            });
                        }
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    getMealById: (req, res, next) => {
        var paramId = req.params.mealId;
        pool.getConnection(function (err, conn) {
            if (err) { next(err); }
            if (conn) {
                conn.query(
                    'SELECT  * FROM `meal` WHERE meal.id = ' + paramId,
                    function (err, results) {
                        if (err) { next(err) } else {
                            if (results.length == 0) {
                                next({
                                    status: 404,
                                    message: "Meal not found"
                                });
                            } else {
                                res.status(200).json({
                                    status: 200,
                                    message: "Meal by id",
                                    data: results[0]
                                });
                            }
                        }
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    deleteMeal: (req, res, next) => {
        var id = req.params.mealId;
        pool.getConnection(function (err, conn) {
            if (err) { next(err) }
            if (conn) {
                let query = 'DELETE FROM `meal` WHERE id = ?';
                conn.query(
                    query,
                    [id],
                    function (err, results) {
                        if (err) { next(err); } else if (results.affectedRows == 0) {
                            let error = new Error("Meal does not exist.");
                            error.status = 404
                            next(error);
                        } else {
                            res.status(200).json(
                                {
                                    status: 200,
                                    message: "Maaltijd met ID " + id + " is verwijderd",
                                    data: {}
                                }
                            )
                        };
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    }
}

const participationController = {
    register: (req, res, next) => {
        // let requiredAttributes = [firstName, lastName, street, city, emailAdress, password, phoneNumber];
        pool.getConnection(function (connectionError, conn) {
            if (connectionError) { next(connectionError); }
            if (conn) {
                let query = "INSERT INTO meal_participants_user (mealId, userId) SELECT ?,? FROM meal m WHERE (SELECT COUNT(*) FROM meal_participants_user up WHERE up.mealId = ?) < m.maxAmountOfParticipants && m.id = ?";
                conn.query(
                    query,
                    [req.params.mealId, req.user.id, req.params.mealId, req.params.mealId],
                    function (queryError, results, fields) {
                        if (queryError) {
                            let error = new Error(queryError.message);
                            error.status = 403
                            next(error);
                        } else {
                            conn.query("SELECT COUNT(*) AS participantCount FROM meal m WHERE m.id = ?", [req.params.mealId], function (queryError, participantCount, fields) {
                                console.log("MealCount = " + JSON.stringify(participantCount));
                                if (participantCount.participantCount == 0) {
                                    res.status(200).json({
                                        status: 404,
                                        message: "Meal does not exist. User met ID " + req.user.id + " is niet aangemeld voor maaltijd met ID " + req.params.mealId,
                                        data: {
                                            "currentlyParticipating": false,
                                            "currentAmountOfParticipants": participantCount[0].participantCount
                                        }
                                    });
                                } else if (results.affectedRows > 0) {
                                    res.status(200).json({
                                        status: 200,
                                        message: "User met ID " + req.user.id + " is aangemeld voor maaltijd met ID " + req.params.mealId,
                                        data: {
                                            "currentlyParticipating": true,
                                            "currentAmountOfParticipants": participantCount[0].participantCount
                                        }
                                    });
                                } else {
                                    res.status(200).json({
                                        status: 200,
                                        message: "User met ID " + req.user.id + " is niet aangemeld voor maaltijd met ID " + req.params.mealId,
                                        data: {
                                            "currentlyParticipating": false,
                                            "currentAmountOfParticipants": participantCount[0].participantCount
                                        }
                                    });
                                }
                            });
                        }
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    },

    delete: (req, res, next) => {
        var mealId = req.params.mealId;
        pool.getConnection(function (err, conn) {
            if (err) { next(err) }
            if (conn) {
                let query = 'DELETE FROM `meal_participants_user` WHERE mealId = ? AND userId = ?';
                conn.query(
                    query,
                    [mealId, req.user.id],
                    function (err, results) {
                        if (err) { next(err); } else {
                            if (results.affectedRows == 0) {
                                res.status(404).json({
                                    status: 404,
                                    message: "No data data matched.",
                                    data: []
                                });
                            }
                            res.status(200).json(
                                {
                                    status: 200,
                                    message: "User met ID " + req.user.id + " is afgemeld voor maaltijd met ID " + mealId,
                                    data: { results }
                                }
                            )
                        };
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    }
}

module.exports = {
    mealController: mealController,
    participationController: participationController
}