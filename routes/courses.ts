import { Router } from 'express';
import prisma from '../prisma';
import { authRole, authRoleOrPerson } from '../middleware/authPage';
import { UserRole } from '../enums/userRole';

const router = Router();

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.course.findMany({
      include: {
        person: true,
      }
    });
    res.status(200).send(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  try {
    const result = await prisma.course.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        person: true,
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const newCourse = await prisma.course.create({
      data: {
        ...req.body,
      }
    });
    res.status(201).send(newCourse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const updatedCourse = await prisma.course.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        ...req.body,
      }
    });
    res.status(200).send(updatedCourse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const deletedCourse = await prisma.course.delete({
      where: {
        id: Number(req.params.id),
      }
    });
    res.status(204).send(deletedCourse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});


export default router;
