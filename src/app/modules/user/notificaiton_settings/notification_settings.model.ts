import { model, Schema } from "mongoose";
import {
  NOTIFICATION_TOGGLE,
  NOTIFICATION_OPTION,
} from "./notification_settings.constant";
import { IUserNotificationSettings, UserNotificationSettingsModel } from "./notifation_sttings.interface";


export const clubNotificationSettingsSchema = new Schema<
  IUserNotificationSettings,
  UserNotificationSettingsModel
>({
  likes_on_your_posts: {
    type: String,
    enum: Object.values(NOTIFICATION_OPTION),
    default: NOTIFICATION_OPTION.FROM_PROFILES_I_FOLLOW,
  },

  comments_on_your_posts: {
    type: String,
    enum: Object.values(NOTIFICATION_OPTION),
    default: NOTIFICATION_OPTION.FROM_PROFILES_I_FOLLOW,
  },

  like_and_comments_on_tagged_posts: {
    type: String,
    enum: Object.values(NOTIFICATION_OPTION),
    default: NOTIFICATION_OPTION.FROM_PROFILES_I_FOLLOW,
  },

  new_followers: {
    type: Boolean,
    default: true as NOTIFICATION_TOGGLE,
  },

  accept_follow_requests: {
    type: Boolean,
    default: false as NOTIFICATION_TOGGLE,
  },

  message_requests: {
    type: Boolean,
    default: true as NOTIFICATION_TOGGLE,
  },

  club_community_messages: {
    type: Boolean,
    default: true as NOTIFICATION_TOGGLE,
  },

  club_calendar_booking: {
    type: Boolean,
    default: true as NOTIFICATION_TOGGLE,
  },

  birthday_reminders: {
    type: Boolean,
    default: true as NOTIFICATION_TOGGLE,
  },
});

export const UserNotificationSettings = model<IUserNotificationSettings>( "UserNotificationSettings", clubNotificationSettingsSchema);
