import { Router } from 'express';
import prisma from '../prisma';
import { authRole, authRoleOrPerson } from '../middleware/authPage';
import { UserRole } from '../enums/userRole';
import { ReadableStreamDefaultController } from 'stream/web';

const router = Router();

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
  res.status(501).send('Not yet implemented');
});
router.get('/:id', authRoleOrPerson(UserRole.ADMIN), async (req, res) => {
  res.status(501).send('Not yet implemented');
});
router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
  res.status(501).send('Not yet implemented');
});
router.put('/:id', authRoleOrPerson(UserRole.ADMIN), async (req, res) => {
  res.status(501).send('Not yet implemented');
});
router.delete('/:id', authRoleOrPerson(UserRole.ADMIN), async (req, res) => {
  res.status(501).send('Not yet implemented');
});


export default router;
