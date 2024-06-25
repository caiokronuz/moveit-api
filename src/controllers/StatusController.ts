import {Request, Response} from 'express';
import db from '../database/connection';

export default class StatusController{
    async update(req: any, res: Response){
        const id = req.userId;
        const {level, experience, challenges_completed} = req.body;

        if(!level || !experience || !challenges_completed){
            return res.status(400).send({error: "Invalid data, verify your informations and try again"})
        }

        try{
            await db('status').whereRaw('user = ?', [id]).update({
                level,
                experience,
                challenges_completed
            })

            return res.status(200).send({message: "status successfully updated"});
        }catch(err){
            console.log(err);
            return res.status(500).send({error: "Unexpected error while updating your status, please try again"})
        }

    }
}