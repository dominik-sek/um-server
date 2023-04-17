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
        const result = await prisma_1.default.faculty.findMany({
            include: {
                department: true,
                person: true,
            },
        });
        res.status(200).send(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/:id', (0, authPage_1.authRole)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.TEACHER]), async (req, res) => {
    try {
        const result = await prisma_1.default.faculty.findUnique({
            where: {
                id: Number(req.params.id),
            },
            include: {
                department: true,
                person: true,
            },
        });
        res.status(200).send(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const newFaculty = await prisma_1.default.faculty.create({
            data: {
                name: req.body.name,
                person_id: Number(req.body.person_id),
            }
        });
        res.status(201).send(newFaculty);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
router.put('/:id', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const updatedFaculty = await prisma_1.default.faculty.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                name: req.body.name,
                person_id: Number(req.body.person_id),
            },
            include: {
                department: true,
                person: true,
            },
        });
        res.status(200).send(updatedFaculty);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/:id', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const deletedFaculty = await prisma_1.default.faculty.delete({
            where: {
                id: Number(req.params.id),
            }
        });
        res.status(204).send(deletedFaculty);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=faculties.js.map