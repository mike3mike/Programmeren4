const pool = require('../Database');
const Meal = require('../objects/Meal');

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
                pool.getConnection(function (connectionError, conn) {
                    if (connectionError) {
                        next(connectionError);
                    }
                    if (conn) {
                        let query = "UPDATE `meal` (" + columns.join(",") + ") VALUES (" + ("?,".repeat(columns.length)).substring(0, (columns.length * 2) - 1) + ")";
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

    getMeals: (req, res, next) => {
        let reqBody = req.body;
        let meal = new Meal(reqBody);
        let mealEntries = Object.entries(meal);
        let mealValuesWithoutNull = mealEntries.filter(value => value[1] != undefined);
        mealValuesWithoutNull = Object.fromEntries(mealValuesWithoutNull);
        pool.getConnection(function (connectionError, conn) {
            if (connectionError) {
                next(connectionError);
            }
            if (conn) {
                let query = "SELECT * FROM `meal`";
                conn.query(
                    query,
                    Object.values(columnsWithValues),
                    function (queryError, results, fields) {
                        if (queryError) {
                            let error = new Error(queryError.message);
                            error.status = 403
                            next(error);
                        } else {
                            // TODO: Hide ALL passwords
                            res.status(201).json({
                                status: 201,
                                message: "Get meal list",
                                data: meal
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
                    'SELECT  *, user.id AS userId FROM `meal` LEFT JOIN meal_participants_user mpu ON mpu.userId = user.id LEFT JOIN user m ON m.id = mpu.mealId WHERE meal.id = ' + paramId,
                    function (err, results) {
                        if (err) { next(err) } else {
                            if (results.length == 0){
                                next({
                                    status: 404,
                                    message: "Meal not found"
                                });
                            } else {
                                res.status(200).json({
                                    status: 200,
                                    message: "Meal by id",
                                    data: results
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
                        if (err) { next(err); } else {
                            res.status(200).json(
                            {
                                status: 200,
                                message: "Maaltijd met ID " + id + " is verwijderd",
                                data: {}
                            }
                        )};
                    }
                );
                pool.releaseConnection(conn);
            }
        });
    }
}

module.exports = mealController;