const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const assert = require('assert');
const pool = require('../Database');
const expect = chai.expect;

chai.should();
chai.use(chaiHttp);

deleteMealParticipantQuery = "DELETE FROM `meal_participants_user`;";
deleteMealQuery = "DELETE FROM `meal`;";
deleteUserQuery = "DELETE FROM `user`;";
deleteQueries = deleteMealParticipantQuery + deleteMealQuery + deleteUserQuery;
insertUserQuery = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city`) VALUES(1, 'Mike', 'Leijten', 1, 'm.leijten@gmail.com', 'Testtest123', '0623456789', 'editor,guest', 'newStreet', 'newCity'),(2, 'Joe', 'Doe', 1, 'joedoe@gmail.com', 'Testtest1234', '0612345678', 'admin', 'aStreet', 'aCity'),(3, 'Jane', 'Smith', 1, 'janesmith@email.com', 'Testtest123', '0687654321', 'admin', 'someStreet', 'someCity'),(4, 'Johnny', 'Depp', 1, 'johnnydepp@gmail.com', 'Testtest1234', '0612345678', 'admin', 'deppstreet', 'deppcity'),(5, 'Mike', 'Leijten', 1, 'm.leijten56@gmail.com', 'Testtest123', '0623456789', 'editor,guest', 'newStreet', 'newCity');";
insertMealQuery = "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `createDate`, `updateDate`, `name`, `description`, `allergenes`) VALUES(1, 1, 0, 0, 1, '2022-03-22 17:35:00', 4, '12.75', 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 1, '2022-02-26 18:12:40.048998', '2022-04-26 12:33:51.000000', 'Pasta Bolognese met tomaat, spekjes en kaas', 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', 'gluten,lactose'),(2, 1, 1, 0, 0, '2022-05-22 13:35:00', 4, '12.75', 'https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg', 1, '2022-02-26 18:12:40.048998', '2023-05-11 17:06:57.465049', 'Aubergine uit de oven met feta, muntrijst en tomatensaus', 'Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.', 'noten'),(3, 1, 0, 0, 1, '2022-05-22 17:30:00', 4, '10.75', 'https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg', 1, '2022-02-26 18:12:40.048998', '2023-05-11 17:06:57.465049', 'Spaghetti met tapenadekip uit de oven en frisse salade', 'Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.', 'gluten,lactose'),(4, 1, 0, 0, 0, '2022-03-26 21:22:26', 4, '4.00', 'https://static.ah.nl/static/recepten/img_063387_890x594_JPG.jpg', 1, '2022-03-06 21:23:45.419085', '2023-05-11 17:06:57.465049', 'Zuurkool met spekjes', 'Heerlijke zuurkoolschotel, dé winterkost bij uitstek. ', ''),(5, 1, 1, 0, 1, '2022-03-26 21:24:46', 6, '6.75', 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg', 2, '2022-03-06 21:26:33.048938', '2023-05-11 17:06:57.465049', 'Groentenschotel uit de oven', 'Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.', '');";
insertMealParticipantQuery = "INSERT INTO `meal_participants_user` (`mealId`, `userId`)VALUES('1', '1'),('1', '3'),('1', '4'),('1', '5');";
insertQueries = insertUserQuery + insertMealQuery + insertMealParticipantQuery;

// Included for login
it("Login Success", (done) => {
    chai
        .request(server)
        .post("/api/login")
        .send({
            emailAdress: "m.leijten@gmail.com",
            password: "Testtest123"
        })
        .end((err, res) => {
            let { status, message, data } = res.body;
            expect(status).to.exist;
            expect(message).to.exist;
            expect(data).to.exist;
            res.body.should.be.an('object');
            expect(data).to.not.be.empty;
            res.status.should.equals(200);
            res.body.message.should.be.a('string').eql("Login Succesful");
            token = res.body.data.token;
            done();
        })
})

describe('UC-301', () => {
    beforeEach(() => {
        pool.getConnection(function (connectionError, conn) {
            if (conn) {
                conn.query(
                    deleteQueries + insertQueries
                );
                pool.releaseConnection(conn);
            }
        });
        return;
    })
    
    it("1 - Required field is missing", (done) => {
        chai
            .request(server)
            .post("/api/meal")
            .set({ Authorization: `Bearer ` + token })
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "De Dorsvlegel",
                city: "Tilburg",
                password: "Testtest123",
                phoneNumber: "0615601357"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Not every required attribute is present");
                res.status.should.equals(400);
                done();
            })
    })

    it("2 - Not logged in", (done) => {
        chai
            .request(server)
            .post("/api/meal")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "De Dorsvlegel",
                city: "Tilburg",
                emailAdress: "@mike@gmail.com",
                password: "Testtest123",
                phoneNumber: "0615601357"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Include a bearer token in the authorization header. The format is 'Bearer {token}'.");
                res.status.should.equals(401);
                done();
            })
    })

    it("3 - Success", (done) => {
        chai
            .request(server)
            .post("/api/meal")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                res.body.message.should.be.a('string').eql("Register meal");
                res.status.should.equals(201);
                done();
            })
    })
})

describe('UC-302', () => {
    beforeEach(() => {
        pool.getConnection(function (connectionError, conn) {
            if (conn) {
                conn.query(
                    deleteQueries + insertQueries
                );
                pool.releaseConnection(conn);
            }
        });
        return;
    })

    it("1 - Required field is missing", (done) => {
        chai
            .request(server)
            .put("/api/meal/1")
            .set({ Authorization: `Bearer ` + token })
            .send({
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Not every required attribute is present");
                res.status.should.equals(400);
                done();
            })
    })

    it("2 - Not logged in", (done) => {
        chai
            .request(server)
            .put("/api/meal/1")
            .send({
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Include a bearer token in the authorization header. The format is 'Bearer {token}'.");
                res.status.should.equals(401);
                done();
            })
    })

    // it("3 - User is not the owner of the data", (done) => {
    //     chai
    //         .request(server)
    //         .put("/api/meal/5")
    //         .set({ Authorization: `Bearer ` + token })
    //         .send({
    //             name: "Spaghetti",
    //             description: "A delicious meal from Italy.",
    //             price: "8.99",
    //             dateTime: "2023-07-05T18:00:00",
    //             maxAmountOfParticipants: 4,
    //             imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
    //         })
    //         .end((err, res) => {
    //             let { status, message, data } = res.body;
                // expect(status).to.exist;
                // expect(message).to.exist;
                // expect(data).to.exist;
                // res.body.should.be.an('object');
                // Object.keys(data).length.should.be.equal(0);
    //             res.body.message.should.be.a('string').eql("User does not have meal.");
    //             res.status.should.equals(403);
    //             done();
    //         })
    // })

    it("4 - Meal does not exist", (done) => {
        chai
            .request(server)
            .put("/api/meal/867")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Meal does not exist.");
                res.status.should.equals(404);
                done();
            })
    })

    it("5 - Success", (done) => {
        chai
            .request(server)
            .put("/api/meal/1")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                res.body.message.should.be.a('string').eql("Update Meal");
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-303', () => {
    beforeEach(() => {
        pool.getConnection(function (connectionError, conn) {
            if (conn) {
                conn.query(
                    deleteQueries + insertQueries
                );
                pool.releaseConnection(conn);
            }
        });
        return;
    })

    it("1 - List with meals", (done) => {
        chai
            .request(server)
            .get("/api/meal")
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                res.body.message.should.be.a('string').eql("Get meal list");
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-304', () => {
    beforeEach(() => {
        pool.getConnection(function (connectionError, conn) {
            if (conn) {
                conn.query(
                    deleteQueries + insertQueries
                );
                pool.releaseConnection(conn);
            }
        });
        return;
    })

    it("1 - Meal does not exist", (done) => {
        chai
            .request(server)
            .get("/api/meal/345375")
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Meal not found");
                res.status.should.equals(404);
                done();
            })
    })

    it("2 - Meal details", (done) => {
        chai
            .request(server)
            .get("/api/meal/1")
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                res.body.message.should.be.a('string').eql("Meal by id");
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-305', () => {
    beforeEach(() => {
        pool.getConnection(function (connectionError, conn) {
            if (conn) {
                conn.query(
                    deleteQueries + insertQueries
                );
                pool.releaseConnection(conn);
            }
        });
        return;
    })

    it("1 - Not logged in", (done) => {
        chai
            .request(server)
            .delete("/api/meal/1")
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Include a bearer token in the authorization header. The format is 'Bearer {token}'.");
                res.status.should.equals(401);
                done();
            })
    })

    // it("2 - User is not the owner of the data", (done) => {
    //     chai
    //         .request(server)
    //         .delete("/api/meal/5")
    //         .set({ Authorization: `Bearer ` + token })
    //         .send({
    //             name: "Spaghetti",
    //             description: "A delicious meal from Italy.",
    //             price: "8.99",
    //             dateTime: "2023-07-05T18:00:00",
    //             maxAmountOfParticipants: 4,
    //             imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
    //         })
    //         .end((err, res) => {
    //             let { status, message, data } = res.body;
                // expect(status).to.exist;
                // expect(message).to.exist;
                // expect(data).to.exist;
                // res.body.should.be.an('object');
                // Object.keys(data).length.should.be.equal(0);
    //             res.body.message.should.be.a('string').eql("User does not have meal.");
    //             res.status.should.equals(403);
    //             done();
    //         })
    // })

    it("3 - Meal does not exist", (done) => {
        chai
            .request(server)
            .delete("/api/meal/343453")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Meal does not exist.");
                res.status.should.equals(404);
                done();
            })
    })

    it("4 - Success", (done) => {
        chai
            .request(server)
            .delete("/api/meal/1")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Maaltijd met ID 1 is verwijderd");
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-401', () => {
    beforeEach(() => {
        pool.getConnection(function (connectionError, conn) {
            if (conn) {
                conn.query(
                    deleteQueries + insertQueries
                );
                pool.releaseConnection(conn);
            }
        });
        return;
    })

    it("1 - Not logged in", (done) => {
        chai
            .request(server)
            .post("/api/meal/1/participate")
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                res.body.message.should.be.a('string').eql("Include a bearer token in the authorization header. The format is 'Bearer {token}'.");
                res.status.should.equals(401);
                done();
            })
    })

    it("2 - Meal does not exist", (done) => {
        chai
            .request(server)
            .post("/api/meal/18686/participate")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                res.body.message.should.be.a('string').eql("Meal does not exist.");
                res.status.should.equals(404);
                done();
            })
    })

    it("3 - Success", (done) => {
        chai
            .request(server)
            .post("/api/meal/1/participate")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                res.body.message.should.be.a('string').eql("User met ID 1 is aangemeld voor maaltijd met ID 1");
                res.status.should.equals(200);
                done();
            })
    })

    // it("4 - Max participants reached", (done) => {
    //     chai
    //         .request(server)
    //         .post("/api/meal/1/participate")
    //         .set({ Authorization: `Bearer ` + token })
    //         .send({
    //             name: "Spaghetti",
    //             description: "A delicious meal from Italy.",
    //             price: "8.99",
    //             dateTime: "2023-07-05T18:00:00",
    //             maxAmountOfParticipants: 4,
    //             imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
    //         })
    //         .end((err, res) => {
    //             let { status, message, data } = res.body;
                // expect(status).to.exist;
                // expect(message).to.exist;
                // expect(data).to.exist;
                // res.body.should.be.an('object');
                // expect(data).to.not.be.empty;
    //             res.body.message.should.be.a('string').eql("User met ID 1 is niet aangemeld voor maaltijd met ID 1");
    //             res.status.should.equals(200);
    //             done();
    //         })
    // })
})

describe('UC-402', () => {
    beforeEach(() => {
        pool.getConnection(function (connectionError, conn) {
            if (conn) {
                conn.query(
                    deleteQueries + insertQueries
                );
                pool.releaseConnection(conn);
            }
        });
        return;
    })

    it("1 - Not logged in", (done) => {
        chai
            .request(server)
            .delete("/api/meal/1/participate")
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Include a bearer token in the authorization header. The format is 'Bearer {token}'.");
                res.status.should.equals(401);
                done();
            })
    })

    it("2 - Meal does not exist", (done) => {
        chai
            .request(server)
            .delete("/api/meal/34587/participate")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Meal does not exist");
                res.status.should.equals(404);
                done();
            })
    })

    it("3 - Participation does not exist", (done) => {
        chai
            .request(server)
            .delete("/api/meal/1/participate")
            .set({ Authorization: `Bearer ` + token })
            .send({
                name: "Spaghetti",
                description: "A delicious meal from Italy.",
                price: "8.99",
                dateTime: "2023-07-05T18:00:00",
                maxAmountOfParticipants: 4,
                imageUrl: "https://static01.nyt.com/images/2022/12/23/multimedia/afg-spaghetti-alla-assassina-1-19ef/afg-spaghetti-alla-assassina-1-19ef-mediumSquareAt3X.jpg"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Participation does not exist.");
                res.status.should.equals(404);
                done();
            })
    })
})