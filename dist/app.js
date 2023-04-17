"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sessionController_1 = require("./sessionController");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_flash_1 = __importDefault(require("express-flash"));
const passport_1 = __importDefault(require("passport"));
const prisma_1 = __importDefault(require("./prisma"));
const passport_config_1 = require("./passport-config");
const v1_1 = __importDefault(require("./routes/api/v1"));
const authPage_1 = require("./middleware/authPage");
const userRole_1 = require("./enums/userRole");
const cloudinary_1 = __importDefault(require("cloudinary"));
const SibApiV3Sdk = require('sib-api-v3-typescript');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const socket_io_1 = require("socket.io");
const authSocket_1 = require("./middleware/authSocket");
require("./types");
const sender = {
    email: 'wu.pwdreset@gmail.com',
    name: 'Wirtualna uczelnia',
};
const unixTimestamp = Math.round(new Date().getTime() / 1000);
const timestamp_pg = new Date(new Date().toISOString().slice(0, 19).replace('T', ' ') + '.000000');
require('dotenv').config();
const app = (0, express_1.default)();
const server = require('http').createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
        credentials: true
    }
});
app.use(cookieParser());
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.SENDINBLUE_API;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
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
app.use((0, express_flash_1.default)());
app.use(express_1.default.urlencoded({ extended: false }));
app.set("trust proxy", 1);
app.use(sessionController_1.sessionMiddleware);
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
(0, passport_config_1.initialize)(passport_1.default);
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
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
app.use('/api/v1', v1_1.default);
app.get('/api/v1/', (req, res, next) => {
    res.status(200).send("OK");
});
app.post('/api/v1/login', (req, res, next) => {
    passport_1.default.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user)
            res.status(401).send(info.message);
        else {
            req.logIn(user, async (err) => {
                if (err)
                    throw err;
                const findPersonById = await prisma_1.default.person.findFirst({
                    where: {
                        id: req.user?.person_id
                    }
                });
                await prisma_1.default.account.update({
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
    }
    else {
        const findUserRole = await prisma_1.default.person.findFirst({
            where: {
                id: req.user.person_id
            }
        });
        res.status(200).send({
            role: findUserRole?.role,
            auth: true
        });
    }
});
app.get('/api/v1/cloud-signature', (0, authPage_1.authRoleOrPerson)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.STUDENT, userRole_1.UserRole.TEACHER]), (req, res, next) => {
    // @ts-ignore there are no types avaliable for cloudinary library and im too lazy to write them
    const signature = cloudinary_1.default.utils.api_sign_request({
        timestamp: unixTimestamp
    }, process.env.CLOUDINARY_SECRET);
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
    const findPersonByEmail = await prisma_1.default.person.findFirst({
        where: {
            contact: {
                email: email
            }
        }
    });
    if (!findPersonByEmail) {
        res.status(404).send({ message: 'User not found' });
    }
    else {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await prisma_1.default.account.update({
            where: {
                person_id: findPersonByEmail.id
            },
            data: {
                reset_token: token,
                reset_token_expires: new Date(new Date(new Date().getTime() + 15 * 60000).toISOString().slice(0, 19).replace('T', ' ') + '.000000')
            }
        });
        apiInstance.sendTransacEmail({
            sender: sender,
            to: [{ email: email }],
            templateId: 1,
            params: {
                reset_token: token
            }
        }).then((data) => {
            res.status(200).send({ message: 'email sent' });
        }).catch((error) => {
            res.status(500).send({ message: 'Internal server error' });
        });
    }
});
app.post('/api/v1/reset-password', async (req, res, next) => {
    const { token, password } = req.body;
    if (!token || !password) {
        res.status(400).send({ message: 'Bad request' });
    }
    else {
        const findPersonByToken = await prisma_1.default.account.findFirst({
            where: {
                reset_token: token
            }
        });
        if (!findPersonByToken) {
            console.log(findPersonByToken);
            res.status(404).send({ message: 'User not found' });
        }
        else {
            if (timestamp_pg.getTime() > findPersonByToken.reset_token_expires.getTime()) {
                res.status(400).send({ message: 'Token expired' });
            }
            else {
                await prisma_1.default.account.update({
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
io.use((0, sessionController_1.wrap)(sessionController_1.sessionMiddleware));
io.use(authSocket_1.authSocket);
io.on("connect", socket => {
    console.log('connected');
    console.log();
    console.log(socket.request.session.user);
    console.log(socket.id);
});
server.listen(3000, () => {
    console.log("Server started on port 3000");
});
exports.default = app;
//# sourceMappingURL=app.js.map