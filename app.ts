import express from 'express';
import cors from 'cors';
import flash from 'express-flash';
import session from 'express-session';
import passport from 'passport';
import { initialize } from './passport-config';
import prisma from './prisma';

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
        // maxAge: 10000, // 10 seconds
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: true,
        secure: false
    } 
}))
initialize(passport);
app.use(passport.initialize());
app.use(passport.session());


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
                const findPersonById = await prisma.person.findFirst({
                    where: {
                        id: req!.user!.person_id
                    }
                })
            
                const findRole = await prisma.role.findUnique({
                    where: {
                        id: findPersonById!.role_id
                    }
                })

                res.json({ personId: findPersonById!.id, role: findRole!.name });
                res.status(200).send()
            })
        }
    })(req, res, next);
});


export default app;
