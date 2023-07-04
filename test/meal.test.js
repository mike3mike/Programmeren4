const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const assert = require('assert');
const pool = require('../Database');

chai.should();
chai.use(chaiHttp);

deleteUserQuery = "DELETE FROM `user`;";
deleteMealQuery = "DELETE FROM `meal`;";
deleteQueries = deleteMealQuery + deleteUserQuery;
insertUserQuery = "INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city`) VALUES(1, 'Mike', 'Leijten', 1, 'mikeleijten1@gmail.com', 'newPassword', '0623456789', 'editor,guest', 'newStreet', 'newCity'),(2, 'Joe', 'Doe', 1, 'joedoe@gmail.com', 'somePassword', '0612345678', 'admin', 'aStreet', 'aCity'),(3, 'Jane', 'Smith', 1, 'janesmith@email.com', 'aPassword', '0687654321', 'admin', 'someStreet', 'someCity');";
insertMealQuery = "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `createDate`, `updateDate`, `name`, `description`, `allergenes`) VALUES(1, 1, 0, 0, 1, '2022-03-22 17:35:00', 4, '12.75', 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg', 1, '2022-02-26 18:12:40.048998', '2022-04-26 12:33:51.000000', 'Pasta Bolognese met tomaat, spekjes en kaas', 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', 'gluten,lactose'),(2, 1, 1, 0, 0, '2022-05-22 13:35:00', 4, '12.75', 'https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg', 1, '2022-02-26 18:12:40.048998', '2023-05-11 17:06:57.465049', 'Aubergine uit de oven met feta, muntrijst en tomatensaus', 'Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.', 'noten'),(3, 1, 0, 0, 1, '2022-05-22 17:30:00', 4, '10.75', 'https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg', 1, '2022-02-26 18:12:40.048998', '2023-05-11 17:06:57.465049', 'Spaghetti met tapenadekip uit de oven en frisse salade', 'Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.', 'gluten,lactose'),(4, 1, 0, 0, 0, '2022-03-26 21:22:26', 4, '4.00', 'https://static.ah.nl/static/recepten/img_063387_890x594_JPG.jpg', 1, '2022-03-06 21:23:45.419085', '2023-05-11 17:06:57.465049', 'Zuurkool met spekjes', 'Heerlijke zuurkoolschotel, dé winterkost bij uitstek. ', ''),(5, 1, 1, 0, 1, '2022-03-26 21:24:46', 6, '6.75', 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg', 1, '2022-03-06 21:26:33.048938', '2023-05-11 17:06:57.465049', 'Groentenschotel uit de oven', 'Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.', '');";
insertQueries = insertUserQuery + insertMealQuery;

// describe('UC-201', () => {
//     beforeEach(() => {
//         pool.getConnection(function (connectionError, conn) {
//             if (conn) {
//                 conn.query(
//                     deleteQueries + insertQueries
//                 );
//                 pool.releaseConnection(conn);
//             }
//         });
//         return;
//     })
    
//     it("1 - Required field is missing", (done) => {
//         chai
//             .request(server)
//             .post("/api/login")
//             .send({
//                 firstName: "Mike",
//                 lastName: "Leijten",
//                 street: "De Dorsvlegel",
//                 city: "Tilburg",
//                 password: "Testtest123",
//                 phoneNumber: "0615601357"
//             })
//             .end((err, res) => {
//                 res.status.should.equals(400);
//                 res.body.message.should.equals("Not every required attribute is present");
//             })
//             done();
//     })

//     it("2 - Wrong email address", (done) => {
//         chai
//             .request(server)
//             .post("/api/info")
//             .send({
//                 firstName: "Mike",
//                 lastName: "Leijten",
//                 street: "De Dorsvlegel",
//                 city: "Tilburg",
//                 emailAdress: "@mike@gmail.com",
//                 password: "Testtest123",
//                 phoneNumber: "0615601357"
//             })
//             .end((err, res) => {
//                 res.status.should.equals(400);
//                 res.body.message.should.equals("Wrong email address: @mike@gmail.com");
//             })
//             done();

//     })
// })