"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../../prisma"));
const authPage_1 = require("../../../middleware/authPage");
const userRole_1 = require("../../../enums/userRole");
const router = (0, express_1.Router)();
router.get('/', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const result = await prisma_1.default.course.findMany({
            include: {
                person: true,
                department_course: true
            }
        });
        res.status(200).send(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/student/:gradebook_id', (0, authPage_1.authRoleOrPerson)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.TEACHER, userRole_1.UserRole.STUDENT]), async (req, res) => {
    try {
        const result = await prisma_1.default.course_students.findMany({
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//get students for each course by teacher id
router.get('/students', (0, authPage_1.authRole)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.TEACHER]), async (req, res) => {
    try {
        const result = await prisma_1.default.course.findMany({
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/:id', (0, authPage_1.authRole)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.TEACHER]), async (req, res) => {
    try {
        const result = await prisma_1.default.course.findUnique({
            where: {
                id: Number(req.params.id),
            },
            include: {
                person: true,
            }
        });
        res.status(200).send(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const newCourse = await prisma_1.default.course.create({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
//add new student to course
router.post('/:id/students', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const newCourseStudent = await prisma_1.default.course_students.create({
            data: {
                ...req.body,
                course_id: Number(req.params.id),
            }
        });
        res.status(201).send(newCourseStudent);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//get all course students
router.get('/:id/students', (0, authPage_1.authRole)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.TEACHER]), async (req, res) => {
    try {
        const result = await prisma_1.default.course_students.findMany({
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//update course, add a new teacher as the course teacher
router.put('/:id/teacher', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const updatedCourse = await prisma_1.default.course.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                ...req.body,
            }
        });
        res.status(200).send(updatedCourse);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
router.put('/:id', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const updatedCourse = await prisma_1.default.course.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                ...req.body,
            }
        });
        res.status(200).send(updatedCourse);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
router.delete('/:id', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const deletedCourse = await prisma_1.default.course.delete({
            where: {
                id: Number(req.params.id),
            }
        });
        res.status(204).send(deletedCourse);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=courses.js.map