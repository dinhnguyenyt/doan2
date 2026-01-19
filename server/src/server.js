const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');
const route = require('./route/index');
const connectDB = require('./config/connect');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ChatBot = require('./utils/ChatBot');

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
});

app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_CLIENT, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
route(app);
app.use(express.static('uploads'));
connectDB();

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('sendMessage', (message) => {
        io.emit('message', message);

        ChatBot(message, io);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
