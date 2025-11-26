import QueryBuilder from '../../builder/QueryBuilder';
import { Message } from '../message/message.model';
import { User } from '../user/user.model';
import { Conversation } from './conversaiton.model';
import { conversaionSearchableField } from './conversation.constant';

const createConversation = async ({
    creator,
    participant,
    text,
}: {
    creator: string;
    participant: string;
    text: string;
}) => {
    const [isCreateorExist, isParticipantExist] = await Promise.all([
        User.findById(creator, '_id').lean().exec(),
        User.findById(participant, '_id').lean().exec(),
    ]);

    if (!isCreateorExist) {
        throw new Error('Creator not found');
    }
    if (!isParticipantExist) {
        throw new Error('Participant not found');
    }

    // 1️⃣ Check for existing conversation
    let conversation = await Conversation.findOne({
        $or: [
            { creator, participant },
            { creator: participant, participant: creator },
        ],
    });

    // 2️⃣ If no conversation, create it
    if (!conversation) {
        conversation = await Conversation.create({ creator, participant });
    }

    // 3️⃣ Create the message
    const newMessage = await Message.create({
        conversation: conversation._id,
        sender: creator,
        receiver: participant,
        text: text,
    });

    // 4️⃣ Update lastMessage in conversation
    conversation.lastMessage = newMessage._id;
    await conversation.save();


    const io = (global as any).io
    io.emit(`new_message::${newMessage.conversation}`, newMessage)
    io.emit(`new_user::${newMessage.receiver}`, newMessage)


    // 5️⃣ Populate lastMessage
    await conversation.populate({
        path: 'lastMessage',
        populate: {
            path: 'sender receiver',
            model: 'User',
            select: '_id name',
        },
    });
    return conversation;
};

const getAllConversaions = async (query: Record<string, any>, userId: string) => {
    const isParticipant = await Conversation.exists({ creator: userId });
    const populateField = isParticipant ? 'participant' : 'creator';

    const search = query.searchTerm || "";
    query.sort = '-updatedAt';

    const result = new QueryBuilder(
        Conversation.find({
            $or: [{ creator: userId }, { participant: userId }],
        }),
        query
    )
        .paginate()
        .sort()
        .filter();

    let modelQuery = result.modelQuery
        .populate({
            path: populateField,
            select: "_id profile.username email profile.image profile.firstName profile.lastName", // add more if needed
            model: "User",
            match: search ? { "profile.username name": { $regex: search, $options: "i" } } : {}, // search on user name
        })
        .populate({
            path: "lastMessage",
            select: "text -_id",
        });

    const data = await modelQuery;
    const pagination = await result.getPaginationInfo();
    // ⚠️ Important: filter out conversations where populate returned null
    const filteredData = data.filter((conv: any) => conv[populateField] !== null);

    return {
        pagination,
        data: filteredData,
    };
};


const deleteConversation = async (id: string, creator: string) => {
    const conversation = await Conversation.findById(id);
    if (!conversation) {
        throw new Error('Conversation not found');
    }
    if (conversation.creator.toString() !== creator) {
        throw new Error('You are not authorized to delete this conversation');
    }
    await conversation.deleteOne();
    await Message.deleteMany({ conversation: id });
    return conversation;
}



export const ConversationService = {
    createConversation,
    getAllConversaions,
    deleteConversation
};