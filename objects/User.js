class User {
    // id;
    // isActive;

    constructor({ id, firstName, lastName, street, city, isActive, emailAdress, password, passwordHash, passwordSalt, phoneNumber }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.city = city;
        this.isActive = isActive;
        if (password) { 
            this.setPassword(password); 
        } else if (passwordHash && passwordSalt) {
            this.passwordHash = passwordHash;
            this.passwordSalt = passwordSalt;
        }
        if (emailAdress) this.setemailAdress(emailAdress);
        if (phoneNumber) this.setPhoneNumber(phoneNumber);
    }

    setemailAdress(emailAdress) {
        if (this.checkemailAdress(emailAdress) == true) { 
            this.emailAdress =  emailAdress;
        }
    }

    checkemailAdress(emailAdress) {
        let match = String(emailAdress)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
        // The database checks if the emailAdress already exists
        // if (match == null) { throw new Error("Wrong email address: " + emailAdress); }
        if (match == null) { 
            let error = new Error("Wrong email address: " + emailAdress);
            error.status = 400
            throw error;
        }
        return true;
    }
    
    setPhoneNumber (phoneNumber) {
        if (this.checkPhoneNumber(phoneNumber) == true) { this.phoneNumber =  phoneNumber; }
    }
    
    checkPhoneNumber(phoneNumber) {
        let match = String(phoneNumber)
        .toLowerCase()
        .match(
            /^[0-9]{10}$/
        );
        if (match == null) { 
            let error = new Error("Wrong phonenumber");
            error.status = 400
            throw error;
        }
        return true;
    }

    setPassword(password) {
        if (this.checkPassword(password) != true) { return null }
        let crypto = require('crypto');
        let salt = crypto.randomBytes(128).toString('base64');
        let hash = crypto.createHash('md5').update(password + salt).digest('hex');
        this.passwordSalt = salt;
        this.passwordHash = hash;
    }

    checkPassword(password) {
        let match = String(password)
        .toLowerCase()
        .match(
            /^[a-z,A-Z].*/
        );
        if (match == null) { 
            let error = new Error("Wrong password: " + password);
            error.status = 400
            throw error;
        }
        return true;
    }

    comparePassword(passwordAttempt) {
        let crypto = require('crypto');
        if (crypto.createHash('md5').update(passwordAttempt + this.passwordSalt).digest('hex') == this.passwordHash) {
            require('dotenv').config();
            let secret = process.env.JWT_SECRET;
            var jwt = require('jsonwebtoken');
            var token = jwt.sign({ userId: this.id }, secret);
            return token;
        };
        throw new Error("Wrong password");
    }

    setJWTtoken(passwordAttempt) {
        let jwtToken = this.comparePassword(passwordAttempt);
        if (jwtToken) {
            this.jwtToken = jwtToken;
        }
    }
}

module.exports = User;