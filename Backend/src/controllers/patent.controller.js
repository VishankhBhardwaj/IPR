const prisma = require("../config/prisma");

const getAllPatents = async (req, res) => {
    try {
        const { year, applicationNo, status, patentType } = req.query;
        let where = {};
        
        if (year) {
            where.year = parseInt(year);
        }
        if (applicationNo) {
            where.applicationNo = { contains: applicationNo };
        }
        if (status) {
            where.status = status;
        }
        if (patentType) {
            where.patentType = patentType;
        }

        const data = await prisma.patent.findMany({
            where,
            orderBy: { createdAt: 'desc' } // Optional: order by newest first
        });
        
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
const addPatent = async (req, res) => {
    try {
        const {
            applicationNo,
            status,
            inventorName,
            patentTitle,
            applicantName,
            filedDate,
            publicationDate,
            publicationNo,
            institueAffiliation,
            driveLink,
            year,
            patentType,
            patentSession,
            weblink,
            country,
            userId
        } = req.body;
        if (
            !applicationNo ||
            !inventorName ||
            !patentTitle ||
            !applicantName ||
            !filedDate ||
            !publicationDate ||
            !publicationNo ||
            !institueAffiliation ||
            !driveLink ||
            !year ||
            !patentType ||
            !patentSession ||
            !weblink ||
            !country ||
            !userId
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });
        }
        const newPatent = await prisma.patent.create({
            data: {
                applicationNo,
                status,
                inventorName,
                patentTitle,
                applicantName,
                filedDate: new Date(filedDate),
                publicationDate: new Date(publicationDate),
                publicationNo,
                institueAffiliation,
                driveLink,
                year: parseInt(year),
                patentType,
                patentSession,
                weblink,
                country,
                userId: parseInt(userId)
            }
        });
        res.status(201).json({
            success: true,
            data: newPatent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
const deletePatent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPatent = await prisma.patent.delete({where: { id: parseInt(id) }});
        res.status(200).json({
            success: true,
            data: deletedPatent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
const getPatentById = async (req, res) => {
    try{
        const {id} = req.params;
        const patent = await prisma.patent.findUnique({where: {id: parseInt(id)}});
        if(!patent){
            return res.status(404).json({
                success: false,
                message: "Patent not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: patent
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
module.exports = {
    getAllPatents,
    addPatent,
    deletePatent,
    getPatentById
};