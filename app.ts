
interface BigIntWithToJSON extends BigInt {
    toJSON(): string;
}
(BigInt.prototype as BigIntWithToJSON).toJSON = function () {
    return this.toString();
};
import {sessionMiddleware,wrap} from "./sessionController";
import express from 'express';
import cors from 'cors';
import flash from 'express-flash';
import passport from 'passport';
import { initialize } from './passport-config';
import apiV1 from './routes/api/v1';
import {Server} from "socket.io";

import {authSocket} from "./middleware/authSocket";
import {connectionController} from "./controllers/socket/connectionController";
import {chatroomController} from "./controllers/socket/chatroomController";
import {passwordController} from "./controllers/passwordController";
import {loginController} from "./controllers/loginController";
import {checkAuthController} from "./controllers/checkAuthController";
import {messageController} from "./controllers/socket/messageController";

const SibApiV3Sdk = require('sib-api-v3-typescript');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const app = express();
const server = require('http').createServer(app);


const io = new Server(server,{
    cors:{
        origin:'http://localhost:5173',
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
        credentials: true
    }
})

app.use(cookieParser());

const sender = {
    email: 'wu.pwdreset@gmail.com',
    name: 'Wirtualna uczelnia',
}
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.SENDINBLUE_API!;

app.use(express.json());

app.use(cors({
    origin:'http://localhost:5173',
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
    credentials: true
}));

//prod:
// app.use(cors({
//     // origin:'https://um.dominiksek.com',
//     origin:true,
//     methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
//     credentials: true
// }));

app.use(flash());

app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", 1);


app.use(sessionMiddleware);

//prod:
// app.use(session({
//     store: redisStore,
//     proxy: true,
//     secret: process.env.SESSION_SECRET!,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 900000, // 15 minutes
//         sameSite: "none",
//         secure: true,
//         httpOnly:true,
//         path: "/",
//         domain: ".dominiksek.com"
//     }
// }));

initialize(passport);
app.use(passport.initialize());
app.use(passport.session());


// app.use((req, res, next) => {
//     if (req.user) {
//         req.session!.destroy((err) => {
//             if (err) {
//                 console.log(err);
//             }
//         });
//     }
//     next();
// });


app.use('/api/v1', apiV1);
app.get('/api/v1/', (req, res, next) => {
    res.status(200).send("OK");
});
app.post('/api/v1/login', (req, res, next) => {
    loginController().login(req, res, next, passport);
});
app.get('/api/v1/check-auth', async (req, res) => {
    await checkAuthController().checkAuth(req, res);
});
app.delete('/api/v1/logout', (req, res, next) => {
    loginController().logout(req, res, next);
});
app.post('/api/v1/forgot-password', async (req, res, next) => {
    await passwordController().forgotPassword(req, res, apiInstance, sender);
});
app.post('/api/v1/reset-password', async (req, res, next) => {
    await passwordController().resetPassword(req, res);
});

io.use(wrap(sessionMiddleware));
io.use(authSocket);
io.on("reconnect_attempt", () => {
    console.log('reconnect_attempt');
});
io.on("connect", async (socket) => {
    console.log('connected client: ', socket.data.user);

    socket.join(socket.data.user);

    const chatrooms = await connectionController().onConnection(socket);

    socket.on("create-chatroom", async (chatroom) => {
        await chatroomController().createChatroom(socket, chatroom);
    });
    socket.on("join-chatroom", async (chatroomId) => {
        await chatroomController().joinChatroom(socket, chatroomId);
    })
    socket.on("delete-chatroom", async (chatroomId) => {
        await chatroomController().deleteChatroom(socket, chatroomId);
    });
    socket.on("send-message", async (message) => {
        await messageController().sendMessage(socket, message).then((createdMessage)=>{
            io.in(message.chatroom_id).emit("send-message",createdMessage);
        })
    });
    socket.on("seen-messages", async (chatroom) => {
        await messageController().seenMessages(socket, chatroom, chatrooms);
    });
    socket.on("user-typing",({chatroomId, senderId, isTyping})=>{
        socket.to(chatroomId).emit("user-typing",{chatroomId, senderId, isTyping});
    })
    socket.on("disconnect", () => {
        console.log(`User ${socket.data.user} disconnected`);
    });
})
server.listen(3000,()=>{
    console.log("Server started on port 3000");
})
export default app;