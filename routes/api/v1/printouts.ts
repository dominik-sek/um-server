import { Router } from 'express';
import { authRole,  } from '../../../middleware/authPage';
import { UserRole } from '../../../enums/userRole';
import {printoutController} from "../../../controllers/routes/printoutController";

const router = Router();

router.get('/', authRole([UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]), async (req, res) => {
    await printoutController().getPrintout(req, res)
});
router.post('/', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
    await printoutController().postPrintout(req, res);
});
router.delete('/:id', authRole([UserRole.ADMIN, UserRole.TEACHER]), async (req, res) => {
    await printoutController().deletePrintout(req, res);
});

export default router;
