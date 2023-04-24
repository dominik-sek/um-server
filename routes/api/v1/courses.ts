import { Router } from 'express';
import prisma from '../../../prisma';
import { authRole, authRoleOrPerson } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import {coursesController} from "../../../controllers/routes/coursesController";

const router = Router();

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
    await coursesController().getCourses(req, res);
});
router.get('/student/:gradebook_id', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  await coursesController().getCourseStudentGrades(req, res);
})
router.get('/students', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
    await coursesController().getAllStudentsInAllCourses(req, res);
});
router.get('/:id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  await coursesController().getCourseById(req, res);
});
router.get('/:id/students', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  await coursesController().getCourseStudents(req,res);
});
router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
  await coursesController().createCourse(req, res);
});
router.post('/:id/students', authRole(UserRole.ADMIN), async (req, res) => {
  await coursesController().createCourseStudent(req,res);
});
router.put('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  await coursesController().updateCourse(req, res);
});
router.delete('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  await coursesController().deleteCourse(req, res)
});


export default router;
