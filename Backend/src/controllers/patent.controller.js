const prisma = require("../config/prisma");

const STATUS_COLUMNS = ["GRANTED", "PUBLISHED"];
const TYPE_COLUMNS = ["DESIGN", "UTILITY"];

const cleanText = (value) => {
    if (value === undefined || value === null) return undefined;
    const text = String(value).trim();
    return text || undefined;
};

const normalizeStatus = (value) => {
    const status = cleanText(value)?.toUpperCase();
    if (!status) return undefined;
    if (status.startsWith("GRANT")) return "GRANTED";
    if (status.startsWith("PUBLISH")) return "PUBLISHED";
    return status;
};

const normalizePatentType = (value) => {
    const type = cleanText(value)?.toUpperCase();
    if (!type) return undefined;
    if (type === "U" || type.startsWith("UTIL")) return "UTILITY";
    if (type === "D" || type.startsWith("DESIGN")) return "DESIGN";
    return type;
};

const parseRequiredDate = (value, fieldName) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`${fieldName} must be a valid date`);
    }
    return date;
};

const buildPatentWhere = (query, options = {}) => {
    const ignore = new Set(options.ignore || []);
    const where = {};

    const applicantName = cleanText(query.applicantName);
    if (!ignore.has("applicantName") && applicantName && applicantName.toLowerCase() !== "all") {
        where.applicantName = { contains: applicantName };
    }

    const country = cleanText(query.country);
    if (!ignore.has("country") && country && country.toLowerCase() !== "all") {
        where.country = { contains: country };
    }

    const year = parseInt(query.year, 10);
    if (!ignore.has("year") && !Number.isNaN(year)) {
        where.year = year;
    }

    const status = normalizeStatus(query.status);
    if (!ignore.has("status") && status) {
        where.status = status;
    }

    const patentType = normalizePatentType(query.patentType || query.utilityDesign);
    if (!ignore.has("patentType") && patentType) {
        where.patentType = patentType;
    }

    return {
        ...where,
        ...(options.force || {})
    };
};

const makeEmptyTotals = (columns) => {
    return columns.reduce((total, column) => {
        total[column.toLowerCase()] = 0;
        return total;
    }, {});
};

const getCount = (group) => {
    return group._count?.applicationNo || group._count?._all || 0;
};

const buildPivotTable = ({ title, groupedData, rowField, rowLabelKey, columnField, columns, filters }) => {
    const rowsByKey = new Map();
    const grandTotal = {
        [rowLabelKey]: "Grand Total",
        ...makeEmptyTotals(columns),
        grandTotal: 0
    };

    groupedData.forEach((group) => {
        const rawRowLabel = group[rowField] ?? "Unknown";
        const rowMapKey = String(rawRowLabel);
        const columnKey = String(group[columnField] || "").toUpperCase();

        if (!columns.includes(columnKey)) return;

        if (!rowsByKey.has(rowMapKey)) {
            rowsByKey.set(rowMapKey, {
                [rowLabelKey]: rawRowLabel,
                ...makeEmptyTotals(columns),
                grandTotal: 0
            });
        }

        const count = getCount(group);
        const normalizedColumn = columnKey.toLowerCase();
        const row = rowsByKey.get(rowMapKey);

        row[normalizedColumn] += count;
        row.grandTotal += count;
        grandTotal[normalizedColumn] += count;
        grandTotal.grandTotal += count;
    });

    const rows = Array.from(rowsByKey.values()).sort((left, right) => {
        if (rowField === "year") return Number(left[rowLabelKey]) - Number(right[rowLabelKey]);
        return String(left[rowLabelKey]).localeCompare(String(right[rowLabelKey]));
    });

    return {
        title,
        filters,
        columns: [...columns.map((column) => column.toLowerCase()), "grandTotal"],
        rows,
        grandTotal
    };
};

const buildPatentData = (body, userId, { partial = false } = {}) => {
    const fields = [
        "applicationNo",
        "inventorName",
        "patentTitle",
        "applicantName",
        "publicationNo",
        "institueAffiliation",
        "driveLink",
        "patentSession",
        "weblink",
        "country",
        "department"
    ];

    const data = {};
    fields.forEach((field) => {
        if (!partial || body[field] !== undefined) {
            const value = cleanText(body[field]);
            if (value !== undefined) data[field] = value;
        }
    });

    if (!partial || body.status !== undefined) {
        const status = normalizeStatus(body.status);
        if (status) data.status = status;
    }

    if (!partial || body.patentType !== undefined) {
        const patentType = normalizePatentType(body.patentType);
        if (patentType) data.patentType = patentType;
    }

    if (!partial || body.year !== undefined) {
        const year = parseInt(body.year, 10);
        if (!Number.isNaN(year)) data.year = year;
    }

    if (!partial || body.filedDate !== undefined) {
        data.filedDate = parseRequiredDate(body.filedDate, "filedDate");
    }

    if (!partial || body.publicationDate !== undefined) {
        data.publicationDate = parseRequiredDate(body.publicationDate, "publicationDate");
    }

    if (userId) {
        data.userId = parseInt(userId, 10);
    }

    return data;
};

