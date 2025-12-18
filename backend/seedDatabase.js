import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { seedCodeProblems } from "./utils/seedCodeProblems.js";

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting database seeding...");

        // Connect to database
        await connectDB();

        // Seed code problems
        await seedCodeProblems();

        console.log("✅ Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Database seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();