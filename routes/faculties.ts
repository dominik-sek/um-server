import { Router } from 'express';
import prisma from '../prisma';
import { authRole, authRoleOrPerson } from '../middleware/authPage';
import { UserRole } from '../enums/userRole';

const router = Router();

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.faculty.findMany({
      include: {
        department: true,
        person: true,
      },
    });
    res.status(200).send(result);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  try {
    const result = await prisma.faculty.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        department: true,
        person: true,
      },
    });
    res.status(200).send(result);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const newFaculty = await prisma.faculty.create({
      data: {
        name: req.body.name,
        person_id: Number(req.body.person_id),
      },
      include: {
        department: true,
        person: true,
      },
    });
    res.status(201).send(newFaculty);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const updatedFaculty = await prisma.faculty.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name: req.body.name,
        person_id: Number(req.body.person_id),
      },
      include: {
        department: true,
        person: true,
      },
    });
    res.status(200).send(updatedFaculty);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const deletedFaculty = await prisma.faculty.delete({
      where: {
        id: Number(req.params.id),
      },
      include: {
        department: true,
        person: true,
      },
    });
    res.status(204).send(deletedFaculty);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});


export default router;
