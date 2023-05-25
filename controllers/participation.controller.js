const pool = require('../Database');
const User = require('../objects/User');
const Meal = require('../objects/Meal');

const participationController = {
    register: (req, res, next) => {
        res.json(req.body);
        // new User({
        //     // firstName,
        //     // lastName,
        //     // street,
        //     // city,
        //     // emailAdress,
        //     // password,
        //     // phoneNumber
        // });
        // new Meal({

        // });
        // let requiredAttributes = [firstName, lastName, street, city, emailAdress, password, phoneNumber];
        // pool.getConnection(function (connectionError, conn) {
        //     if (connectionError) {
        //         next(connectionError);
        //     }
        //     if (conn) {
        //         let query = "INSERT INTO `user` (" + columns.join(",") + ") VALUES (" + ("?,".repeat(columns.length)).substring(0, (columns.length * 2) - 1) + ")";
        //         conn.query(
        //             query,
        //             Object.values(columnsWithValues),
        //             function (queryError, results, fields) {
        //                 if (queryError) {
        //                     let error = new Error(queryError.message);
        //                     error.status = 403
        //                     next(error);
        //                 } else {
        //                     user.id = results.insertId;
        //                     res.status(201).json({
        //                         status: 201,
        //                         message: "Register user",
        //                         data: user
        //                     });
        //                 }
        //             }
        //         );
        //         pool.releaseConnection(conn);
        //     }
        // });
    },

    delete: (req, res, next) => {
        res.json(req.body);
    }
}

module.exports = participationController;