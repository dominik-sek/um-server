
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
import { user } from '@prisma/client';
import { PassportStatic } from 'passport';
import prisma from './prisma';

declare global {
  namespace Express {
    interface User extends user { }
  }
}

export const initialize = (passport: PassportStatic) => {
  const authenticateUser = async (login:string, password:string, done: (error: any, user?: user | false, options?: { message: string }) => void) => {

    const user = await prisma.user.findFirst({
      where: {
        login: login
      },
    });
    
    if (user == null) {
      return done(null, false, { message: 'No user found' });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect login or password' });
      }
    } catch (e) {
      return done(e);
    }
  
}

  passport.use(new LocalStrategy({
    usernameField: 'login',
    passwordField: 'password',
  },
    authenticateUser));
  passport.serializeUser((user: user, done) => done(null, user.person_id));
  passport.deserializeUser(async (id:number, done) => {
    return done(null, await prisma.user.findFirst({
      where: {
        person_id: id
      },
    }));
  });

}
