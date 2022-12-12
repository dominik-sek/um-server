import express from 'express';
import cors from 'cors';
import flash from 'express-flash';
import session from 'express-session';
import passport, { initialize } from 'passport';

const app = express();
require('dotenv').config();
initialize(passport)

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))
const PORT = 4000 || process.env.PORT;
app.use(express.json());
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
