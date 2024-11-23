const Conversation = require('../models/conversation');
const asyncHandler = require('express-async-handler');

const getConversation = asyncHandler(async (uid) => {
    if(uid){
        const currentConversation = await Conversation.find({$or: [
            {sender: uid},
            {receiver: uid}
        ]}).sort({updatedAt: -1}).populate("messages").populate("sender").populate("receiver")
        const conversation = currentConversation.map((con) => {
            const countUnseenMsg = con?.messages.reduce((unseen, msgCon) => {
                const currentUserId = msgCon?.msgByUserId.toString()
                if(currentUserId !== uid.toString()){
                    return unseen + (msgCon.seen ? 0 : 1)
                }else{
                    return unseen
                }
            },0)
          return {
            _id: con?._id,
            sender: con?.sender,
            receiver: con?.receiver,
            lastMsg: con?.messages[con.messages.length - 1],
            unseenMsg: countUnseenMsg
          }
        }
        )
        return conversation
    }
    else{
        return []
    }
}
) 

module.exports = getConversation