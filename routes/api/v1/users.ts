import { Router } from 'express';
import { authRole, authRoleOrPerson } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import userController from "../../../controllers/routes/userController";

const router = Router();
router.get('/', authRole([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]),async (req, res) => {
   await userController().getUser(req, res)
});
router.get('/profile', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  await userController().getProfileOfCurrentUser(req, res);
});
router.get('/:id', authRoleOrPerson(UserRole.ADMIN), async (req, res) => {
  await userController().getProfileById(req, res);
});

router.post('/', authRole(UserRole.ADMIN), async (req, res) => {
  await userController().createUser(req, res);
});
router.put('/profile/avatar', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  await userController().changeAvatar(req, res)
});
router.put('/profile/background', authRoleOrPerson([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
  await userController().changeBackground(req, res)
});
router.put('/:id', authRoleOrPerson(UserRole.ADMIN), async (req, res) => {
  await userController().updateUser(req, res);
});
router.delete('/:id', authRole(UserRole.ADMIN), async (req, res) => {
    await userController().deleteUser(req, res);
});


export default router;
