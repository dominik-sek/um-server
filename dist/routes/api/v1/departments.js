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
        const result = await prisma_1.default.department.findMany({
            include: {
                faculty: true,
            }
        });
        res.status(200).send(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/:id', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const result = await prisma_1.default.department.findUnique({
            where: {
                id: Number(req.params.id),
            },
            include: {
                faculty: true,
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
        const newDepartment = await prisma_1.default.department.create({
            data: {
                name: req.body.name,
                faculty_id: Number(req.body.faculty_id),
                degree: req.body.degree,
                length: req.body.length,
                study_type: req.body.study_type,
            }
        });
        res.status(201).send(newDepartment);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/:id', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const updatedDepartment = await prisma_1.default.department.update({
            where: {
                id: Number(req.params.id),
            },
            data: {
                ...req.body,
            }
        });
        res.status(200).send(updatedDepartment);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/:id', (0, authPage_1.authRole)(userRole_1.UserRole.ADMIN), async (req, res) => {
    try {
        const deletedDepartment = await prisma_1.default.department.delete({
            where: {
                id: Number(req.params.id),
            }
        });
        res.status(204).send(deletedDepartment);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=departments.js.map