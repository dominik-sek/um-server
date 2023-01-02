
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
import { account } from '@prisma/client';
import { PassportStatic } from 'passport';
import prisma from './prisma';

declare global {
  namespace Express {
    interface User extends account { }
  }
}

export const initialize = (passport: PassportStatic) => {
  const authenticateUser = async (username: string, password: string, done: (error: any, account?: account | false, options?: { message: string; }) => void) => {

    const account = await prisma.account.findFirst({
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
      } else {
        return done(null, false, { message: 'Incorrect login or password' });
      }
    } catch (e) {
      return done(e);
    }

  };

  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  },
    authenticateUser));
  passport.serializeUser((account: account, done) => done(null, account.person_id));
  passport.deserializeUser(async (id: number, done) => {
    return done(null, await prisma.account.findFirst({
      where: {
        person_id: id
      },
    }));
  });

};
