import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { StripeController } from './stripe.controller';
const router = express.Router();


router.route('/create-link/:clubId').post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    (req: Request, res: Response, next: NextFunction) => {
        return StripeController.getAccountLink(req, res, next);
    })


export const StripeRoutes = router;