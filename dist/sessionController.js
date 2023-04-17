"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = exports.sessionMiddleware = void 0;
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const connect_redis_1 = __importDefault(require("connect-redis"));
require('dotenv').config();
let redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL_EXTERNAL,
});
redisClient.connect().catch(console.error);
let redisStore = new connect_redis_1.default({
    client: redisClient,
});
const sessionMiddleware = (0, express_session_1.default)({
    store: redisStore,
    proxy: true,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 900000,
        sameSite: true,
        secure: process.env.NODE_ENV === 'production',
    }
});
exports.sessionMiddleware = sessionMiddleware;
const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
exports.wrap = wrap;
//# sourceMappingURL=sessionController.js.map