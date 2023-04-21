import Printouts from "./routes/api/v1/printouts";

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
import prisma from './prisma';
import { initialize } from './passport-config';
import apiV1 from './routes/api/v1';
import { authRoleOrPerson } from './middleware/authPage';
import { UserRole } from './enums/userRole';
import cloudinary from 'cloudinary';
const SibApiV3Sdk = require('sib-api-v3-typescript');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
import {createServer} from "http";
import {Server} from "socket.io";
import {authSocket} from "./middleware/authSocket";
const sender = {
    email: 'wu.pwdreset@gmail.com',
    name: 'Wirtualna uczelnia',
}

const unixTimestamp = Math.round(new Date().getTime() / 1000);
const timestamp_pg = new Date(new Date().toISOString().slice(0, 19).replace('T', ' ') + '.000000')

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
    passport.authenticate('local', (err: any, user: Express.User, info: { message: any; }) => {
        if (err) {
            return next(err);
        }
        if (!user) res.status(401).send(info.message);
        else {
            req.logIn(user, async (err) => {
                if (err) throw err;

                const findPersonById = await prisma.person.findFirst({
                    where: {
                        id: req.user?.person_id
                    }
                });

                await prisma.account.update({
                    where: {
                        person_id: req.user?.person_id
                    },
                    data: {
                        last_login: timestamp_pg
                    }
                });
                // req.session.cookie.maxAge = hour*2;
                // console.log(req.session.cookie);
                res.status(200).send(findPersonById);
            });
        }
    })(req, res, next);
});
app.get('/api/v1/check-auth', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (!req.user) {
        res.status(401).send({
            role: null,
            auth: false
        });
    } else {
        const findUserRole = await prisma.person.findFirst({
            where: {
                id: req.user.person_id
            }
        });
        res.status(200).send(
            {
                role: findUserRole?.role,
                auth: true
            }
        );
    }
});
app.get('/api/v1/cloud-signature', authRoleOrPerson([UserRole.ADMIN, UserRole.STUDENT, UserRole.TEACHER]), (req, res, next) => {
    // @ts-ignore there are no types avaliable for cloudinary library and im too lazy to write them
    const signature = cloudinary.utils.api_sign_request({
        timestamp: unixTimestamp
    }, process.env.CLOUDINARY_SECRET!);
    res.status(200).send({
        signature: signature,
        timestamp: unixTimestamp
    });

});
app.delete('/api/v1/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.status(200).json({ message: 'Logged out' });
    });
});
app.post('/api/v1/forgot-password', async (req, res, next) => {
    const { email } = req.body;
    const findPersonByEmail = await prisma.person.findFirst({
        where: {
            contact: {
                email: email
            }
        }
    });
    if (!findPersonByEmail) {
        res.status(404).send({ message: 'User not found' });
    } else {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await prisma.account.update({
            where: {
                person_id: findPersonByEmail.id
            },
            data: {
                reset_token: token,
                reset_token_expires: new Date(new Date(new Date().getTime() + 15 * 60000).toISOString().slice(0, 19).replace('T', ' ') + '.000000')
            }
        })
        apiInstance.sendTransacEmail({
            sender: sender,
            to: [{ email: email }],
            templateId: 1,
            params: {
                reset_token: token
            }
        }).then((data:any) => {
            res.status(200).send({ message: 'email sent' });
        }).catch((error:any) => {
            res.status(500).send({ message: 'Internal server error' });
        });
    }
});
app.post('/api/v1/reset-password', async (req, res, next) => {
    const { token, password } = req.body;
    if (!token || !password) {
        res.status(400).send({ message: 'Bad request' })
    } else {
        const findPersonByToken = await prisma.account.findFirst({
            where: {
                reset_token: token
            }
        });
        if (!findPersonByToken) {
            res.status(404).send({ message: 'User not found' });
        } else {

            if (timestamp_pg.getTime() > findPersonByToken.reset_token_expires!.getTime()) {
                res.status(400).send({ message: 'Token expired' });
            } else {
                await prisma.account.update({
                    where: {
                        person_id: findPersonByToken.person_id
                    },
                    data: {
                        password: await bcrypt.hash(password, 10),
                        reset_token: null,
                        reset_token_expires: null,
                    }
                });
                res.status(200).send({ message: 'Password changed' });
            }
        }
    }

});

