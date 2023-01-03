import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma';
import { UserRole } from '../enums/userRole';

export const authRole = (role: UserRole | UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
    } else {
      const findPerson = await prisma.person.findUnique({
        where: {
          id: req.user.person_id
        }
      });
      role = Array.isArray(role) ? role : [role];
      const hasPermission = role.some((r) => r === findPerson?.role);
      if (!hasPermission) {
        res.status(403).send('Forbidden');
      } else {
        next();
      }
    }
  };

};

export const authRoleOrPerson = (role: UserRole | UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
    } else {
      const findPerson = await prisma.person.findUnique({
        where: {
          id: req.user.person_id
        }
      });

      role = Array.isArray(role) ? role : [role];
      const hasPermission = role.some((r) => r === findPerson?.role);

      const isPerson = findPerson?.id === parseInt(req.params.id);

      if (hasPermission || isPerson) {
        next();
      } else {
        res.status(403).send('Forbidden');
      }
    }
  };
};
