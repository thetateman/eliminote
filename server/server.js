"use strict";

const path = require('path');
const http = require('http');
//const cors = require('cors');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const helmet = require('helmet');

//const MongoStore = require('connect-mongo')(session);

//require('dotenv').config();
//const verbose = (process.env.VERBOSE === 'true');

//const connection = mongoose.createConnection(process.env.RESTREVIEWS_DB_URI);

const app = express();
//app.use(cors())

// Security middleware
app.set('trust proxy', 'loopback');
/*
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        connectSrc: ["'self'", "wss://onlineacquire.com"], //TODO: Replace
    },
}));
*/
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*
const sessionStore = new MongoStore({
    mongooseConnection: connection,
    collection: 'sessions'
});

const sessionMiddleware = session({
    secret: 'some secret', //TODO: CHANGE THIS
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
});


app.use(sessionMiddleware);
*/

//app.use("/api", apiRouter);
app.get("/robots.txt", (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../robots.txt`));
});

/*
function authLogic(req, res, next) {
    //console.log(req.ip);
    //TODO: fix below
    if(req.session.isAuth || req.originalUrl.includes('login') || req.originalUrl === '/img/a_background.webm'|| req.originalUrl === '/img/a_background.mp4'){
         next();
    } else {
        req.session.username = 'Guest' + guestID;
        guestID++;
        req.session.isAuth = true;
        //res.status(401);
        //res.redirect('/login');
        next();
    }
}


app.use(authLogic);
*/

app.use(express.static(path.resolve(`${__dirname}/../client`), {index: 'index.html'}));



app.use('/dashboard', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/dashboard.html`));
});
/*
app.use('/lobby', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/lobby.html`));
});
app.use('/about', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/about.html`));
});
app.use('/game', (req, res) => {
    let requestedGameID = req.query.gameid;
    res.sendFile(path.resolve(`${__dirname}/../client/index.html`));
});
*/

const server = http.createServer(app);
const io = socketio(server);
/*
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
*/
let documents = [];
io.on('connection', (sock) => {
    console.log("someone connected.")
    sock.on('send-changes', (delta) => {
        console.log(delta)
        sock.broadcast.emit("receive-changes", delta);
    });
    sock.on('new-doc', (title) => {
        documents.push(title);
        sock.join(title);
        console.log(title);
        app.use(`/${title}`, (req, res) => {
            res.sendFile(path.resolve(`${__dirname}/../client/index.html`));
        });
    });
    sock.on('get-doc-list', () => {
        sock.emit('send-doc-list', documents);
    });
});


server.on('error', (err) => {
    console.error(err);
});

server.listen(8080, () => {
    console.log('server started');
});