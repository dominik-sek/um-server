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
router.get('/', (0, authPage_1.authRole)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.TEACHER, userRole_1.UserRole.STUDENT]), async (req, res) => {
    try {
        const result = await prisma_1.default.printouts.findMany({
            select: {
                id: true,
                description: true,
                url: true,
            }
        });
        res.status(200).send(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/', (0, authPage_1.authRole)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.TEACHER]), async (req, res) => {
    try {
        const result = await prisma_1.default.printouts.create({
            data: {
                description: req.body.description,
                url: req.body.url,
            }
        });
        res.status(200).send(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/:id', (0, authPage_1.authRole)([userRole_1.UserRole.ADMIN, userRole_1.UserRole.TEACHER]), async (req, res) => {
    try {
        const result = await prisma_1.default.printouts.delete({
            where: {
                id: Number(req.params.id),
            }
        });
        res.status(200).send(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=printouts.js.map