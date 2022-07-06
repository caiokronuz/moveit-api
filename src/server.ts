import express, {Request, Response} from "express";

const app = express();

app.use(express.json());

app.use("/", (req:Request, res:Response) => {
    res.send({msg: "OK!"})
})

app.listen(3333, () => {
    console.log("server running")
})