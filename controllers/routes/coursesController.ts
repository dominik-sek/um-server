import {Request, Response} from "express";
import prisma from "../../prisma";

export const coursesController = () =>{
    const getCourses = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.course.findMany({
                include: {
                    person: true,
                    // @ts-ignore prisma does not recognize this for some reason ¯\_(ツ)_/¯
                    department_course: true
                }
            });
            res.status(200).send(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
    const getCourseById = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.course.findUnique({
                where: {
                    id: Number(req.params.id),
                },
                include: {
                    person: true,
                }
            });
            res.status(200).send(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const getCourseStudentGrades = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.course_students.findMany({
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
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const getCourseStudents = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.course_students.findMany({
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
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    //could've been a plural name but its clearer this way:
    const getAllStudentsInAllCourses = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.course.findMany({
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
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const createCourse = async (req: Request, res: Response) =>{
        try {
            const newCourse = await prisma.course.create({
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
        } catch (err: any) {
            console.log(err)
            res.status(500).json({ error: err.message });
        }
    }
    const createCourseStudent = async (req: Request, res: Response) =>{
        try {
            const newCourseStudent = await prisma.course_students.create({
                data: {
                    ...req.body,
                    course_id: Number(req.params.id),
                }
            });
            res.status(201).send(newCourseStudent);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const updateCourse = async (req: Request, res: Response) =>{
        try {
            const updatedCourse = await prisma.course.update({
                where: {
                    id: Number(req.params.id),
                },
                data: {
                    ...req.body,
                }
            });
            res.status(200).send(updatedCourse);
        } catch (err: any) {
            console.log(err)
            res.status(500).json({ error: err.message });
        }
    }
    const deleteCourse = async (req: Request, res: Response) =>{
        try {
            const deletedCourse = await prisma.course.delete({
                where: {
                    id: Number(req.params.id),
                }
            });
            res.status(204).send(deletedCourse);
        } catch (err: any) {
            console.log(err)
            res.status(500).json({ error: err.message });
        }


    }

    return{
        getCourses,
        getCourseById,
        getCourseStudents,
        getAllStudentsInAllCourses,
        getCourseStudentGrades,
        createCourse,
        createCourseStudent,
        updateCourse,
        deleteCourse
    }
}