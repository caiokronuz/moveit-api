import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import routes from "./routes";

dotenv.config({path:'../.env'});
const app = express();

app.use(express.json());
app.use(cors());
app.use(routes)

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})