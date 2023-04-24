import {Request, Response} from "express";
import prisma from "../../prisma";

export const facultiesController = () =>{
    const getFaculties = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.faculty.findMany({
                include: {
                    department: true,
                    person: true,
                },
            });
            res.status(200).send(result);
        }
        catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const getFacultyById = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.faculty.findUnique({
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
        catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const createFaculty = async (req: Request, res: Response) =>{
        try {
            const newFaculty = await prisma.faculty.create({
                data: {
                    name: req.body.name,
                    person_id: Number(req.body.person_id),
                }
            });
            res.status(201).send(newFaculty);
        }
        catch (err: any) {
            console.log(err)
            res.status(500).json({ error: err.message });
        }
    }
    const updateFaculty = async (req: Request, res: Response) =>{
        try {
            const updatedFaculty = await prisma.faculty.update({
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
        catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const deleteFaculty = async (req: Request, res: Response) =>{
        try {
            const deletedFaculty = await prisma.faculty.delete({
                where: {
                    id: Number(req.params.id),
                }
            });
            res.status(204).send(deletedFaculty);
        }
        catch (err: any) {
            console.log(err)
            res.status(500).json({ error: err.message });
        }

    }

    return{
        getFaculties,
        getFacultyById,
        createFaculty,
        updateFaculty,
        deleteFaculty
    }
}