const getAllPatents = async (req, res) => {
    try {
        const data = await prisma.patent.findMany({
            orderBy: [
                { year: "desc" },
                { publicationDate: "desc" }
            ]
        });
        return res.status(200).json({
            success: true,
            data: data
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
const addPatent = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        if (
            !req.body.applicationNo ||
            !req.body.inventorName ||
            !req.body.patentTitle ||
            !req.body.applicantName ||
            !req.body.filedDate ||
            !req.body.publicationDate ||
            !req.body.publicationNo ||
            !req.body.institueAffiliation ||
            !req.body.driveLink ||
            !req.body.year ||
            !req.body.patentType ||
            !req.body.patentSession ||
            !req.body.weblink ||
            !req.body.country ||
            !userId
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });
        }
        const newPatent = await prisma.patent.create({
            data: buildPatentData(req.body, userId)
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
const updatePatent = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPatent = await prisma.patent.update({
            where: { id: parseInt(id) },
            data: buildPatentData(req.body, req.body.userId, { partial: true })
        });

        res.status(200).json({
            success: true,
            data: updatedPatent
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
const getPatentAnalysis = async (req, res) => {
    try {
        const baseWhere = buildPatentWhere(req.query);
        const byYearStatusWhere = buildPatentWhere(req.query, {
            ignore: ["status"]
        });
        const byYearTypeWhere = buildPatentWhere(req.query, {
            ignore: ["patentType"]
        });
        const utilityStatusWhere = buildPatentWhere(req.query, {
            ignore: ["status", "patentType"],
            force: { patentType: "UTILITY" }
        });
        const utilityCountryWhere = buildPatentWhere(req.query, {
            ignore: ["status", "patentType", "country"],
            force: { patentType: "UTILITY" }
        });

        const [
            statusByYear,
            typeByYear,
            utilityStatusByYear,
            utilityStatusByCountry,
            totalPatents
        ] = await prisma.$transaction([
            prisma.patent.groupBy({
                by: ["year", "status"],
                where: byYearStatusWhere,
                _count: { applicationNo: true }
            }),
            prisma.patent.groupBy({
                by: ["year", "patentType"],
                where: byYearTypeWhere,
                _count: { applicationNo: true }
            }),
            prisma.patent.groupBy({
                by: ["year", "status"],
                where: utilityStatusWhere,
                _count: { applicationNo: true }
            }),
            prisma.patent.groupBy({
                by: ["country", "status"],
                where: utilityCountryWhere,
                _count: { applicationNo: true }
            }),
            prisma.patent.count({ where: baseWhere })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalPatents,
                tables: {
                    publishedGrantedByYear: buildPivotTable({
                        title: "Published Granted Details",
                        groupedData: statusByYear,
                        rowField: "year",
                        rowLabelKey: "year",
                        columnField: "status",
                        columns: STATUS_COLUMNS,
                        filters: {
                            applicantName: cleanText(req.query.applicantName) || "All"
                        }
                    }),
                    utilityDesignByYear: buildPivotTable({
                        title: "Utility / Design Details",
                        groupedData: typeByYear,
                        rowField: "year",
                        rowLabelKey: "year",
                        columnField: "patentType",
                        columns: TYPE_COLUMNS,
                        filters: {
                            applicantName: cleanText(req.query.applicantName) || "All"
                        }
                    }),
                    utilityStatusByYear: buildPivotTable({
                        title: "Year Wise Utility Patent Details",
                        groupedData: utilityStatusByYear,
                        rowField: "year",
                        rowLabelKey: "year",
                        columnField: "status",
                        columns: STATUS_COLUMNS,
                        filters: {
                            patentType: "UTILITY"
                        }
                    }),
                    utilityStatusByCountry: buildPivotTable({
                        title: "Country Wise Utility Patent Details",
                        groupedData: utilityStatusByCountry,
                        rowField: "country",
                        rowLabelKey: "country",
                        columnField: "status",
                        columns: STATUS_COLUMNS,
                        filters: {
                            patentType: "UTILITY"
                        }
                    })
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
module.exports = {
    getAllPatents,
    addPatent,
    updatePatent,
    deletePatent,
    getPatentById,
    getPatentAnalysis
};
