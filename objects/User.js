class User {
    constructor({id, firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber}) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.city = city;
        this.isActive = isActive;
        this.setEmailAddress(emailAddress);
        this.setPassword(password);
        this.setPhoneNumber(phoneNumber);
    }

    setEmailAddress(emailAddress) {
        if (this.checkEmailAddress(emailAddress) == true) { 
            this.emailAddress =  emailAddress;
        }
    }

    checkEmailAddress(emailAddress) {
        let match = String(emailAddress)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
        // The database checks if the emailAddress already exists
        if (match == null) { throw new Error("Wrong email address: " + emailAddress); }
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
        this.password = [hash, salt];
    }

    checkPassword(password) {
        let match = String(password)
        .toLowerCase()
        .match(
            /^[a-z,A-Z].*/
        );
        if (match == null) { throw new Error("Wrong password"); }
        return true;
    }

    comparePassword(passwordAttempt) {
        let crypto = require('crypto');
        return crypto.createHash('md5').update(passwordAttempt + this.password[1]).digest('hex') == this.password[0];
    }
}

module.exports = User;