import {Request, Response} from 'express';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();
 
const SECRET_TOKEN: string | undefined = process.env.SECRET_TOKEN;

function generateToken(id: number){
    if(SECRET_TOKEN){
        return jwt.sign({id}, SECRET_TOKEN, {
            expiresIn: 86400,
        })
    }else{
        console.log("no secret provided")
    }
}

async function verifyUserEmail(email: string){
    const user = await sql`SELECT * FROM users WHERE users.email = ${email} `
    
    return user.rowCount;
}

export default class UserController {
    async create(req: Request, res: Response){
        let {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).send({error: "Dados faltando. verifique suas informações e tente novamente."})
        }

        const verifyEmail = await verifyUserEmail(email);
        if(verifyEmail == 1){
            return res.status(400).send({error: "Já existe um usuário cadastrado com esse email."});
        }

        password = await bcrypt.hash(password, 10)

        try{
            await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${password})`;

            const user = (await sql`SELECT * FROM users WHERE users.email = ${email}`).rows[0]

            await sql`INSERT INTO status ("user", level, experience, challenges_completed) VALUES (${user.id}, 1, 0, 0)`
            
            const status = (await sql`SELECT * FROM status WHERE status.user = ${user.id}`).rows[0]
            const token = generateToken(user.id);

            user.password = undefined;
            return res.status(200).send({user, status, token})
        }catch(err){
            console.log(err);
            return res.status(500).send({error: "Ocorreu um erro inesperado enquanto estavamos criando sua conta. Por favor tente novamente."})
        }
    }

    async login(req: Request, res: Response){
        let {email, password} = req.body;
       
        if(!email || !password){
            return res.status(400).send({error: "Dados faltando. Verifique suas informações e tente novamente"})
        }

        const verifyEmail = await verifyUserEmail(email);
        console.log("VERIFY EMAIL ",verifyEmail)
        if(verifyEmail == 0){
            return res.status(400).send({error: "Email ou senha incorreto"});
        }

        try{
            const user = (await sql`SELECT * FROM users WHERE users.email = ${email}`).rows[0]

            if(!await bcrypt.compare(password, user.password)){
                return res.status(400).send({error: "Email ou senha incorreto"});
            }

            const status = (await sql`SELECT * FROM status WHERE status.user = ${user.id}`).rows[0]

            user.password = undefined;

            const token = generateToken(user.id);
            
            return res.send({user, status, token});
        }catch(err){
            console.log(err);
            return res.status(400).send({error: "Ocorreu um erro inesperado enquanto autenticavamos sua conta. Por favor tente novamente."})
        }
    }

}