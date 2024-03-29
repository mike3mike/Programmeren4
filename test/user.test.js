const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const assert = require('assert');
const pool = require('../Database');
const expect = chai.expect;

chai.should();
chai.use(chaiHttp);

deleteUserQuery = "DELETE FROM `user`;";
deleteMealQuery = "DELETE FROM `meal`;";
deleteQueries = deleteMealQuery + deleteUserQuery;
insertUserQuery = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city`) VALUES(1, 'Mike', 'Leijten', 1, 'm.leijten@gmail.com', 'Testtest123', '0623456789', 'editor,guest', 'newStreet', 'newCity'),(2, 'Joe', 'Doe', 1, 'joedoe@gmail.com', 'Testtest1234', '0612345678', 'admin', 'aStreet', 'aCity'),(3, 'Jane', 'Smith', 1, 'janesmith@email.com', 'Testtest123', '0687654321', 'admin', 'someStreet', 'someCity');";
insertMealQuery = "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `createDate`, `updateDate`, `name`, `description`, `allergenes`) VALUES(1, 1, 0, 0, 1, '2022-03-22 17:35:00', 4, '12.75', 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 1, '2022-02-26 18:12:40.048998', '2022-04-26 12:33:51.000000', 'Pasta Bolognese met tomaat, spekjes en kaas', 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', 'gluten,lactose'),(2, 1, 1, 0, 0, '2022-05-22 13:35:00', 4, '12.75', 'https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg', 1, '2022-02-26 18:12:40.048998', '2023-05-11 17:06:57.465049', 'Aubergine uit de oven met feta, muntrijst en tomatensaus', 'Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.', 'noten'),(3, 1, 0, 0, 1, '2022-05-22 17:30:00', 4, '10.75', 'https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg', 1, '2022-02-26 18:12:40.048998', '2023-05-11 17:06:57.465049', 'Spaghetti met tapenadekip uit de oven en frisse salade', 'Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.', 'gluten,lactose'),(4, 1, 0, 0, 0, '2022-03-26 21:22:26', 4, '4.00', 'https://static.ah.nl/static/recepten/img_063387_890x594_JPG.jpg', 1, '2022-03-06 21:23:45.419085', '2023-05-11 17:06:57.465049', 'Zuurkool met spekjes', 'Heerlijke zuurkoolschotel, dé winterkost bij uitstek. ', ''),(5, 1, 1, 0, 1, '2022-03-26 21:24:46', 6, '6.75', 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg', 1, '2022-03-06 21:26:33.048938', '2023-05-11 17:06:57.465049', 'Groentenschotel uit de oven', 'Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.', '');";
insertQueries = insertUserQuery + insertMealQuery;

describe('UC-101', () => {
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
            .post("/api/login")
            .send({
                emailAdress: "janesmith@email.com"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(400);
                res.body.message.should.be.a('string').eql("Password is required");
                done();
            })
    })

    it("2 - Wrong password", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({
                emailAdress: "janesmith@email.com",
                password: "Testtugest111"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.be.a('string').eql("Passwords do not match");
                res.status.should.equals(400);
                done();
            })

    })

    it("3 - User does not exist", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({
                emailAdress: "doesnot@exist.nl",
                password: "Testtest123"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(404);
                res.body.message.should.be.a('string').eql("User does not exist");
                done();
            })

    })

    it("4 - Success", (done) => {
        chai
            .request(server)
            .post("/api/login")
            .send({
                emailAdress: "janesmith@email.com",
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
                data.should.be.an('object');
                data.should.have.property('firstName');
                data.should.have.property('lastName');
                data.should.have.property('isActive');
                data.should.have.property('emailAdress');
                data.should.have.property('phoneNumber');
                data.should.have.property('roles');
                data.should.have.property('street');
                data.should.have.property('city');
                data.should.have.property('token');
                token = res.body.data.token;
                done();
            })
    })
})

describe('UC-201', () => {
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
            .post("/api/user")
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
                res.status.should.equals(400);
                res.body.message.should.be.a('string').eql("Not every required attribute is present");
                done();
            })
    })

    it("2 - Wrong email address", (done) => {
        chai
            .request(server)
            .post("/api/user")
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
                res.status.should.equals(400);
                res.body.message.should.be.a('string').eql("Wrong email address: @mike@gmail.com");
                done();
            })
    })

    it("3 - Wrong password", (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "De Dorsvlegel",
                city: "Tilburg",
                emailAdress: "m.leijtenn@gmail.com",
                password: "pass",
                phoneNumber: "0615601357"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(400);
                res.body.message.substring(0, 14).should.equals("Wrong password");
                done();
            })
    })

    it("4 - User already exists", (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "De Dorsvlegel",
                city: "Tilburg",
                emailAdress: "m.leijten@gmail.com",
                password: "Testtest123",
                phoneNumber: "0615601357",
                roles: "admin"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(403);
                res.body.message.substring(0,15).should.equals("Duplicate entry");
                done();
            })
    })

    it("5 - Correct data", (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "Teststreet",
                city: "Breda",
                emailAdress: "m.test@example.com",
                password: "Testtest123",
                phoneNumber: "0612345678",
                roles: "admin"
            })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                res.status.should.equals(201);
                res.body.message.should.be.a('string').eql("Register user");
                done();
            })
    })
})

describe('UC-202', () => {
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

    it("g1 - Send all user information", (done) => {
        chai
            .request(server)
            .get("/api/user")
            .set({ Authorization: `Bearer ` + token })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                res.status.should.equals(200);
                done();
            })
    })

    it("g2 - Send all user information with non-existing parameters", (done) => {
        chai
            .request(server)
            .get("/api/user?nonExisting=Mike&nonExisting2=Leijten")
            .set({ Authorization: `Bearer ` + token })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(200);
                res.body.data.should.deep.equal({});
                done();
            })
    })

    it("g3 - Send all user information with isActive=true parameter", (done) => {
        chai
            .request(server)
            .get("/api/user?isActive=true")
            .set({ Authorization: `Bearer ` + token })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                res.status.should.equals(200);
                let isEqual = res.body.data.filter(i => i.isActive == 1).length == res.body.data.length;
                isEqual.should.equals(true);
                done();
            })
    })

    it("g4 - Send all user information with isActive=false parameter", (done) => {
        chai
            .request(server)
            .get("/api/user?isActive=false")
            .set({ Authorization: `Bearer ` + token })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(200);
                let isEqual = res.body.data.filter(i => i.isActive == 0).length == res.body.data.length;
                isEqual.should.equals(true);
                done();
            })
    })

    it("g5 - Send all user information using parameters", (done) => {
        chai
            .request(server)
            .get("/api/user?firstName=Mike&emailAdress=m.leijten@gmail.com")
            .set({ Authorization: `Bearer ` + token })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                res.status.should.equals(200);
                res.body.data[0].firstName.should.equals("Mike");
                res.body.data[0].emailAdress.should.equals("m.leijten@gmail.com");
                done();
            })
    })
})

describe('UC-203', () => {
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

    it("j1 - Invalid token", (done) => {
        chai
            .request(server)
            .get("/api/user/profile")
            .set({ Authorization: `Bearer 12345` })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(401);
                done();
            })
    })

    it("j2 - User does exist", (done) => {
        chai
            .request(server)
            .get("/api/user/profile")
            .set({ Authorization: `Bearer ` + token })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                data.should.be.a('object');
                data.should.have.property('id');
                data.should.have.property('firstName');
                data.should.have.property('lastName');
                data.should.have.property('isActive');
                data.should.have.property('emailAdress');
                data.should.have.property('phoneNumber');
                data.should.have.property('roles');
                data.should.have.property('street');
                data.should.have.property('city');
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-204', () => {
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

    it("w2 - User does not exist", (done) => {
        chai
            .request(server)
            .get("/api/user/343254")
            .set({ Authorization: `Bearer ` + token })
            .send({emailAdress: "u.leijten@gmail.com", password: "newPassword", street: "aNewStreet"})
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(404);
                res.body.message.should.be.a('string').eql("User does not exist");
                done();
            })
    })

    it("w3 - User does exist", (done) => {
        chai
            .request(server)
            .get("/api/user/3")
            .set({ Authorization: `Bearer ` + token })
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                data.should.have.property('firstName');
                data.should.have.property('lastName');
                data.should.have.property('emailAdress');
                data.should.have.property('phoneNumber');
                data.should.have.property('roles');
                data.should.have.property('street');
                data.should.have.property('city');
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-205', () => {
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

    it("b1 - No email address", (done) => {
        chai
            .request(server)
            .put("/api/user/3")
            .set({ Authorization: `Bearer ` + token })
            .send({password: "Testtest123", street: "aNewStreet"})
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.equal("EmailAdress is required");
                res.status.should.equals(400);
                done();
            })
    })

    it("b2 - User is not the owner of the data", (done) => {
        chai
            .request(server)
            .put("/api/user/3")
            .set({ Authorization: `Bearer ` + token })
            .send({emailAdress: "m.leijten@gmail.com", password: "Testtest123", street: "aNewStreet"})
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.equal("You need to be the owner.");
                res.status.should.equals(403);
                done();
            })
    })

    it("b3 - Non valid phone number", (done) => {
        chai
            .request(server)
            .put("/api/user/3")
            .set({ Authorization: `Bearer ` + token })
            .send({emailAdress: "m.leijten@gmail.com", password: "Testtest123", phoneNumber: "06765436887"})
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.equal("Wrong phonenumber");
                res.status.should.equals(400);
                done();
            })
    })

    it("b4 - User does not exist", (done) => {
        chai
            .request(server)
            .put("/api/user/2386")
            .set({ Authorization: `Bearer ` + token })
            .send({emailAdress: "m.leijteno@example.com", password: "Testtest123", street: "aStreet"})
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.equal("User does not exist");
                res.status.should.equals(404);
                done();
            })
    })

    it("b5 - Not logged in", (done) => {
        chai
        .request(server)
        .put("/api/user/2386")
        .send({emailAdress: "mikeleijten1@gmail.com", password: "Testtest123", street: "aStreet"})
        .end((err, res) => {
            let { status, message, data } = res.body;
            expect(status).to.exist;
            expect(message).to.exist;
            expect(data).to.exist;
            res.body.should.be.an('object');
            Object.keys(data).length.should.be.equal(0);
            res.body.message.should.equal("Include a bearer token in the authorization header. The format is 'Bearer {token}'.");
            res.status.should.equals(401);
            done()
        })
    })

    it("b6 - Correct", (done) => {
        chai
            .request(server)
            .put("/api/user/3")
            .set({ Authorization: `Bearer ` + token })
            // Other than emailAdress and password, you can add data that you would like to change
            .send({emailAdress: "janesmith@email.com", password: "Testtest123", street: "aNewStreet"})
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                expect(data).to.not.be.empty;
                res.body.message.should.equal("Update User");
                data.should.have.property('id');
                data.should.have.property('firstName');
                data.should.have.property('lastName');
                data.should.have.property('isActive');
                data.should.have.property('emailAdress');
                data.should.have.property('phoneNumber');
                data.should.have.property('roles');
                data.should.have.property('street');
                data.should.have.property('city');
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-206', () => {
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

    it("c1 - User does not exist", (done) => {
        chai
            .request(server)
            .delete("/api/user/2399")
            .set({ Authorization: `Bearer ` + token })
            .send({emailAdress: "mike34akklssdfjkgd3@example.com", password: "newPassword", street: "aNewStreet"})
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.status.should.equals(404);
                res.body.message.should.equal("User does not exist");
                done();
            })
    })

    it("c2 - User is not logged in", (done) => {
        chai
            .request(server)
            .delete("/api/user/2399")
            .send({emailAdress: "mike34akklssdfjkgd3@example.com", password: "newPassword", street: "aNewStreet"})
            .end((err, res) => {
                let { status, message, data } = res.body;
                expect(status).to.exist;
                expect(message).to.exist;
                expect(data).to.exist;
                res.body.should.be.an('object');
                Object.keys(data).length.should.be.equal(0);
                res.body.message.should.equal("Include a bearer token in the authorization header. The format is 'Bearer {token}'.");
                res.status.should.equals(401);
                done()
            })
    })

    it("c3 - User is not the owner of the data", (done) => {
        chai
        .request(server)
        .delete("/api/user/2")
        .set({ Authorization: `Bearer ` + token })
        .send({emailAdress: "m.leijten3@student.avans.nl", password: "Testtest123", street: "aNewStreet"})
        .end((err, res) => {
            let { status, message, data } = res.body;
            expect(status).to.exist;
            expect(message).to.exist;
            expect(data).to.exist;
            res.body.should.be.an('object');
            Object.keys(data).length.should.be.equal(0);
            res.body.message.should.equal("You need to be the owner.");
            res.status.should.equals(403);
            done();
        })
    })

    it("c4 - Correct", (done) => {
        chai
        .request(server)
        .delete("/api/user/3")
        .set({ Authorization: `Bearer ` + token })
        .send({emailAdress: "janesmith@email.com", password: "Testtest123", street: "aNewStreet"})
        .end((err, res) => {
            let { status, message, data } = res.body;
            expect(status).to.exist;
            expect(message).to.exist;
            expect(data).to.exist;
            res.body.should.be.an('object');
            Object.keys(data).length.should.be.equal(0);
            res.status.should.equals(200);
            done();
        })
    })
})