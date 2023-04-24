import prisma from "../../prisma";
import {Socket} from "socket.io";

export const chatroomController = () =>{
    const createChatroom = async(socket:Socket, chatroom: { created_by: any; recipient: any; created_at: any; last_activity: any; })=>{
        const existingChatroom = await prisma.chatroom.findFirst({
            where: {
                chatroom_user: {
                    every: {
                        user_id: {
                            in: [chatroom.created_by, chatroom.recipient]
                        }
                    }
                }
            },
            include:{
                message: {
                    take: 1,
                    orderBy: {
                        sent_at: "desc"
                    }
                },

                chatroom_user: {
                    where: {
                        user_id: {
                            not: socket.data.user
                        }
                    },
                    include: {
                        account: {
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
                            },
                        },
                    }
                }
            }
        });
        if(existingChatroom){
            socket.join(existingChatroom.id as unknown as string);
            socket.emit("create-chatroom",existingChatroom);
            console.log(`Chatroom ${existingChatroom.id} already exists, joining it instead`);
            return;
        }
        let createdChatroom = await prisma.chatroom.create({
            data: {
                created_by: chatroom.created_by,
                created_at: chatroom.created_at,
                last_activity: chatroom.last_activity
            }
        })
        let usersInChatroom = await prisma.chatroom_user.createMany({
            data: [
                {
                    chatroom_id: createdChatroom.id,
                    user_id: chatroom.created_by,
                    joined_at: chatroom.created_at
                },
                {
                    chatroom_id: createdChatroom.id,
                    user_id: chatroom.recipient,
                    // joined_at: chatroom.created_at
                }
            ]
        })
        let newChatroom = await prisma.chatroom.findFirst({
            where: {
                id: createdChatroom.id
            },
            include:{
                message: {
                    take: 1,
                    orderBy: {
                        sent_at: "desc"
                    }
                },

                chatroom_user: {
                    where: {
                        user_id: {
                            not: socket.data.user
                        }
                    },
                    include: {
                        account: {
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
                            },
                        },
                    }
                }
            }
        })

        socket.join(newChatroom!.id as unknown as string);
        console.log(`User ${socket.data.user} joined chatroom ${newChatroom!.id}`);
        socket.emit("create-chatroom", newChatroom);
    }
    const joinChatroom = async (socket: Socket, chatroomId: number) =>{
        socket.join(chatroomId as unknown as string);
        const chatroom = await prisma.chatroom.findFirst({
            where: {
                id: chatroomId
            },
            include: {
                chatroom_user: {
                    where: {
                        user_id: {
                            not: socket.data.user
                        }
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
                message:{
                    orderBy: {
                        sent_at: 'desc'
                    }
                }
            }
        });
        console.log('updating messages from within join-chatroom event');
        console.log(`User ${socket.data.user} joined chatroom ${chatroomId} using join-chatroom`);
        socket.emit("join-chatroom",chatroom);
    }
    const deleteChatroom = async (socket:Socket, chatroomId: number) =>{
        socket.leave(chatroomId as unknown as string);
        //update chatroom_user table, set left_at to current time
        let updatedChatroomUser = await prisma.chatroom_user.update({
            where: {
                user_id_chatroom_id: {
                    user_id: socket.data.user,
                    chatroom_id: chatroomId
                },
            },
            data: {
                joined_at: null,
                left_at: new Date()
            }
        });
        //force update front end to remove chatroom from list
        socket.emit("delete-chatroom", chatroomId);
    }
    return {
        createChatroom,
        joinChatroom,
        deleteChatroom
    }
}
