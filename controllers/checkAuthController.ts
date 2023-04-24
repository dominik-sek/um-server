import prisma from "../prisma";
import {Request, Response} from "express";

export const checkAuthController =  () =>{
    const checkAuth = async (req: Request, res: Response) =>{
        res.setHeader('Content-Type', 'application/json');
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
    }
    return{
        checkAuth
    }
}


