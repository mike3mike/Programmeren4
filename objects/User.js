class User {
    // id;
    // isActive;

    constructor({ id, firstName, lastName, street, city, isActive, emailAdress, password, passwordHash, passwordSalt, phoneNumber, token, roles }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.city = city;
        if (isActive == 0) {
            this.isActive = 0;
        } else if (isActive == 1) {
            this.isActive = 1;
        } else {
            this.isActive = isActive;
        }
        this.roles = roles;
        if (password) { 
            this.setPassword(password); 
        } 
        // else if (passwordHash && passwordSalt) {
        //     this.password = [passwordHash, passwordSalt].join(".");
        // }
        if (emailAdress) this.setEmailAdress(emailAdress);
        if (phoneNumber) this.setPhoneNumber(phoneNumber);
        this.token = this.token;
    }

    setEmailAdress(emailAdress) {
        if (this.checkEmailAdress(emailAdress) == true) { 
            this.emailAdress =  emailAdress;
        }
    }

    checkEmailAdress(emailAdress) {
        let match = String(emailAdress)
        .toLowerCase()
        .match(
            /^[a-zA-Z]{1}.[a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/
        );
        // let match = String(emailAdress)
        // .toLowerCase()
        // .match(
        //     /^[a-z]{1,}@[a-z]{2,}\.[a-z]{2,3}$/gm
        // );
        // The database checks if the emailAdress already exists
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
        phoneNumber = phoneNumber.replace(' ', '').replace('-', '');
        let match = String(phoneNumber)
        .toLowerCase()
        .match(
            /^06[0-9]{8}$/
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
        // let crypto = require('crypto');
        // let salt = crypto.randomBytes(128).toString('base64');
        // let hash = crypto.createHash('md5').update(password + salt).digest('hex');
        // this.password = [hash, salt].join(".");
        this.password = password;
    }

    checkPassword(password) {
        let match = String(password)
        .match(
            /^(?=.*\d)(?=.*[A-Z]).{8,}$/
        );
        if (match == null) { 
            let error = new Error("Wrong password: " + password);
            error.status = 400
            throw error;
        }
        return true;
    }

    comparePassword(passwordAttempt) {
        if (passwordAttempt == this.password) {
            require('dotenv').config();
            let secret = process.env.JWT_SECRET || "ajwtsecret";
            var jwt = require('jsonwebtoken');
            var token = jwt.sign({ userId: this.id }, secret);
            return token;
        }
        // let crypto = require('crypto');
        // if (crypto.createHash('md5').update(passwordAttempt + this.getPasswordSalt()).digest('hex') == this.getPasswordHash()) {
        //     require('dotenv').config();
        //     let secret = process.env.JWT_SECRET;
        //     var jwt = require('jsonwebtoken');
        //     var token = jwt.sign({ userId: this.id }, secret);
        //     return token;
        // };
        throw new Error("Wrong password");
    }

    // getPasswordHash() {
    //     return this.password.split('.')[0];
    // }

    // getPasswordSalt() {
    //     return this.password.split('.')[1];
    // }

    setJWTtoken(passwordAttempt) {
        let jwtToken = this.comparePassword(passwordAttempt);
        if (jwtToken) {
            this.token = jwtToken;
        }
    }
}

module.exports = User;