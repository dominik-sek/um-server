//@ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };

import express from 'express';
import cors from 'cors';
import flash from 'express-flash';
import session from 'express-session';
import passport from 'passport';
import { initialize } from './passport-config';
import prisma from './prisma';

import usersRouter from './routes/users';
import coursesRouter from './routes/courses';
import departmentsRouter from './routes/departments';
import departmentStudentsRouter from './routes/department-students';
import facultiesRouter from './routes/faculties';
import gradesRouter from './routes/grades';

require('dotenv').config();
const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
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

app.use('/users', usersRouter);
app.use('/courses', coursesRouter);
app.use('/departments', departmentsRouter);
app.use('/department-students', departmentStudentsRouter);
app.use('/faculties', facultiesRouter);
app.use('/grades', gradesRouter);
app.get('/', (req, res, next) => {
    res.status(200).send("OK");
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) throw err;
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


app.get('/checkauth', async (req, res) => {
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

app.delete('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.status(200).send("OK");
    });
});

export default app;
