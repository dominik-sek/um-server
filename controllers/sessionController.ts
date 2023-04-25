import session from "express-session";
import {createClient} from "redis";
import RedisStore from "connect-redis";
require('dotenv').config();

let redisClient = createClient({})
redisClient.connect().catch(console.error)
let redisStore = new RedisStore({
    client: redisClient,
})

const sessionMiddleware = session({
    store: redisStore,
    proxy: true,
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 900000, // 15 minutes
        sameSite: true,
        secure: process.env.NODE_ENV === 'production',
    }
})

const wrap = (middleware: (req: any, res: any, next: any) => void) => (socket: any, next: any) => middleware(socket.request, {}, next);


export {
    sessionMiddleware,
    wrap
}