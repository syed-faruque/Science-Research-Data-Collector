
//framework imports
const express = require("express");
const parse = require('body-parser');
const cors = require('cors');
const session = require("express-session");
const mysql = require("mysql2");




// connection to the database
const connection = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: '',
    database: 'data'

})



//instance of express application
const app = express();



//middleware
app.use(session({secret: 'key', resave: false, saveUninitialized: true}));
app.use(cors());
app.use(express.static(__dirname + "/frontend"));
app.use(parse.urlencoded({extended: true}));
app.use(express.json());






//handles initial homepage choice
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






//checks the credentials entered during login phase
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





//inserts sign up credentials into database
app.post('/newuser', (req, res) => {
    username = req.body.username;
    password = req.body.password;
    connection.query("SELECT * FROM credentials WHERE username = ?", [username], (err, results) => {
        if (results.length > 0) {
            res.sendFile(__dirname + "/frontend/exists.html");
        } 
        else if (password.length > 8){
            connection.query("Insert into credentials (username, password) values (?, ?)", [username, password]);
            res.sendFile(__dirname + "/frontend/success.html");
        }
        else{
            res.sendFile(__dirname + "/frontend/toosmall.html");
        }
    });
});




// sends back username from session store for the client side
app.get('/getusername', (req, res)=>{
    res.json({ username: req.session.username });
});






// appends logged data to the information database column
app.post('/showprev', (req, res) => {

    const currentDate = new Date();
    const options = {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true};
    const formattedDate = currentDate.toLocaleString('en-US', options);
    const info = req.body.information + "\n\nadded on " + formattedDate;
    sqlcommand = "UPDATE credentials SET information = CONCAT(COALESCE(information, ''), ?) WHERE username = ?";
    connection.query(sqlcommand, [info + " * ", req.session.username], (err, results) => { //appends the new log and adds ' * ' at the end of it
        req.session.last_log = info; //stores the last log in the user's session
        res.sendFile(__dirname + "/frontend/prevlog.html");
    });
});






// sends the previous log corresponding to the current user in the client side.
app.get('/getprev', (req, res) =>{

    const information = req.session.last_log;
    res.json({ info: information });

})






// authenticates admin
app.post('/admin', (req, res) => {

    username = req.body.username;
    password = req.body.password;
    if ((username == "Syed Faruque") && (password == "batman")) {
        res.sendFile(__dirname + "/frontend/adminpage.html");
    } else {
        res.sendFile(__dirname + "/frontend/incorrect.html");
    }
});








// checks if the admin selected an existing user before sending the file to the previous logs
app.post('/showlogs', (req, res) =>{

    user = req.body.user;
    connection.query("SELECT * FROM credentials WHERE username = ?", [user], (err, results)=>{
        if (results.length > 0){
            req.session.desireduser = user;
            res.sendFile(__dirname + "/frontend/showdesiredlogs.html");
        }
        else{
            res.sendFile(__dirname + "/frontend/noexist.html");
        }
    })


})







//sends JSON containing usernames to the client-side so the admin can see it
app.get('/getusers', (req, res) => {

    const getUsersQuery = "SELECT username FROM credentials";
    connection.query(getUsersQuery, (err, results) => {
        const usernames = results.map(result => result.username);
        res.json({ usernames: usernames });

    });

})







// creates a list containing the selected user's previous logs and sends it back to client-side
app.get('/getlogs', (req, res) =>{

    const getInfoQuery = "SELECT information FROM credentials WHERE username = ?";
    connection.query(getInfoQuery, [req.session.desireduser], (err, results) => {
        const information = results[0].information;
        if (information && information.includes(' * ')) { //checks for ' * ' to see if a log exists 
            const infoList = information.split(' * '); // creates the list of logs by splitting along ' * '
            res.json({ info: infoList });
        } else {
            console.log("no data");
        }
    });

})






// allows server to listen on port 3000
app.listen(3000, () => {

    console.log("server running on port 3000");
    
});
