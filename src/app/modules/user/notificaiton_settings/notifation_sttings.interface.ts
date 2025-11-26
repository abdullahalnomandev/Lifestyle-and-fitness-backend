import { Model } from "mongoose";
import { NOTIFICATION_OPTION, NOTIFICATION_TOGGLE } from "./notification_settings.constant";

export type IUserNotificationSettings = {
  likes_on_your_posts: NOTIFICATION_OPTION;
  comments_on_your_posts: NOTIFICATION_OPTION;
  like_and_comments_on_tagged_posts: NOTIFICATION_OPTION;

  new_followers: NOTIFICATION_TOGGLE;
  accept_follow_requests: NOTIFICATION_TOGGLE;
  message_requests: NOTIFICATION_TOGGLE;
  club_community_messages: NOTIFICATION_TOGGLE;
  club_calendar_booking: NOTIFICATION_TOGGLE;
  birthday_reminders: NOTIFICATION_TOGGLE;
};


export type UserNotificationSettingsModel = Model<
  IUserNotificationSettings,
  Record<string, unknown>
>;
