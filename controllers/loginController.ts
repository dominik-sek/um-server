import passport from "passport";
import prisma from "../prisma";
import {NextFunction, Request, Response} from "express";
import {getTimestamp} from "../functions/getTimestamp";

export const loginController = () =>{
    const login = (req:Request, res:Response, next: NextFunction, passport: passport.PassportStatic) =>{
        passport.authenticate('local', (err: any, user: Express.User, info: { message: any; }) => {
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
                            last_login: getTimestamp()
                        }
                    });
                    // req.session.cookie.maxAge = hour*2;
                    // console.log(req.session.cookie);
                    res.status(200).send(findPersonById);
                });
            }
        })(req, res, next);
    }
    const logout = (req: Request, res:Response, next: NextFunction) =>{
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).json({ message: 'Logged out' });
        });
    }
    return{
        login,
        logout
    }
}
