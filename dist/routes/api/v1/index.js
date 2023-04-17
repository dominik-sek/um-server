"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./users"));
const courses_1 = __importDefault(require("./courses"));
const departments_1 = __importDefault(require("./departments"));
const faculties_1 = __importDefault(require("./faculties"));
const grades_1 = __importDefault(require("./grades"));
const printouts_1 = __importDefault(require("./printouts"));
const router = express_1.default.Router();
router.use('/users', users_1.default);
router.use('/courses', courses_1.default);
router.use('/departments', departments_1.default);
router.use('/faculties', faculties_1.default);
router.use('/grades', grades_1.default);
router.use('/printouts', printouts_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map