const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const { generateToken } = require("../lib/token");

const normalizeDesignation = (value) => {
	if (!value) return null;

	const normalized = String(value).trim().toUpperCase().replace(/[\s-]+/g, "_");
	const designationMap = {
		STUDENT: "STUDENT",
		ASSISTANT_PROFESSOR: "ASSISTANT_PROFESSOR",
		ASSISTANTPROFESSOR: "ASSISTANT_PROFESSOR",
		ASSOCIATE_PROFESSOR: "ASSOCIATE_PROFESSOR",
		ASSOCIATEPROFESSOR: "ASSOCIATE_PROFESSOR",
		PROFESSOR: "PROFESSOR",
	};

	return designationMap[normalized] || null;
};

const registerUser = async (req, res) => {
	try {
		const { name, email, password, role, department, designation } =
			req.body;
		const normalizedDesignation = normalizeDesignation(designation);

		console.log("Registering user with data:", {
			name,
			email,
			role,
			department,
			designation: normalizedDesignation,
		});
		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "All required fields are mandatory",
			});
		}
		if (designation && !normalizedDesignation) {
			return res.status(400).json({
				success: false,
				message:
					"Designation must be STUDENT, ASSISTANT_PROFESSOR, ASSOCIATE_PROFESSOR, or PROFESSOR",
			});
		}
		const existingUser = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User with this email already exists",
			});
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await prisma.user.create({
			data: {
				name: name,
				email: email,
				password: hashedPassword,
				role: role || "STUDENT",
				department: department || null,
				designation: normalizedDesignation,
			},
		});
		const token = generateToken(newUser.id);
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 3600 * 1000,
		});
		return res.status(201).json({
			success: true,
			message: "User registered successfully",
			token: token,
			role: newUser.role,
			userId: newUser.id,
		});
	} catch (error) {
		console.error("Error in registerUser:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "All required fields are mandatory",
			});
		}
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid email or password",
			});
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				success: false,
				message: "Invalid email or password",
			});
		}
		const token = generateToken(user.id);
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 3600 * 1000,
		});
		return res.status(200).json({
			success: true,
			message: "User logged in successfully",
			token: token,
			role: user.role,
			userId: user.id,
		});
	} catch (error) {
		console.error("Error in loginUser:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const logoutUser = async (req, res) => {
	res.clearCookie("token", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});
	return res.status(200).json({
		success: true,
		message: "User logged out successfully",
	});
};

module.exports = {
	registerUser,
	loginUser,
	logoutUser,
};
