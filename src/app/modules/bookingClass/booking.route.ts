import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ClassController } from './booking.controller';

const router = express.Router();

router
    .route('/')
    .post(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        ClassController.createBookingClass
    )




router.get('/success', ClassController.orderSuccess);
router.get('/success', ClassController.orderSuccess);

router.get('/attandence-list/book/:class_booking_ref_id',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    ClassController.getBookingAttendance);

router.post('/cancel-attendence/:class_booking_ref_id',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    ClassController.cancelAttendence);

router.get('/attandence-list/:club_id/:class_id/:class_start_date',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    ClassController.getAllBookingAttendance);

router.post('/waiting-list',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    ClassController.addToWaitingList);

// router
//     .route('/:club_id')
//     .get(
//         auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
//         ClassController.getBookingClassesByClubId
//     )



export const BookingClassRoutes = router;
