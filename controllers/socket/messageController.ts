import prisma from "../../prisma";
import {chatroom} from "@prisma/client";
import {Socket} from "socket.io";

export const messageController = () =>{
    const sendMessage = async (socket: Socket, message: { chatroom_id: any; sender_id: any; sent_at: any; content: any; }) => {
        let createdMessage = await prisma.message.create({
            data: {
                chatroom_id: message.chatroom_id,
                sender_id: message.sender_id,
                sent_at: message.sent_at,
                content: message.content,
                status: 'sent',
            }
        });
        let recipient = await prisma.chatroom_user.findFirst({
            where: {
                chatroom_id: message.chatroom_id,
                user_id: {
                    not: message.sender_id
                }
            }
        })
        //whenever a new message is sent, update last_activity of chatroom
        let updatedChatroom = await prisma.chatroom.update({
            where: {
                id: message.chatroom_id
            },
            data: {
                last_activity: message.sent_at,
            }
        });
        let updatedChatroomUser = await prisma.chatroom_user.update({
            where: {
                user_id_chatroom_id: {
                    user_id: recipient!.user_id!,
                    chatroom_id: message.chatroom_id
                }
            },
            data:{
                unread_count: {
                    increment: 1
                },
                joined_at: message.sent_at,
                left_at: null
            }
        });

        const unreadMessages = await prisma.chatroom_user.findMany({
            where: {
                chatroom_id: message.chatroom_id,
                user_id: recipient!.user_id!
            },
            select: {
                chatroom_id: true,
                unread_count: true,
            }
        });
        console.log(unreadMessages)
        console.log(`User ${socket.data.user} sent a message in chatroom ${message.chatroom_id}`);
        socket.to(recipient!.user_id! as any as string).emit("new-message",message.chatroom_id);
        socket.to(recipient!.user_id! as any as string).emit("unread-messages",unreadMessages);
        return createdMessage;
    }
    const seenMessages = async (socket: Socket, chatroom: chatroom, chatrooms: chatroom[]) => {
        let updatedMessages = await prisma.message.updateMany({
            where: {
                chatroom_id: chatroom.id,
                sender_id: {
                    not: socket.data.user
                },
                status: 'sent'
            },
            data: {
                status: 'read'
            }
        })
        const updatedChatroom = await prisma.chatroom.findFirst({
            where: {
                id: chatroom.id
            },
            include: {
                chatroom_user: {
                    where: {
                        user_id: {
                            not: socket.data.user
                        },
                        left_at: null
                    },
                    include: {
                        account:{
                            select: {
                                account_images: {
                                    select: {
                                        avatar_url: true
                                    }
                                },
                                person:{
                                    select:{
                                        first_name: true,
                                        last_name: true
                                    }
                                }
                            }
                        },
                    },

                },
                //if the user left the chat at some point, but then rejoined, show messages from when they left
                message:{
                    orderBy: {
                        sent_at: 'desc'
                    }
                }
            }
        });

        if(updatedChatroom){
            let updatedChatroomUser = await prisma.chatroom_user.update({
                where: {
                    user_id_chatroom_id:{
                        user_id: socket.data.user,
                        chatroom_id: chatroom.id
                    }
                },
                data: {
                    unread_count: 0
                }
            });
        }

        const unreadMessages = await prisma.chatroom_user.findMany({
            where: {
                chatroom_id: {
                    in: chatrooms.map((chatroom) => chatroom.id)
                },
                user_id: socket.data.user
            },
            select: {
                chatroom_id: true,
                unread_count: true,
            }
        });

        socket.to(chatroom.id as unknown as string).emit("seen-messages",updatedChatroom);
        //send event to trigger update of unread count
        socket.emit("unread-messages", unreadMessages);
    }
    return {
        sendMessage,
        seenMessages
    }
}