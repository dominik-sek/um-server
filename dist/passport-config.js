"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const prisma_1 = __importDefault(require("./prisma"));
const initialize = (passport) => {
    const authenticateUser = async (username, password, done) => {
        const account = await prisma_1.default.account.findFirst({
            where: {
                username: username
            },
        });
        if (account == null) {
            return done(null, false, { message: 'No user found' });
        }
        try {
            if (await bcrypt.compare(password, account.password)) {
                return done(null, account);
            }
            else {
                return done(null, false, { message: 'Incorrect login or password' });
            }
        }
        catch (e) {
            return done(e);
        }
    };
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
    }, authenticateUser));
    passport.serializeUser((account, done) => done(null, account.person_id));
    passport.deserializeUser(async (id, done) => {
        return done(null, await prisma_1.default.account.findFirst({
            where: {
                person_id: id
            },
        }));
    });
};
exports.initialize = initialize;
//# sourceMappingURL=passport-config.js.map