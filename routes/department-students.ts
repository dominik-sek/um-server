import { Router } from 'express';
import prisma from '../prisma';
import { authRole, authRoleOrPerson } from '../middleware/authPage';
import { UserRole } from '../enums/userRole';

const router = Router();

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.department_students.findMany({
      include: {
        gradebook: true,
        department: true,
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});

router.get('/student/:gradebook_id', authRoleOrPerson(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.department_students.findUnique({
      where: {
        gradebook_id: Number(req.params.gradebook_id),
      },
      include: {
        gradebook: true,
        department: true,
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dept/:department_id', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const result = await prisma.department_students.findMany({
      where: {
        department_id: Number(req.params.department_id),
      },
      include: {
        gradebook: true,
        department: true,
      }
    });
    res.status(200).send(result);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
});

router.put('/student/:id', authRole(UserRole.ADMIN), async (req, res) => {
});
router.put('/dept/:id', authRole(UserRole.ADMIN), async (req, res) => {
});

router.delete('/student/:id', authRole(UserRole.ADMIN), async (req, res) => {
});
// router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
//   try {
//     const result = await prisma.department_students.findMany({
//       include: {
//         gradebook: true,
//         department: true,
//       }
//     });
//     res.status(200).send(result);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };
export default router;
