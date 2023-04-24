import {Request} from "express";
import prisma from "../prisma";

const getUserRole = async (req: Request)=>{
    const findPerson = await prisma.person.findUnique({
        where: {
            id: req.user?.person_id
        }
    });
    return findPerson?.role;
}

export {
    getUserRole
}