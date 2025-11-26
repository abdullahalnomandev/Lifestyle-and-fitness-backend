import { Socket } from 'socket.io';
import QueryBuilder from '../../builder/QueryBuilder';
import { Message } from '../message/message.model';
import { IMessage } from './message.interface';
import { Conversation } from '../conversation/conversaiton.model';
import setCronJob from './../../../shared/setCronJob';
const sendMessage = async (message: IMessage) => {
  // Create the message first
  const newMessage = await Message.create(message);

  // Populate sender information
  await newMessage.populate('sender', 'name _id');

  // Update conversation with the new message ID
  await Conversation.findByIdAndUpdate(message.conversation, {
    lastMessage: newMessage._id,
    updatedAt: new Date(),
  });
  const io = (global as any).io;

  io.emit(`new_message::${newMessage.conversation}`, newMessage);
  io.emit(`new_user::${newMessage.receiver}`, newMessage);

  // delete Media after 2 week
  setCronJob('0 0 */14 * *', async () => {
    const msg = await Message.findById(newMessage._id);

    if (!!msg?.image) {
      if (msg.text)
        await Message.findByIdAndUpdate(msg._id, { $unset: { media: 1 } });
      else await Message.findByIdAndDelete(msg._id);
    }
  });

  return newMessage;
};

const getAllMessages = async (
  query: Record<string, any>,
  userId: string,
  conversationId: string
) => {
  const isSender = await Message.exists({ sender: userId });
  const populateField = isSender ? 'receiver' : 'sender';

  const result = new QueryBuilder(
    Message.find({
      conversation: conversationId,
    }),
    query
  ).paginate();

  const data = await result.modelQuery
    .populate({
      path: populateField,
      select:
        'profile.username profile.image profile.firstName profile.lastName _id',
      model: 'User',
    })
    .sort({ createdAt: 1 });

  const pagination = await result.getPaginationInfo();

  return {
    pagination,
    data,
  };
};
export const MesdsageService = {
  sendMessage,
  getAllMessages,
};
