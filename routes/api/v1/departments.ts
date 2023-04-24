import { Router } from 'express';
import { authRole } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import {departmentsController} from "../../../controllers/routes/departmentsController";
const router = Router();

router.get('/', authRole(UserRole.ADMIN), async (req, res) => {
  await departmentsController().getDepartments(req, res);
});

router.get('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  await departmentsController().getDepartmentById(req, res);
});

router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
  await departmentsController().createDepartment(req, res);
});

router.put('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  await departmentsController().updateDepartment(req, res);
});

router.delete('/:id', authRole(UserRole.ADMIN), async (req, res) => {
  await departmentsController().deleteDepartment(req, res);
});


export default router;
