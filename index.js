const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const fileUpload = require("express-fileupload");
var mysql = require("mysql");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

const port = 5000;

var dBConnect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "e_commerce",
});

dBConnect.connect();


app.get("/productShow", (req, res) => {
    dBConnect.query("select * from product", function (err, result) {
        res.send({ result });
    });
});

app.get("/productCategory/:id", (req, res) => {
    const id = req.params.id
    dBConnect.query(`select * from product where tag=${id}`, function (err, result) {
        res.send({ result });
    });
});

app.post("/addCart", (req, res) => {
    const cartValue = req.body.cart;
    const userid = req.body.userid
    const amount = req.body.amount

    console.log(req.body)
    var addIndex = 0
    dBConnect.query(
        "insert into ordertable (userid , amount) values(?,?)",
        [userid, parseInt(amount)],
        function (err, resultValue) {
            if(err){
                console.log(err)
            }
            console.log("resultValue", resultValue.insertId)

            cartValue.length > 0 && cartValue.map((value, index) => {

                dBConnect.query(
                    "insert into orderitem (userid , productid , orderid) values(?,?,?)",
                    [userid, parseInt(value.id), resultValue.insertId],
                    function (err, result) {
                        if (err) {
                            console.log(err)
                        }
                        ++addIndex


                        if (addIndex == index + 1) {
                            res.send({ result: "success" });
                        }
                    }
                );
            }
            );

        })

});


app.post("/checkout", (req, res) => {

    console.log("working")
    const cartValue = req.body;
   console.log("req.body:",cartValue)

   
    var addIndex = 0
    dBConnect.query(
        `insert into orders (user_id ,fname,lname,phone,delivary_date,address,payment_method,total_amount) values(null,'${req.body.fname}','${req.body.lname}','${req.body.phone}','${req.body.delivery_date}','${req.body.address}','${req.body.payment_method}','${req.body.total_amount}')`,
        
        function (err, resultValue) {
            if(err){
                console.log(err)
            }
            console.log("resultValue", resultValue.insertId)

            cartValue.length > 0 && cartValue.map((value, index) => {

                dBConnect.query(
                    `insert into ordered_products (product_id,product_name,product_price,product_quantity,order_id,tag_id) values(${value.id},'${value.name}',${value.price},${value.quantity},${resultValue.insertId},${value.tag})`,
                    // [userid, parseInt(value.id), resultValue.insertId],
                    function (err, result) {
                        if (err) {
                            console.log(err)
                        }
                        ++addIndex


                        if (addIndex == index + 1) {
                            res.send({ result: "success" });
                        }
                    }
                );
            }
            );

        })

});




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});