import { person } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma';

export const authRole = (role:string) => {
    return async (req:Request, res:Response, next:NextFunction) => {
      if (!req.user) {
        res.status(401).send('Unauthorized');
      } else {
      const findRole = await prisma.role.findUnique({
        where: {
            id: req.user.role_id
        }
      })
      if (findRole!.name !== role) {
        res.status(403).send('Forbidden')
      }

      next();
      }

  }
  
}

export const authRoleOrPerson = (role: string) => {
  return async (req:Request, res:Response, next:NextFunction) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
    }else {
    const findRole = await prisma.role.findUnique({
      where: {
          id: req.user.role_id
      }
    })
    const findPerson = await prisma.person.findUnique({
      where: {
        id: req.user.person_id
      }
    })
      console.log(findRole?.name, role)
    if (findRole?.name === role || findPerson?.id === parseInt(req.params.id)) {
      next();

    } else {
      res.status(403).send('Forbidden');
    }
  }
}
};
