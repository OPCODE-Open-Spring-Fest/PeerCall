import mongoose from "mongoose";
import app from "./app.js"

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI as string;
// console.log(MONGO_URI)

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log(" MongoDB Connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error(" DB connection failed:", err));
