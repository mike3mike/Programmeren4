class Meal {
    constructor({id, name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cook, participants}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.isVega = isVega;
        this.isVegan = isVegan;
        this.isToTakeHome = isToTakeHome;
        this.dateTime = dateTime;
        this.maxAmountOfParticipants = maxAmountOfParticipants;
        this.price = price;
        this.imageUrl = imageUrl;
        this.allergenes = allergenes;
        this.cook = cook;
        this.participants = participants;
    }
}

module.exports = Meal;