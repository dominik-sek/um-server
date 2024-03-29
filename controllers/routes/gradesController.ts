import {Request, Response} from "express";
import prisma from "../../prisma";
import PDFGenerator from "pdfkit";
import {getTimestamp} from "../../functions/getTimestamp";
const PDFTable = require('voilab-pdf-table');


export const gradesController = () =>{
    const getGrades = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.grade.findMany({
                include: {
                    gradebook: true,
                }
            });
            res.status(200).send(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }

    }
    const getGradesByGradebookId = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.grade.findMany({
                where: {
                    gradebook_id: Number(req.params.gradebook_id),
                },
                include: {
                    gradebook: true,
                    course: true,
                }
            });
            res.status(200).send(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const getGradesByTeacherId = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.course.findMany({
                where: {
                    person_id: Number(req.user?.person_id),
                },
                select: {
                    grade: true,
                    name: true,
                    type: true,
                    id: true,
                }
            });
            res.status(200).send(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const getGradesByCourseId = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.grade.findMany({
                where: {
                    course_id: Number(req.params.course_id),
                },
                include: {
                    gradebook: true,
                }
            });
            res.status(200).send(result);
        }
        catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const getGradebookPDF = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.grade.findMany({
                where: {
                    gradebook_id: Number(req.params.gradebook_id),
                },
                include: {
                    gradebook: {
                        include: {
                            person: true,
                        }
                    },
                    course: {
                        include: {
                            person: true,
                        }
                    },
                }
            });


            const student = await prisma.department_students.findUnique({
                where: {
                    gradebook_id: Number(req.params.gradebook_id),
                },
                include: {
                    department: {
                        include: {
                            faculty: true,
                        }
                    }
                }
            })
            console.log(student)
            console.log(result)
            const doc = new PDFGenerator();
            doc.fontSize(18).text('Podsumowanie indeksu na dzien ' + new Date(getTimestamp()).toLocaleDateString(), {
                align: 'center',
            });
            doc.moveDown();
            doc.fontSize(12);
            doc.text('Imie i nazwisko: ' + result[0].gradebook.person.first_name + ' ' + result[0].gradebook.person.last_name);
            doc.moveDown();
            doc.text('Nr indeksu: ' + result[0].gradebook_id);
            doc.moveDown();
            doc.text('Data urodzenia: ' + new Date(result[0].gradebook.person.birth_date).toLocaleDateString());

            doc.moveTo(50, 200)
                .lineTo(550, 200)
                .stroke();
            doc.moveDown().moveDown();
            doc.text('Informacje o toku studiow: ');
            doc.moveDown();
            doc.text('Semestr: ' + result[0].gradebook.semester);
            doc.moveDown();
            doc.text('Kierunek: ' + student?.department.name);
            doc.moveDown();
            doc.text('Wydzial: ' + student?.department.faculty.name);
            doc.moveDown();
            doc.text('Tryb studiow: ' + student?.department.study_type);
            doc.moveDown()
            //line stroke from current y position to max y position
            doc.moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke()
                .moveDown();

            doc.text('Przedmioty: ').moveDown();

            const table = new PDFTable(doc, {
                bottomMargin: 30,
                topMargin: 30
            })
            table
                .addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
                    column: 'name'
                }))
                .setColumnsDefaults({
                    headerBorder: 'B',
                    align: 'center'
                })
                .addColumns([
                    {
                        id: 'name',
                        header: 'Nazwa przedmiotu',
                        width: 300,

                    },
                    {
                        id: 'type',
                        header: 'Typ przedmiotu',
                        width: 100,
                    },
                    {
                        id: 'grade',
                        header: 'Ocena',
                        width: 100,
                    },
                    {
                        id: 'teacher',
                        header: 'Prowadzacy',
                        width: 100,
                    },
                    {
                        id: 'date',
                        header: 'Data wpisu',
                        width: 100,
                    },
                ])
                .addBody(result.map((item) => {
                    return {
                        name: item.course.name,
                        type: item.course.type.substring(0, 1).toUpperCase(),
                        grade: item.grade,
                        teacher: item.course.person.first_name + ' ' + item.course.person.last_name,
                        date: new Date(item.entry_time).toLocaleDateString(),
                    }
                }))

            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=gradebook.pdf',
            });
            //pipe the pdf file to the response
            doc.pipe(res);

            doc.end();

            //send the pdf file to the client

        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const createGrade = async (req: Request, res: Response) => {
        try {
            const newGrade = await prisma.grade.create({
                data: {
                    gradebook_id: req.body.gradebook_id,
                    course_id: req.body.course_id,
                    grade: parseFloat(req.body.grade),
                    entry_time: new Date(getTimestamp())
                }
            });
            res.status(201).send(newGrade);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const updateGrade = async (req: Request, res: Response) => {
        try {
            const updatedGrade = await prisma.grade.update({
                where: {
                    grade_Id: Number(req.params.grade_id),
                },
                data: {
                    grade: parseFloat(req.body.grade),
                    entry_time: new Date(getTimestamp())
                },
            });
            res.status(200).send(updatedGrade);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const deleteGrade = async (req: Request, res: Response) => {
        try {
            const deletedGrade = await prisma.grade.delete({
                where: {
                    grade_Id: Number(req.params.grade_id),
                },
            });
            res.status(200).send(deletedGrade);
        }
        catch (err: any) {
            res.status(500).json({ error: err.message });
        }

    }

    return{
        getGrades,
        getGradesByGradebookId,
        getGradesByTeacherId,
        getGradesByCourseId,
        getGradebookPDF,
        createGrade,
        updateGrade,
        deleteGrade,
    }
}