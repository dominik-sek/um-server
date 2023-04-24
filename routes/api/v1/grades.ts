import { Router } from 'express';
import { authRole, authRoleOrPerson } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import {gradesController} from "../../../controllers/routes/gradesController";

const router = Router();


router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
  await gradesController().getGrades(req, res);
});
router.get('/student/:gradebook_id', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  await gradesController().getGradesByGradebookId(req, res);
});
router.get('/teacher', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  await gradesController().getGradesByTeacherId(req, res);
});
router.get('/course/:course_id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  await gradesController().getGradesByCourseId(req, res);
});
router.get('/pdf/:gradebook_id', async (req, res) => {
  await gradesController().getGradebookPDF(req, res);
});
router.post('/', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  await gradesController().createGrade(req, res);
});
router.put('/:grade_id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  await gradesController().updateGrade(req, res);
});
router.delete('/student/:grade_id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
    await gradesController().deleteGrade(req, res);
});


export default router;
