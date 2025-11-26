import { sendNotification } from "../../../shared/sendNotification";
import { Follower } from "../user/follower/follower.model";
import { IUserNotificationSettings } from "../user/notificaiton_settings/notifation_sttings.interface";
import { NOTIFICATION_OPTION } from "../user/notificaiton_settings/notification_settings.constant";
import { User } from "../user/user.model";
import { INotificationEventProps } from "./comment/comment.notificaiton.service";

export const createNotificationThatYouAreTagged = async ({
  sender,
  refId,
  deleteReferenceId,
  receiver,
  type,
  taggedUsers,
}: INotificationEventProps) => {
  if (!Array.isArray(taggedUsers)) return;

  for (const taggedUser of taggedUsers) {
    const userNotificationSettings = await User.findById( taggedUser,'notification_settings')
      .populate('notification_settings')
      .lean();

    if (!userNotificationSettings?.notification_settings) continue;

    const { like_and_comments_on_tagged_posts } = userNotificationSettings.notification_settings as IUserNotificationSettings;

    const isFollower = await Follower.exists({
      following: sender,
      follower: taggedUser,
    }).lean();

    const shouldSend =
      like_and_comments_on_tagged_posts === NOTIFICATION_OPTION.FROM_EVERYONE ||
      (like_and_comments_on_tagged_posts ===
        NOTIFICATION_OPTION.FROM_PROFILES_I_FOLLOW &&
        !!isFollower);

    if (!shouldSend) continue;

    sendNotification(shouldSend, {
      receiver: taggedUser.toString(),
      sender,
      title: `A user ${
        type === 'comment' ? 'commented' : 'liked'
      } on a post you are tagged in`,
      refId,
      deleteReferenceId,
      path: `/user/post/${type}`
    });
  }
};
