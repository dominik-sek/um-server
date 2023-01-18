import { Router } from 'express';
import prisma from '../../../prisma';
import { authRole, authRoleOrPerson } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';

const router = Router();
const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + '.000000';

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {

  try {
    const result = await prisma.grade.findMany({
      include: {
        gradebook: true,
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});

router.get('/student/:gradebook_id', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  try {
    const result = await prisma.grade.findMany({
      where: {
        gradebook_id: Number(req.params.gradebook_id),
      },
      include: {
        gradebook: true,
        course: true,
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});
router.get('/teacher', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  
    try {
      const result = await prisma.course.findMany({
        where: {
          person_id: Number(req.user?.person_id),
        },
        select: {
          grade: true,
          name: true,
          type: true,
          id: true,
        }
      });
      res.status(200).send(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  
});
router.get('/course/:course_id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {

  try {
    const result = await prisma.grade.findMany({
      where: {
        course_id: Number(req.params.course_id),
      },
      include: {
        gradebook: true,
      }
    });
    res.status(200).send(result);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  try {
    const newGrade = await prisma.grade.create({
      data: {
        gradebook_id: req.body.gradebook_id,
        course_id: req.body.course_id,
        grade: parseFloat(req.body.grade),
        entry_time: new Date(timestamp)
      }
    });
    res.status(201).send(newGrade);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/student/:gradebook_id/course/:course_id', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  
    try {
      const findGrade = await prisma.grade.findMany({
        where: {
          gradebook_id: Number(req.params.gradebook_id),
          course_id: Number(req.params.course_id),
        },
        include: {
          gradebook: true,
        }
      });
  
      if (findGrade) {
        res.status(200).send(findGrade);
      } else {
        res.status(404).send('Grade not found');
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
});


router.delete('/student/:grade_id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {

  try {
    const deletedGrade = await prisma.grade.delete({
      where: {
        grade_Id: Number(req.params.grade_id),
      },
    });
    res.status(200).send(deletedGrade);
  }
  catch (err: any) {
    res.status(500).json({ error: err.message });
  }

});


export default router;
