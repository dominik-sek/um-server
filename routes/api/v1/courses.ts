import { Router } from 'express';
import prisma from '../../../prisma';
import { authRole, authRoleOrPerson } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import { course_students } from '@prisma/client';

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

//get students that are in a course
router.get(':id/students', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => { 
  try {
    const result = await prisma.course_students.findUnique({
      where: {
        course_id: Number(req.params.id),
      },
      include: {
        gradebook: {
          include: {
            person: true,
            grade:true,
        }
      }
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
})
router.get('/student/:gradebook_id', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  try {
    const result = await prisma.course_students.findMany({
      where: {
        gradebook_id: Number(req.params.gradebook_id),
      },
      select: {
        course: true,
        gradebook: {
          select: {
            grade: {
              select: {
                grade: true,
                entry_time: true,
                grade_Id: true,
              }
            }
          }
        }
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
  
})

router.get('/students', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  try {
    const result = await prisma.course.findMany({
      where: {
        person_id: Number(req.user?.person_id),
      },
      select: {
        name: true,
        id: true,
        type: true,
        course_students: {
          include: {
            gradebook: {
              include: {
                person: {
                  include: {
                    contact: true,
                  }
                },
                grade: true,
              }
            }
          }
        }
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
})


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
