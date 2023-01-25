//@ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };

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

require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
const PORT = 4000 || process.env.PORT;

app.use(flash());
app.use(session({
    // store: new session.MemoryStore(), todo: add redis
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: true,
        secure: false
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
        };
        if (!user) res.status(401).send(info.message);
        else {
            req.logIn(user, async (err) => {
                if (err) throw err;
                const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + '.000000';

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
                        last_login: new Date(timestamp)
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
    const timestamp = Math.round((new Date()).getTime() / 1000);
    // @ts-ignore there are no types avaliable for cloudinary library and im too lazy to write them
    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp
    }, process.env.CLOUDINARY_SECRET!);
    res.status(200).send({
        signature: signature,
        timestamp: timestamp
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
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + '.000000';
        await prisma.account.update({
            where: {
                person_id: findPersonByEmail.id
            },
            data: {
                reset_token: token,
                reset_token_expires: new Date(timestamp + 1000 * 60 * 60 * 1 )// 1 hour
            }
        });
        res.status(200).send({ message: 'Reset token generated' });
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
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + '.000000';
            //if token is expired
            if (findPersonByToken.reset_token_expires! < new Date(timestamp)) {
                res.status(401).send({ message: 'Token expired' });
            } else {
                await prisma.account.update({
                    where: {
                        person_id: findPersonByToken.person_id
                    },
                    data: {
                        password: password,
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

