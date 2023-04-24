const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const assert = require('assert');

chai.should();
chai.use(chaiHttp);

describe('UC-201', () => {
    it("Correct data", (done) => {
        chai
            .request(server)
            .post("/api/register")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "Teststreet",
                city: "Breda",
                emailAddress: "mike@example.com",
                password: "Testtest123",
                phoneNumber: "0612345678"
            })
            .end((err, res) => {
                res.status.should.equals(200);
                done();
            })

    })

    it("Wrong email", (done) => {
        chai
            .request(server)
            .post("/api/register")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "De Dorsvlegel",
                city: "Tilburg",
                emailAddress: "mikeleijten1gmail.com",
                password: "Testtest123",
                phoneNumber: "0615601357"
            })
            .end((err, res) => {
                res.status.should.equals(422);
                res.body.error.should.equals("Wrong email address");
                done();
            })

    })

    it("Wrong phone number", (done) => {
        chai
            .request(server)
            .post("/api/register")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "De Dorsvlegel",
                city: "Tilburg",
                emailAddress: "mikeleijten1@gmail.com",
                password: "Testtest123",
                phoneNumber: "061560357"
            })
            .end((err, res) => {
                res.status.should.equals(422);
                res.body.error.should.equals("Wrong phonenumber");
                done();
            })

    })

    it("Wrong phone number", (done) => {
        chai
            .request(server)
            .post("/api/register")
            .send({
                firstName: "Mike",
                lastName: "Leijten",
                street: "De Dorsvlegel",
                city: "Tilburg",
                emailAddress: "mikeleijten1@gmail.com",
                password: "8Testtest123",
                phoneNumber: "0615601357"
            })
            .end((err, res) => {
                res.status.should.equals(422);
                res.body.error.should.equals("Wrong password");
                done();
            })

    })
})