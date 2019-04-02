var express = require('express');
var router = express.Router();
require('dotenv').config();
const mysql = require('promise-mysql');


var redis = require('redis'),
  client = redis.createClient();





console.log('before func')

// /* GET home page. */
// router.get('/', function (req, res, next) {
//   client.keys('*', function (err, keys) {
//     err ? console.log(err) : null;

//     console.log('keys')
//     console.log(keys)



//     const promises = keys.map(key => new Promise((resolve, reject) => {
//       client.hgetall(key, (err, result) => {
//         err ? reject(err) : null;
//         resolve(result);
//       });
//     }));

//     Promise
//       .all(promises)
//       .then(arr => {
//         const response = {
//           statusCode: 200,
//           body: JSON.stringify(arr)
//         }
//         client.quit();
//         console.log(null, response);

//       }
//       )


//       .catch(err => console.log(err))
//   });

// });




/* GET home page. */
router.get('/', function (req, res, next) {
  client.smembers('affd:new', function (err, keys) {
    err ? console.log(err) : null;

    const promises = keys.map(key => new Promise((resolve, reject) => {
      client.hgetall(key, (err, result) => {
        err ? reject(err) : null;
        resolve(result);
      })
    })
    );
    Promise
      .all(promises)
      .then(arr => {
        const response = {
          statusCode: 200,
          body: JSON.stringify(arr)
        }
        client.quit();
        console.log(null, response);
        return arr
      })

      .then((arr) => {
        let conn = mysql.createConnection({
          host: process.env.HOST,
          user: process.env.USER,
          password: process.env.PASSWORD,
          database: process.env.DATABASE
        });

        conn.query(`INSERT INTO aff_data (type_name, status_name, tracking_token, date, affiliate_name) VALUES ('${arr[0].type_name}', '${arr[0].status_name}','${arr[0].tracking_token}','${arr[0].date}','${arr[0].affiliate_name}')`);
        return arr
      })
      .then(arr => {
        conn.end();
        const response = { statusCode: 200, body: JSON.stringify(['Data successfully stored']) };
        res.json(null, response);
      })
      .catch(err => console.log(err))



  });

});












module.exports = router;