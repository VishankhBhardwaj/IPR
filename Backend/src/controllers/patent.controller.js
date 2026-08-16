const prisma = require("../config/prisma");

const STATUS_COLUMNS = ["GRANTED", "PUBLISHED", "APPLIED"];
const TYPE_COLUMNS = ["DESIGN", "UTILITY"];

const patentInclude = {
    inventors: {
        include: {
            departments: {
                include: {
                    department: true
                }
            }
        },
        orderBy: {
            id: "asc"
        }
    }
};

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
    if (status.startsWith("APPLI") || status === "APPLIED") return "APPLIED";
    return status;
};

const normalizePatentType = (value) => {
    const type = cleanText(value)?.toUpperCase();
    if (!type) return undefined;
    if (type === "U" || type.startsWith("UTIL")) return "UTILITY";
    if (type === "D" || type.startsWith("DESIGN")) return "DESIGN";
    return type;
};

const normalizeDesignation = (value) => {
    const designation = cleanText(value)?.toUpperCase().replace(/[\s-]+/g, "_");
    if (!designation) return undefined;

    const designationMap = {
        STUDENT: "STUDENT",
        ASSISTANT_PROFESSOR: "ASSISTANT_PROFESSOR",
        ASSISTANTPROFESSOR: "ASSISTANT_PROFESSOR",
        ASSOCIATE_PROFESSOR: "ASSOCIATE_PROFESSOR",
        ASSOCIATEPROFESSOR: "ASSOCIATE_PROFESSOR",
        PROFESSOR: "PROFESSOR"
    };

    return designationMap[designation];
};

const normalizeDepartments = (departments) => {
    if (Array.isArray(departments)) {
        return departments
            .map(cleanText)
            .filter(Boolean);
    }

    return String(departments || "")
        .split(",")
        .map(cleanText)
        .filter(Boolean);
};

const parseInventors = (inventors) => {
    if (!Array.isArray(inventors)) return [];

    return inventors
        .map((inventor) => {
            const name = cleanText(inventor.name);
            const designation = normalizeDesignation(inventor.designation);
            const departments = normalizeDepartments(inventor.departments);
            const instituteAffiliation = cleanText(inventor.instituteAffiliation || inventor.affiliation) || "Not Specified";

            if (!name || !designation || departments.length === 0) return null;

            return {
                name,
                designation,
                departments: [...new Set(departments)],
                instituteAffiliation
            };
        })
        .filter(Boolean);
};

const getInventorNameText = (inventors, fallback) => {
    const names = parseInventors(inventors).map((inventor) => inventor.name);
    return names.length > 0 ? names.join(", ") : cleanText(fallback);
};

const formatPatent = (patent) => {
    if (!patent) return patent;

    return {
        ...patent,
        inventors: (patent.inventors || []).map((inventor) => ({
            id: inventor.id,
            name: inventor.name,
            designation: inventor.designation,
            instituteAffiliation: inventor.instituteAffiliation || "Not Specified",
            departments: (inventor.departments || []).map((item) => item?.department?.name).filter(Boolean)
        }))
    };
};

const syncPatentInventors = async (tx, patentId, inventors) => {
    const parsedInventors = parseInventors(inventors);

    await tx.patentInventor.deleteMany({
        where: { patentId }
    });

    for (const inventor of parsedInventors) {
        const createdInventor = await tx.patentInventor.create({
            data: {
                name: inventor.name,
                designation: inventor.designation,
                instituteAffiliation: inventor.instituteAffiliation || "Not Specified",
                patentId
            }
        });

        for (const departmentName of inventor.departments) {
            const department = await tx.department.upsert({
                where: { name: departmentName },
                update: {},
                create: { name: departmentName }
            });

            await tx.inventorDepartment.create({
                data: {
                    inventorId: createdInventor.id,
                    departmentId: department.id
                }
            });
        }
    }
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
        "driveLink",
        "patentSession",
        "weblink",
        "country",
        "department"
    ];

    const data = {};
    fields.forEach((field) => {
        if (!partial || body[field] !== undefined) {
            const value = field === "inventorName"
                ? getInventorNameText(body.inventors, body[field])
                : cleanText(body[field]);
            if (value !== undefined) data[field] = value;
        }
    });

    if (body.inventors !== undefined) {
        const inventorName = getInventorNameText(body.inventors, body.inventorName);
        if (inventorName) data.inventorName = inventorName;
    }

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
        if (body.filedDate) {
            data.filedDate = parseRequiredDate(body.filedDate, "filedDate");
        }
    }

    if (!partial || body.publicationDate !== undefined) {
        if (body.publicationDate) {
            data.publicationDate = parseRequiredDate(body.publicationDate, "publicationDate");
        } else {
            data.publicationDate = null;
        }
    }

    if (userId) {
        data.userId = parseInt(userId, 10);
    }

    return data;
};

const getAllPatents = async (req, res) => {
    try {
        const data = await prisma.patent.findMany({
            include: patentInclude,
            orderBy: [
                { year: "desc" },
                { publicationDate: "desc" }
            ]
        });
        return res.status(200).json({
            success: true,
            data: data.map(formatPatent)
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
        const inventors = parseInventors(req.body.inventors);
        if (
            !req.body.applicationNo ||
            (!req.body.inventorName && inventors.length === 0) ||
            !req.body.patentTitle ||
            !req.body.applicantName ||
            !req.body.filedDate ||
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
        const newPatent = await prisma.$transaction(async (tx) => {
            const patent = await tx.patent.create({
                data: buildPatentData(req.body, userId)
            });

            if (req.body.inventors !== undefined) {
                await syncPatentInventors(tx, patent.id, req.body.inventors);
            }

            return tx.patent.findUnique({
                where: { id: patent.id },
                include: patentInclude
            });
        });
        res.status(201).json({
            success: true,
            data: formatPatent(newPatent)
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
        const patentId = parseInt(id);
        const updatedPatent = await prisma.$transaction(async (tx) => {
            await tx.patent.update({
                where: { id: patentId },
                data: buildPatentData(req.body, req.body.userId, { partial: true })
            });

            if (req.body.inventors !== undefined) {
                await syncPatentInventors(tx, patentId, req.body.inventors);
            }

            return tx.patent.findUnique({
                where: { id: patentId },
                include: patentInclude
            });
        });

        res.status(200).json({
            success: true,
            data: formatPatent(updatedPatent)
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
        const userId = req.userId; // Provided by auth middleware

        const patent = await prisma.patent.findUnique({
            where: { id: parseInt(id) }
        });

        if (!patent) {
            return res.status(404).json({ success: false, message: "Patent not found" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.role !== "ADMIN" && patent.userId !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to delete this patent" });
        }

        const deletedPatent = await prisma.patent.delete({ where: { id: parseInt(id) } });
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
    try {
        const { id } = req.params;
        const patent = await prisma.patent.findUnique({
            where: { id: parseInt(id) },
            include: patentInclude
        });
        if (!patent) {
            return res.status(404).json({
                success: false,
                message: "Patent not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: formatPatent(patent)
        });
    } catch (error) {
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
