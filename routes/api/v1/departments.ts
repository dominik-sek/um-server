import { Router } from 'express';
import prisma from '../../../prisma';
import { authRole } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
const router = Router();

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.department.findMany({
      include: {
        faculty: true,
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.department.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        faculty: true,
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const newDepartment = await prisma.department.create({
      data: {
        name: req.body.name,
        faculty_id: Number(req.body.faculty_id),
        degree: req.body.degree,
        length: req.body.length,
        study_type: req.body.study_type,
      }
    });
    res.status(201).send(newDepartment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});

router.put('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const updatedDepartment = await prisma.department.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        ...req.body,
      }
    });
    res.status(200).send(updatedDepartment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const deletedDepartment = await prisma.department.delete({
      where: {
        id: Number(req.params.id),
      }
    });
    res.status(204).send(deletedDepartment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});


export default router;
