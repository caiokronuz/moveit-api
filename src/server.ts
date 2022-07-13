import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import routes from "./routes";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(routes)

app.listen(process.env.PORT || 3333, () => {
    console.log("server running")
})