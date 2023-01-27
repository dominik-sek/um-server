import express from 'express';
import usersRouter from './users';
import coursesRouter from './courses';
import departmentsRouter from './departments';
import facultiesRouter from './faculties';
import gradesRouter from './grades';
import printoutRouter from './printouts';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/courses', coursesRouter);
router.use('/departments', departmentsRouter);
router.use('/faculties', facultiesRouter);
router.use('/grades', gradesRouter);
router.use('/printouts', printoutRouter);

export default router;
