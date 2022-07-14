import jwt from 'jsonwebtoken';
const SECRET_TOKEN: any = process.env.SECRET_TOKEN;

export const verifyAuth = (req: any, res:any, next:any) => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({error: "No token provided"});
    }

    const parts = authHeader.split(' ');

    if(parts.length !== 2){
        return res.status(401).send({error: "Token error"});
    }

    const [scheme, token] = parts;

    if(scheme != "Bearer"){
        return res.status(401).send({error: "Token malformatted"});
    }

    jwt.verify(token, SECRET_TOKEN, (err: any, decoded: any) => {
        if(err){
            return res.status(401).send({error: "Token invalid"});
        }

        req.userId = decoded.id;
        return next();
    })

}