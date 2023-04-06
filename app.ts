interface BigIntWithToJSON extends BigInt {
    toJSON(): string;
}

(BigInt.prototype as BigIntWithToJSON).toJSON = function () {
    return this.toString();
};
import express from 'express';
import cors from 'cors';
import flash from 'express-flash';
import session from 'express-session';
import passport from 'passport';
import prisma from './prisma';
import { initialize } from './passport-config';
import apiV1 from './routes/api/v1';
import { authRoleOrPerson } from './middleware/authPage';
import { UserRole } from './enums/userRole';
import cloudinary from 'cloudinary';
const SibApiV3Sdk = require('sib-api-v3-typescript');
const bcrypt = require('bcrypt');

import RedisStore from "connect-redis"
import {createClient} from "redis"
let redisClient = createClient({
    url: process.env.REDIS_URL_EXTERNAL,
})
redisClient.connect().catch(console.error)
let redisStore = new RedisStore({
    client: redisClient,
    // prefix: "myapp:",
})

const unixTimestamp = Math.round(new Date().getTime() / 1000);
const timestamp_pg = new Date(new Date().toISOString().slice(0, 19).replace('T', ' ') + '.000000')

require('dotenv').config();
const app = express();

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.SENDINBLUE_API!;

const sender = {
    email: 'wu.pwdreset@gmail.com',
    name: 'Wirtualna uczelnia',
}

app.use(express.json());
app.use(cors({
    origin: 'https://um.dominiksek.com',
    // methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true
}));
const PORT = 4000 || process.env.PORT;

app.use(flash());
app.set("trust proxy", 1);
let hour = 3600000;
app.use(express.urlencoded({ extended: false }));
app.use(session({
    store: redisStore,
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: hour*2,
        sameSite: true,
        secure: false,
        httpOnly: true,
        // domain:'.dominiksek.com'
    }
}));

initialize(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1', apiV1);

app.get('/api/v1/', (req, res, next) => {
    res.status(200).send("OK");
});

app.post('/api/v1/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
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
                res.status(200).send(findPersonById);
            });
        }
    })(req, res, next);
});

app.get('/api/v1/check-auth', async (req, res) => {
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
            console.log(findPersonByToken)
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

export default app;

