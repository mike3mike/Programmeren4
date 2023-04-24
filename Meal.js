class Meal {
    constructor(name, description, price, dateTime, maxAmountOfParticipants, imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.dateTime = dateTime;
        this.maxAmountOfParticipants = maxAmountOfParticipants;
        this.imageUrl = imageUrl;
    }
}

module.exports = Meal;