io.use(wrap(sessionMiddleware));
io.use(authSocket);
io.on("reconnect_attempt", () => {
    console.log('reconnect_attempt');
});

io.on("connect", async (socket) => {
    console.log('connected client: ', socket.data.user);
    socket.join(socket.data.user);
    const chatrooms = await prisma.chatroom.findMany({
        where: {
            chatroom_user: {
                some: {
                    user_id: socket.data.user,
                }
            }
        },
        include: {
            chatroom_user: {
                where: {
                    user_id: {
                        not: socket.data.user
                    }
                },
                include: {
                    account:{
                        select: {
                            account_images: {
                                select: {
                                    avatar_url: true
                                }
                            },
                            person:{
                                select:{
                                    first_name: true,
                                    last_name: true
                                }
                            }
                        }
                    },
                },

            },
            message:{
                orderBy: {
                    sent_at: 'desc'
                },
                take: 20,
                //TODO: on scroll up, fetch more messages
            }
        }
    })
    if(chatrooms.length >= 0){
        chatrooms.forEach((chatroom) => {
                socket.emit("chatrooms",chatrooms);
                socket.join(chatroom.id as unknown as string);
                console.log(`User ${socket.data.user} joined chatroom ${chatroom.id}`);
        })
        const unreadMessages = await prisma.chatroom_user.findMany({
            where: {
                chatroom_id: {
                    in: chatrooms.map((chatroom) => chatroom.id)
                },
                user_id: socket.data.user,
            },
            select: {
                chatroom_id: true,
                unread_count: true,
            }
        });

        socket.emit("unread-messages", unreadMessages);
    }
    socket.on("join-chatroom", async (chatroomId) => {
        socket.join(chatroomId as string);
        //find chatroom by id
        const chatroom = await prisma.chatroom.findFirst({
            where: {
                id: chatroomId
            },
            include: {
                chatroom_user: {
                    where: {
                        user_id: {
                            not: socket.data.user
                        }
                    },
                    include: {
                        account:{
                            select: {
                                account_images: {
                                    select: {
                                        avatar_url: true
                                    }
                                },
                                person:{
                                    select:{
                                        first_name: true,
                                        last_name: true
                                    }
                                }
                            }
                        },
                    },

                },
                message:{
                    orderBy: {
                        sent_at: 'desc'
                    }
                }
            }
        });
        console.log(`User ${socket.data.user} joined chatroom ${chatroomId} using join-chatroom`);
        socket.emit("join-chatroom",chatroom);
    })
    socket.on("seen-messages", async (chatroom) => {
        let updatedMessages = await prisma.message.updateMany({
            where: {
                chatroom_id: chatroom.id,
                sender_id: {
                    not: socket.data.user
                },
                status: 'sent'
            },
            data: {
                status: 'read'
            }
        })
        const updatedChatroom = await prisma.chatroom.findFirst({
            where: {
                id: chatroom.id
            },
            include: {
                chatroom_user: {
                    where: {
                        user_id: {
                            not: socket.data.user
                        }
                    },
                    include: {
                        account:{
                            select: {
                                account_images: {
                                    select: {
                                        avatar_url: true
                                    }
                                },
                                person:{
                                    select:{
                                        first_name: true,
                                        last_name: true
                                    }
                                }
                            }
                        },
                    },

                },
                message:{
                    orderBy: {
                        sent_at: 'desc'
                    }
                }
            }
        });
        //update unread count
        let updatedChatroomUser = await prisma.chatroom_user.update({
            where: {
                user_id_chatroom_id:{
                    user_id: socket.data.user,
                    chatroom_id: chatroom.id
                }
            },
            data: {
                unread_count: 0
            }
        });

        const unreadMessages = await prisma.chatroom_user.findMany({
            where: {
                chatroom_id: {
                    in: chatrooms.map((chatroom) => chatroom.id)
                },

                user_id: socket.data.user

            },
            select: {
                chatroom_id: true,
                unread_count: true,
            }
        });

        socket.to(chatroom.id as unknown as string).emit("seen-messages",updatedChatroom);
        //send event to trigger update of unread count
        socket.emit("unread-messages", unreadMessages);
    });
    socket.on("create-chatroom", async (chatroom) => {
        let createdChatroom = await prisma.chatroom.create({
            data: {
                created_by: chatroom.created_by,
                created_at: chatroom.created_at,
                last_activity: chatroom.last_activity
            }
        })

        let usersInChatroom = await prisma.chatroom_user.createMany({
            data: [
                {
                    chatroom_id: createdChatroom.id,
                    user_id: chatroom.created_by
                },
                {
                    chatroom_id: createdChatroom.id,
                    user_id: chatroom.recipient
                }
            ]
        })

        let newChatroom = await prisma.chatroom.findFirst({
            where: {
                id: createdChatroom.id
            },
            include:{
                message: {
                    take: 1,
                    orderBy: {
                        sent_at: "desc"
                    }
                },

                chatroom_user: {
                    where: {
                        user_id: {
                            not: socket.data.user
                        }
                    },
                    include: {
                        account: {
                            select: {
                                account_images: {
                                    select: {
                                        avatar_url: true
                                    }
                                },
                                person:{
                                    select:{
                                        first_name: true,
                                        last_name: true
                                    }
                                }
                            },
                        },
                    }
                }
            }
        })

        socket.join(newChatroom!.id as unknown as string);
        console.log(`User ${socket.data.user} joined chatroom ${newChatroom!.id}`);
        socket.emit("create-chatroom", newChatroom);

    })
    socket.on("send-message", async (message) => {
        let createdMessage = await prisma.message.create({
            data: {
                chatroom_id: message.chatroom_id,
                sender_id: message.sender_id,
                sent_at: message.sent_at,
                content: message.content,
                status: 'sent',
            }
        });
        let recipient = await prisma.chatroom_user.findFirst({
            where: {
                chatroom_id: message.chatroom_id,
                user_id: {
                    not: message.sender_id
                }
            }
        })
        //whenever a new message is sent, update last_activity of chatroom
        let updatedChatroom = await prisma.chatroom.update({
            where: {
                id: message.chatroom_id
            },
            data: {
                last_activity: message.sent_at,
            }
        });
        //update unread count for the chatroom_user who is not the sender
        let updatedChatroomUser = await prisma.chatroom_user.update({
            where: {
                user_id_chatroom_id: {
                    user_id: recipient!.user_id!,
                    chatroom_id: message.chatroom_id
                }
            },
            data:{
                unread_count: {
                    increment: 1
                }
            }
        });


        const unreadMessages = await prisma.chatroom_user.findMany({
            where: {
                chatroom_id: {
                    in: chatrooms.map((chatroom) => chatroom.id)
                },
                user_id: {
                    not: message.sender_id
                }
            },
            select: {
                chatroom_id: true,
                unread_count: true,
            }
        });

        console.log(`User ${socket.data.user} sent a message in chatroom ${message.chatroom_id}`);
        socket.to(recipient!.user_id! as any as string).emit("new-message",message.chatroom_id);
        socket.to(recipient!.user_id! as any as string).emit("unread-messages",unreadMessages);
        io.in(message.chatroom_id).emit("send-message",createdMessage);
        //this sends message to all users in the chatroom
        // io.in(message.chatroom_id).emit("unread-messages",unreadMessages);
        //send message to everyone except the sender

    });
    socket.on("user-typing",({chatroomId, senderId, isTyping})=>{
        console.log(`User ${senderId} is typing in chatroom ${chatroomId}? ${isTyping}`);
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

