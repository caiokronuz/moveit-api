import express from 'express';

import {verifyAuth} from './middlewares/auth';
import UserController from './controllers/UserController';
import StatusController from './controllers/StatusController';

const routes = express.Router();

const userController = new UserController();
const statusController = new StatusController();

routes.post('/register', userController.create);
routes.post('/login', userController.login);

routes.put('/status',verifyAuth, statusController.update)

export default routes;