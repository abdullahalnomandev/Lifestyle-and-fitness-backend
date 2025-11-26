import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { ClubController } from './club.controller';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    ClubController.createClub
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    ClubController.getAllClubs
  );

router
  .route('/all-clubs')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    ClubController.getClubs
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    ClubController.getSingleClub
  )
  .patch(
    fileUploadHandler(),
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    ClubController.updateClub
  )

  .delete(auth(USER_ROLES.ADMIN), ClubController.deleteClub);

router
  .route('/:clubId/members')
  .post(auth(USER_ROLES.ADMIN), ClubController.addMemberToClub);

router
  .route('/:clubId/join')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ClubController.joinClub
  );

router
  .route('/:clubId/members/:userId')
  .delete(auth(USER_ROLES.ADMIN), ClubController.removeMemberFromClub);

router.route('/creator/:creatorId').get(ClubController.getClubsByCreator);
router.post(
  '/leave-club/:clubId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ClubController.leaveClub
);

router.get(
  '/is-last-member/:clubId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ClubController.isLastMember
);

router.post(
  '/close-club-request/:clubId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ClubController.createCloseClubRequest
);

router.get(
  '/leave-club/status/:clubId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ClubController.getClubCloseStatus
);


export const ClubRoutes = router;
