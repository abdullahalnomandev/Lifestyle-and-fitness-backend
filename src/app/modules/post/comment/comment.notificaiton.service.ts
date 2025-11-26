import { Types } from 'mongoose';
import { sendNotification } from '../../../../shared/sendNotification';
import { Follower } from '../../user/follower/follower.model';
import { IUserNotificationSettings } from '../../user/notificaiton_settings/notifation_sttings.interface';
import { NOTIFICATION_OPTION } from '../../user/notificaiton_settings/notification_settings.constant';
import { User } from '../../user/user.model';

export interface INotificationEventProps {
  sender: string;
  refId: string;
  deleteReferenceId: string | Types.ObjectId;
  receiver: string;
  type?: 'comment' | 'like';
  taggedUsers?: Types.ObjectId[];
  fcmToken?:string;
}

export const createNotification = async ({
  sender,
  refId,
  deleteReferenceId,
  receiver,
  fcmToken
}: INotificationEventProps) => {

  const userNotificationSettings = await User.findById(receiver, '-_id notification_settings')
    .populate('notification_settings')
    .lean();

  const { comments_on_your_posts } = userNotificationSettings?.notification_settings as IUserNotificationSettings;

  const shouldSend = comments_on_your_posts === NOTIFICATION_OPTION.FROM_EVERYONE ||
  (comments_on_your_posts === NOTIFICATION_OPTION.FROM_PROFILES_I_FOLLOW &&
    !!(await Follower.exists({
      following: sender,
      follower: receiver,
    }).lean()));


  if (shouldSend) {
    sendNotification(true, {
      receiver,
      sender,
      title: 'A user commented on your post',
      refId,
      deleteReferenceId,
      path: '/user/post/comment',
      fcmToken
    });
  }
};

