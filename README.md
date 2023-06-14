## Name
Share A Meal API

## Description
This API can perform CRUD operations for user and meal data.
The application can be tested by sending requests to https://fresh-haircut-production.up.railway.app/api/{path}
The data is saved in an online database. Others that use this URL therefore use the same data.

## Installation
Run 'npm i' in the commandline in the project directory.
For running and testing, install Node.js, Express.js, MySQL, Mocha and Chai.
Create a database, and execute the included .SQL script. 
Create a .env file and fill with the following attributes of your database:
DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT

## Usage
Run the application by executing 'npm run dev' in the command line.

Example:
A POST request to localhost:3000/api/user
With the data body filled in:
{
    "emailAdress":,
    "firstName":,
    "lastName":,
    "street":,
    "city":,
    "password":,
    "phoneNumber":
}
