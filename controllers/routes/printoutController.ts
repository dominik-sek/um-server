import {Request, Response} from "express";
import prisma from "../../prisma";

export const printoutController =  () =>{
    const getPrintout = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.printouts.findMany({
                select: {
                    id: true,
                    description: true,
                    url: true,
                }
            })
            res.status(200).send(result);
        }
        catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const postPrintout = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.printouts.create({
                data: {
                    description: req.body.description,
                    url: req.body.url,
                }
            });
            res.status(200).send(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    const deletePrintout = async (req: Request, res: Response) =>{
        try {
            const result = await prisma.printouts.delete({
                where: {
                    id: Number(req.params.id),
                }
            });
            res.status(200).send(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
    return{
        getPrintout,
        postPrintout,
        deletePrintout
    }
}