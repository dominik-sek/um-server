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
        department_course: true
      }
    });
    res.status(200).send(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

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
//get students for each course by teacher id
router.get('/students', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  try {
    const result = await prisma.course.findMany({
      where: {
        person_id: Number(req.user?.person_id),
      },
      include: {
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
    res.status(500).json({ error: err.message });
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
        department: Number(req.body.department_id),
        ects: Number(req.body.ects),
        name: req.body.name,
        person_id: Number(req.body.person_id),
        semester: req.body.semester,
        type: req.body.type,
      }
    });
    res.status(201).send(newCourse);
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});
//add new student to course
router.post('/:id/students', authRole(UserRole.ADMIN), async (req, res) => {
  try {
    const newCourseStudent = await prisma.course_students.create({
      data: {
        ...req.body,
        course_id: Number(req.params.id),
      }
    });
    res.status(201).send(newCourseStudent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
//get all course students
router.get('/:id/students', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  try {
    const result = await prisma.course_students.findMany({
      where: {
        course_id: Number(req.params.id),
      },
      include: {
        gradebook: {
          include: {
            person: true,
            grade: true,
          }
        }
      }
    });
    res.status(200).send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

//update course, add a new teacher as the course teacher
router.put('/:id/teacher', authRole(UserRole.ADMIN), async (req, res) => {
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
    console.log(err)
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
    console.log(err)
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
    console.log(err)
    res.status(500).json({ error: err.message });
  }

});


export default router;
