const express = require("express");
const app = express();
const parse = require('body-parser');
const cors = require('cors');
const session = require("express-session");
const mysql = require("mysql2");
const connection = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: '',
    database: 'data'

})

app.use(session({secret: 'key', resave: false, saveUninitialized: true}));
app.use(cors());
app.use(express.static(__dirname));
app.use(parse.urlencoded({extended: true}));
app.use(express.json());



app.post('/authentication', (req, res) => {
    if (req.body.action == "signup") {
        res.sendFile(__dirname + "/frontend/signup.html");
    }

    if (req.body.action == "login") {
        res.sendFile(__dirname + "/frontend/login.html");
    }

    if (req.body.action == "administration") {
        res.sendFile(__dirname + "/frontend/admin.html");
    }
});




app.post('/log', (req, res) => {
    username = req.body.username;
    password = req.body.password;
    checker = "SELECT * FROM credentials WHERE username = ? and password = ?";
    connection.query(checker, [username, password], (err, results) => {
        if (results.length > 0) {
            req.session.username = username;
            res.sendFile(__dirname+"/frontend/log.html");
        } else {
            res.sendFile(__dirname + "/frontend/incorrect.html");
        }
    });
});




app.post('/newuser', (req, res) => {
    username = req.body.username;
    password = req.body.password;
    insert = "Insert into credentials (username, password) values (?, ?)";
    checker = "SELECT * FROM credentials WHERE username = ?";
    connection.query(checker, [username], (err, results) => {
        if (results.length > 0) {
            res.sendFile(__dirname + "/frontend/exists.html");
        } else {
            connection.query(insert, [username, password]);
            res.sendFile(__dirname + "/frontend/success.html");
        }
    });
});




app.get('/getusername', (req, res)=>{
    res.json({ username: req.session.username });
});




app.post('/showprev', (req, res) => {
    const currentDate = new Date();
    const options = {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true};
    const formattedDate = currentDate.toLocaleString('en-US', options);
    const info = req.body.information + ": added on " + formattedDate;
    sqlcommand = "UPDATE credentials SET information = CONCAT(COALESCE(information, ''), ?) WHERE username = ?";
    connection.query(sqlcommand, [info + " * ", req.session.username], (err, results) => {
        req.session.last_log = info;
        res.sendFile(__dirname + "/frontend/prevlog.html");
    });
});


app.get('/getprev', (req, res) =>{

    const information = req.session.last_log;
    res.json({ info: information });

})

app.post('/admin', (req, res) => {
    username = req.body.username;
    password = req.body.password;
    if ((username == "Syed Faruque") && (password == "batman")) {
        res.sendFile(__dirname + "/frontend/adminpage.html");
    } else {
        res.sendFile(__dirname + "/frontend/incorrect.html");
    }
});


app.post('/showlogs', (req, res) =>{

    user = req.body.user;
    const checker = "SELECT * FROM credentials WHERE username = ?";
    connection.query(checker, [user], (err, results)=>{
        if (results.length > 0){
            req.session.desireduser = user;
            res.sendFile(__dirname + "/frontend/showdesiredlogs.html");
        }
        else{
            res.sendFile(__dirname + "/frontend/noexist.html");
        }
    })


})


app.get('/getusers', (req, res) => {

    const getUsersQuery = "SELECT username FROM credentials";
    connection.query(getUsersQuery, (err, results) => {
        const usernames = results.map(result => result.username);
        res.json({ usernames: usernames });
    });

})


app.get('/getlogs', (req, res) =>{

    const getInfoQuery = "SELECT information FROM credentials WHERE username = ?";
    connection.query(getInfoQuery, [req.session.desireduser], (err, results) => {
        const information = results[0].information;
    
        if (information && information.includes(' * ')) {
            const infoList = information.split(' * ');
            res.json({ info: infoList });
        } else {
            console.log("no data");
        }
    });

})



app.listen(3000);