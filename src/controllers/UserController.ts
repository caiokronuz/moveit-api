import {Request, Response} from 'express';
import db from '../database/connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config();
 
const SECRET_TOKEN: any = process.env.SECRET_TOKEN;

function generateToken(id: number){
    return jwt.sign({id}, SECRET_TOKEN, {
        expiresIn: 86400,
    })
}

async function verifyUserEmail(email: string){
    const user = await db('users').whereRaw('users.email = ?', [email]);
    return user.length;
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

        const database = await db.transaction();

        try{
            const insertedUserId = await database('users').insert({
                name,
                email,
                password
            });

            const user_id = insertedUserId[0];

            await database('status').insert({
                user: user_id,
                level: 1,
                experience: 0,
                challenges_completed: 0
            });

            const user = await database('users').whereRaw('id = ?', [user_id]);
            const status = await database('status').whereRaw('user = ?', [user_id]);
            const token = generateToken(user_id);

            user[0].password = undefined;

            await database.commit();
            return res.status(200).send({user, status, token})
        }catch(err){
            console.log(err);
            await database.rollback();
            return res.status(500).send({error: "Ocorreu um erro inesperado enquanto estavamos criando sua conta. Por favor tente novamente."})
        }
    }

    async login(req: Request, res: Response){
        let {email, password} = req.body;
       
        if(!email || !password){
            return res.status(400).send({error: "Dados faltando. Verifique suas informações e tente novamente"})
        }

        const verifyEmail = await verifyUserEmail(email);
        if(verifyEmail == 0){
            return res.status(400).send({error: "Email ou senha incorreto"});
        }

        try{
            const user = await db('users').whereRaw('users.email = ?', [email]);
            const status = await db('status').whereRaw('user = ?', [user[0].id]);

            if(!await bcrypt.compare(password, user[0].password)){
                return res.status(400).send({error: "Email ou senha incorreto"});
            }

            user[0].password = undefined;

            const token = generateToken(user[0].id);
            
            return res.send({user, status, token});

        }catch(err){
            console.log(err);
            return res.status(400).send({error: "Ocorreu um erro inesperado enquanto autenticavamos sua conta. Por favor tente novamente."})
        }
    }

}