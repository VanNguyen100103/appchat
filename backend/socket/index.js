const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app)
const User = require('../models/user');
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const {verifyToken}= require('../middlewares/verify');
const getConversation = require('../helper/getConversation');
const {Server} = require('socket.io');
const getConversation = require('../helper/getConversation');

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})

const onlineUser = new Set()

io.on("connection", async (socket) => {
    console.log("connect User", socket.id)
    const token = socket.handshake.auth.token
    const user = await verifyToken(token)
    console.log(user)
    socket.join(user?._id?.toString())
    onlineUser.add(user?._id?.toString())
    io.emit('onlineUser', Array.from(onlineUser))
    socket.on('message-page', async (uid) => {
        const user = await User.findById(uid)
        const payload = {
            _id: user?._id,
            name: user?.name,
            email: user?.email,
            password: user?.password,
            avatar: user?.avatar,
            online: onlineUser.has(uid),
        }
        socket.emit("message-user", payload)
        const getMessageConversation = await Conversation.findOne({
            $or: [
                {sender: user?._id, receiver: uid},
                {receiver: user?._id, sender: uid},
            ]
        }).populate("messages").sort({updatedAt: -1})
        socket.emit("message", getMessageConversation?.messages || [])
    }
    )

    socket.on("new message", async (data)=>{
        let conversation = await Conversation.findOne({$or: [
            {sender: data?.sender, receiver: data?.receiver},
            {receiver: data?.receiver, sender: data?.sender},
        ]})
        if(!conversation){
            const createConversation = await Conversation.create({sender: data?.sender, receiver: data?.receiver})
            return conversation = createConversation
        }
        const message = await Message.create({
            text: data?.text,
            imageUrl: data?.imageUrl,
            videoUrl: data?.videoUrl,
            msgByUserId: data?.msgByUserId
        })
        await Conversation.updateOne({_id: conversation._id}, {
            $push: {messages: {message: message?._id}}
        })
        const getMessageConversation = await Conversation.findOne({
            $or: [
                {sender: user?._id, receiver: uid},
                {receiver: user?._id, sender: uid},
            ]
        }).populate("messages").sort({updatedAt: -1})
        io.to(data?.sender).emit('message', getMessageConversation.messages || [])
        io.to(data?.receiver).emit('message', getMessageConversation.messages || [])
        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)
        io.to(data?.sender).emit('conversation', conversationSender)
        io.to(data?.receiver).emit('conversation', conversationReceiver)
    })
    
    socket.on("sidebar", async (uid) => {
        console.log("Current userId", uid)
        const getConversation = await getConversation(uid)
        socket.emit('conversation', getConversation)
    })

    socket.on("seen", async (msgByUserId) => {
        let conversation = await Conversation.findOne({$or:[
            {sender: user._id, receiver: msgByUserId},
            {receiver: user._id, sender: msgByUserId},
        ]})
        const conversationMessageId = conversation.messages || []
        await Message.updateMany(
            {_id: {$in: conversationMessageId}, msgByUserId: msgByUserId},
            {$set: {seen: true}}
        )
        const conversationSender = await getConversation(user?._id?.toString())
        const conversationReceiver = await getConversation(msgByUserId)
        io.to(user?._id?.toString()).emit('conversation',conversationSender)
        io.to(msgByUserId).emit('conversation',conversationReceiver)
    }
    )

    socket.on("disconnnect", ()=>{
        onlineUser.delete(user?._id?.toString())
        console.log("Disconnect", socket.id);
    })
}
)



module.exports = { app, server }