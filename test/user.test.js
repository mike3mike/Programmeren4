const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const assert = require('assert');

chai.should();
chai.use(chaiHttp);

describe('UC-201', () => {
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
                res.status.should.equals(400);
                res.body.errMessage.should.equals("Wrong email address: undefined");
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
                emailAddress: "@mike@gmail.com",
                password: "Testtest123",
                phoneNumber: "0615601357"
            })
            .end((err, res) => {
                res.status.should.equals(400);
                res.body.errMessage.should.equals("Wrong email address: @mike@gmail.com");
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
                emailAddress: "mikeleijten1@gmail.com",
                password: "2Testtest123",
                phoneNumber: "0615601357"
            })
            .end((err, res) => {
                res.status.should.equals(400);
                res.body.errMessage.substring(0, 14).should.equals("Wrong password");
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
                emailAddress: "m.leijten37@student.avans.nl",
                password: "Testtest123",
                phoneNumber: "0615601357"
            })
            .end((err, res) => {
                res.status.should.equals(403);
                res.body.errMessage.substring(0,15).should.equals("Duplicate entry");
                done();
            })
    })

    // It may be needed to change the email address, because it already exists
    it("5 - Correct data", (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "Teststreet",
                city: "Breda",
                emailAddress: "mike34akklsjkgd3@example.com",
                password: "Testtest123",
                phoneNumber: "0612345678"
            })
            .end((err, res) => {
                res.status.should.equals(201);
                done();
            })
    })
})

describe('UC-202', () => {
    it("g1 - Send all user information", (done) => {
        chai
            .request(server)
            .get("/api/user")
            .end((err, res) => {
                res.status.should.equals(200);
                done();
            })
    })

    it("g2 - Send all user information with non-existing parameters", (done) => {
        chai
            .request(server)
            .get("/api/user?nonExisting=Mike&nonExisting2=Leijten")
            .end((err, res) => {
                res.status.should.equals(200);
                console.log(res.body.data, []);
                res.body.data.should.deep.equal([]);
                done();
            })
    })

    it("g3 - Send all user information with isActive (true) parameter", (done) => {
        chai
            .request(server)
            .get("/api/user?isActive=true")
            .end((err, res) => {
                res.status.should.equals(200);
                let isEqual = res.body.data.filter(i => i.isActive == 1).length == res.body.data.length;
                isEqual.should.equals(true);
                done();
            })
    })

    it("g4 - Send all user information with isActive (false) parameter", (done) => {
        chai
            .request(server)
            .get("/api/user?isActive=false")
            .end((err, res) => {
                res.status.should.equals(200);
                let isEqual = res.body.data.filter(i => i.isActive == 0).length == res.body.data.length;
                isEqual.should.equals(true);
                done();
            })
    })

    it("g5 - Send all user information using parameters", (done) => {
        chai
            .request(server)
            .get("/api/user?firstName=Mike&emailAddress=m.leijten37@student.avans.nl")
            .end((err, res) => {
                res.status.should.equals(200);
                res.body.data[0].firstName.should.equals("Mike");
                res.body.data[0].emailAddress.should.equals("m.leijten37@student.avans.nl");
                done();
            })
    })
})

describe('UC-203', () => {
    it("j1 - Invalid token", (done) => {
        chai
            .request(server)
            .get("/api/user/profile")
            .send({emailAddress: "m.leijten37@student.avans.nl", password: "Testtes123"})
            .end((err, res) => {
                res.status.should.equals(200);
                done();
            })
    })

    it("j2 - User does exist", (done) => {
        chai
            .request(server)
            .get("/api/user")
            .end((err, res) => {
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-204', () => {
    it("w2 - User does not exist", (done) => {
        chai
            .request(server)
            .get("/api/user/343254")
            .set('Authorization', "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIifQ.EI3fpdrc6wySmEOMf8XZVX5K5SFVKkjsdU4hTbL_bv4")
            .end((err, res) => {
                res.status.should.equals(404);
                res.body.errMessage.should.equals("User not found");
                done();
            })
    })

    it("w3 - User does exist", (done) => {
        chai
            .request(server)
            .get("/api/user/1")
            .set('Authorization', "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIifQ.EI3fpdrc6wySmEOMf8XZVX5K5SFVKkjsdU4hTbL_bv4")
            .end((err, res) => {
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-205', () => {
    it("b1 - No email address", (done) => {
        chai
            .request(server)
            .put("/api/user/237")
            .send({password: "Testtest123", street: "aNewStreet"})
            .end((err, res) => {
                res.status.should.equals(400);
                res.body.errMessage.should.equal("emailAddress is required");
                done();
            })
    })

    it("b2 - User is not the owner of the data", (done) => {
        chai
            .request(server)
            .put("/api/user/233")
            .send({emailAddress: "mike34akklsjkgd3@example.com", password: "Testtest123", street: "aNewStreet"})
            .end((err, res) => {
                res.status.should.equals(403);
                res.body.errMessage.should.equal("You need to be the owner.");
                done();
            })
    })

    it("b3 - Non valid phone number", (done) => {
        chai
            .request(server)
            .put("/api/user/237")
            .send({emailAddress: "mike34akklsjkgd3@example.com", password: "Testtest123", phoneNumber: "06765436887"})
            .end((err, res) => {
                res.status.should.equals(400);
                res.body.errMessage.should.equal("Wrong phonenumber");
                done();
            })
    })

    it("b4 - User does not exist", (done) => {
        chai
            .request(server)
            .put("/api/user/2386")
            .send({emailAddress: "mike34akklasdsjkgd3@example.com", password: "Testtest123", street: "aStreet"})
            .end((err, res) => {
                res.status.should.equals(404);
                res.body.errMessage.should.equal("User does not exist");
                done();
            })
    })

    it("b5 - Not logged in", (done) => {
        // Cannot be made, because:
        // - if authentication is not correct, another error message is shown
        // - if it is correct, the user is automatically logged in
        done()
    })

    it("b6 - Correct", (done) => {
        chai
            .request(server)
            .put("/api/user/237")
            // Other than emailAddress and password, you can add data that you would like to change
            .send({emailAddress: "mike34akklsjkgd3@example.com", password: "Testtest123", street: "aNewStreet"})
            .end((err, res) => {
                res.status.should.equals(200);
                done();
            })
    })
})

describe('UC-206', () => {
    it("c1 - User does not exist", (done) => {
        chai
            .request(server)
            .delete("/api/user/2399")
            .send({emailAddress: "mike34akklssdfjkgd3@example.com", password: "Testtest123", street: "aNewStreet"})
            .end((err, res) => {
                res.status.should.equals(404);
                res.body.errMessage.should.equal("User does not exist");
                done();
            })
    })

    it("c2 - User is not logged in", (done) => {
        // Cannot be made, because:
        // - if authentication is not correct, another error message is shown
        // - if it is correct, the user is automatically logged in
        done();
    })

    it("c3 - User is not the owner of the data", (done) => {
        chai
        .request(server)
        .delete("/api/user/2399")
        .send({emailAddress: "m.leijten37@student.avans.nl", password: "Testtest123", street: "aNewStreet"})
        .end((err, res) => {
            res.status.should.equals(403);
            res.body.errMessage.should.equal("You need to be the owner.");
            done();
        })
    })

    it("c4 - Correct", (done) => {
        chai
        .request(server)
        .delete("/api/user/233")
        .send({emailAddress: "mike34asjkgd3@example.com", password: "Testtest123", street: "aNewStreet"})
        .end((err, res) => {
            res.status.should.equals(200);
            done();
        })
    })
})