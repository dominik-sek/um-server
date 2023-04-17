"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoleOrPerson = exports.authRole = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const authRole = (role) => {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).send('Unauthorized');
        }
        else {
            const findPerson = await prisma_1.default.person.findUnique({
                where: {
                    id: req.user.person_id
                }
            });
            role = Array.isArray(role) ? role : [role];
            const hasPermission = role.some((r) => r === findPerson?.role);
            if (!hasPermission) {
                res.status(403).send('Forbidden');
            }
            else {
                next();
            }
        }
    };
};
exports.authRole = authRole;
const authRoleOrPerson = (role) => {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).send('Unauthorized');
        }
        else {
            const findPerson = await prisma_1.default.person.findUnique({
                where: {
                    id: req.user.person_id
                }
            });
            role = Array.isArray(role) ? role : [role];
            const hasPermission = role.some((r) => r === findPerson?.role);
            const isPerson = findPerson?.id === parseInt(req.params.id);
            if (hasPermission || isPerson) {
                next();
            }
            else {
                res.status(403).send('Forbidden');
            }
        }
    };
};
exports.authRoleOrPerson = authRoleOrPerson;
//# sourceMappingURL=authPage.js.map