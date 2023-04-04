import { Router } from 'express';
import prisma from '../../../prisma';
import { authRole, authRoleOrPerson } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import { printouts } from '@prisma/client';

const router = Router();

router.get('/', authRole([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  try {
    const result = await prisma.printouts.findMany({
      select: {
        id: true,
        description: true,
        url: true,
      }
    })
    res.status(200).send(result);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  try {
    const result = await prisma.printouts.create({
      data: {
        description: req.body.description,
        url: req.body.url,
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/:id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
    try {
        const result = await prisma.printouts.delete({
        where: {
            id: Number(req.params.id),
        }
        });
        res.status(200).send(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
