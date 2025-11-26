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



    const isFollower = await Follower.exists({
      following: sender,
      follower: taggedUser,
    }).lean();

  }
};
