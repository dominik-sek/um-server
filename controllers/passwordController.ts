import prisma from "../prisma";
import {Request, Response} from "express";
import {getTimestamp} from "../functions/getTimestamp";
const bcrypt = require('bcrypt');

export const passwordController =  () =>{
    const forgotPassword = async (req: Request, res: Response,
                                  apiInstance: { sendTransacEmail: (arg0: { sender: any; to: { email: any; }[]; templateId: number; params: { reset_token: string; }; }) => Promise<any>; },
                                  sender: any) =>{

        const { email } = req.body;
        const findPersonByEmail = await prisma.person.findFirst({
            where: {
                contact: {
                    email: email
                }
            }
        });
        if (!findPersonByEmail) {
            res.status(404).send({ message: 'User not found' });
        } else {
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await prisma.account.update({
                where: {
                    person_id: findPersonByEmail.id
                },
                data: {
                    reset_token: token,
                    reset_token_expires: new Date(new Date(new Date().getTime() + 15 * 60000).toISOString().slice(0, 19).replace('T', ' ') + '.000000')
                }
            })
            apiInstance.sendTransacEmail({
                sender: sender,
                to: [{ email: email }],
                templateId: 1,
                params: {
                    reset_token: token
                }
            }).then((data:any) => {
                res.status(200).send({ message: 'email sent' });
            }).catch((error:any) => {
                res.status(500).send({ message: 'Internal server error' });
            });
        }
    }

    const resetPassword = async (req: Request, res: Response) =>{
        const { token, password } = req.body;
        if (!token || !password) {
            res.status(400).send({ message: 'Bad request' })
        } else {
            const findPersonByToken = await prisma.account.findFirst({
                where: {
                    reset_token: token
                }
            });
            if (!findPersonByToken) {
                res.status(404).send({ message: 'User not found' });
            } else {

                if (getTimestamp().getTime() > findPersonByToken.reset_token_expires!.getTime()) {
                    res.status(400).send({ message: 'Token expired' });
                } else {
                    await prisma.account.update({
                        where: {
                            person_id: findPersonByToken.person_id
                        },
                        data: {
                            password: await bcrypt.hash(password, 10),
                            reset_token: null,
                            reset_token_expires: null,
                        }
                    });
                    res.status(200).send({ message: 'Password changed' });
                }
            }
        }
    }
    return {
        forgotPassword,
        resetPassword
    }
}
