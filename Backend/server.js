require("dotenv").config();
const PORT = process.env.PORT || 5000;
const app = require("./src/app");

const requiredInProduction = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL"];
if (process.env.NODE_ENV === "production") {
    const missing = requiredInProduction.filter((name) => !process.env[name]);
    if (missing.length) {
        throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
    }
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters in production");
    }
}

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const shutdown = (signal) => {
    console.log(`${signal} received; shutting down gracefully`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
