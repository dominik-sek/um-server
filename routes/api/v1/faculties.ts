import { Router } from 'express';
import { authRole } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import {facultiesController} from "../../../controllers/routes/facultiesController";

const router = Router();

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
  await facultiesController().getFaculties(req, res);
});
router.get('/:id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
  await facultiesController().getFacultyById(req, res);
});
router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
 await facultiesController().createFaculty(req, res);
});
router.put('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  await facultiesController().updateFaculty(req, res);
});
router.delete('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  await facultiesController().deleteFaculty(req, res)
});


export default router;
