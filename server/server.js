"use strict";

const path = require('path');
const http = require('http');
//const cors = require('cors');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const helmet = require('helmet');

const Document = require('./models/document.js');
const apiRouter = require("./api/api.router.js");

const MongoStore = require('connect-mongo')(session);

const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/eliminote');

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




//const MongoStore = require('connect-mongo')(session);

//require('dotenv').config();
//const verbose = (process.env.VERBOSE === 'true');

//const connection = mongoose.createConnection(process.env.RESTREVIEWS_DB_URI);

async function findOrCreateDocument(user, course, title) {
    const defaultValue = "";
    const id = `${course}/${title}`;
    const document = await Document.findById(id);
    if(document) return document;
    return await Document.create({ _id: id, user: "testusername", course: course, data: defaultValue})
}


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

app.use(sessionMiddleware);

app.use("/api", apiRouter);

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

app.use(express.static(path.resolve(`${__dirname}/../client`), {index: 'dashboard.html'}));



app.use('/dashboard', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/dashboard.html`));
});
app.use('/login', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../client/login.html`));
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

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

let documents = [];
let courses = {};
io.on('connection', (sock) => {
    console.log("someone connected.")
    sock.on('send-changes', ({delta, course, title}) => {
        console.log(delta)
        sock.broadcast.to(`${course}/${title}`).emit("receive-changes", delta);
    });
    sock.on('new-course', (title) => {
        console.log(title);
        courses[title] = {
            documents: [],
        }
        app.use(`/CourseView_${encodeURIComponent(title)}`, (req, res) => {
            res.sendFile(path.resolve(`${__dirname}/../client/course.html`));
        });

    })
    sock.on('new-doc', ({course, title}) => {
        courses[course].documents.push(title);
        app.use(`/${encodeURIComponent(course)}_DocumentView_${encodeURIComponent(title)}`, (req, res) => {
            res.sendFile(path.resolve(`${__dirname}/../client/index.html`));
        });
    });
    sock.on('get-doc-list', (course) => {
        console.log(course);
        sock.emit('send-doc-list', courses[course].documents);
    });
    sock.on('get-course-list', () => {
        sock.emit('send-course-list', courses);
    });
    sock.on('get-doc', async ({course, title}) => {
        const doc = await findOrCreateDocument('testuser', course, title);
        sock.join(`${course}/${title}`);
        sock.emit('load-document', doc.data);
        sock.on('save-doc', async data => {
            await Document.findByIdAndUpdate(`${course}/${title}`, {data});
        });
    });
    
});


server.on('error', (err) => {
    console.error(err);
});

server.listen(8080, () => {
    console.log('server started');
});