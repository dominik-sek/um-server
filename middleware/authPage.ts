import { person } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma';

export const authRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
    } else {
      const findPerson = await prisma.person.findUnique({
        where: {
          id: req.user.person_id
        }
      });
      if (findPerson?.role !== role) {
        res.status(403).send('Forbidden');
      } else {
        next();
      }
    }
  };

};

export const authRoleOrPerson = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
    } else {
      const findPerson = await prisma.person.findUnique({
        where: {
          id: req.user.person_id
        }
      });

      if (findPerson?.role === role || findPerson?.id === parseInt(req.params.id)) {
        next();
      } else {
        res.status(403).send('Forbidden');
      }
    }
  };
};
