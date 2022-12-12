import { Router } from 'express';
import prisma from '../prisma';
import { authRole, authRoleOrPerson } from '../middleware/authPage';
import { UserRole } from '../enums/userRole';

const router = Router();
