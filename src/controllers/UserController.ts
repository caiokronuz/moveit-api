import {Request, Response} from 'express';
import db from '../database/connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function generateToken(id){
    return jwt.sign({id}, 'test', {
        expiresIn: 86400,
    })
}

async function verifyUserEmail(email){
    const user = await db('users').whereRaw('users.email = ?', [email]);
    return user.length;
}

export default class UserController {
    async create(req: Request, res: Response){
        let {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).send({error: "Invalid data, verify your informations and try again"})
        }

        const verifyEmail = await verifyUserEmail(email);
        if(verifyEmail == 1){
            return res.status(400).send({error: "User already exists"});
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
                level: 0,
                experience: 0,
                challenges_completed: 0
            });

            await database.commit();
            return res.status(200).send({success: "User registered successfully!"})
        }catch(err){
            console.log(err);
            await database.rollback();
            return res.status(500).send({error: "Unexpected error while creating your account, please try again"})
        }
    }

    async login(req: Request, res: Response){
        let {email, password} = req.body;
       
        if(!email || !password){
            return res.status(400).send({error: "Invalid data, verify your informations and try again"})
        }

        const verifyEmail = await verifyUserEmail(email);
        if(verifyEmail == 0){
            return res.status(400).send({error: "Email or password invalid"});
        }

        try{
            const user = await db('users').whereRaw('users.email = ?', [email]);
            const status = await db('status').whereRaw('user = ?', [user[0].id]);

            if(!await bcrypt.compare(password, user[0].password)){
                return res.status(400).send({error: "Email or password invalid"});
            }

            user[0].password = undefined;

            const token = generateToken(user[0].id);
            
            return res.send({user, status, token});

        }catch(err){
            console.log(err);
            return res.status(400).send({error: "Unexpected error while authenticate your account, please try again"})
        }
    }

}