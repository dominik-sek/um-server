import prisma from "../../prisma";
import {Socket} from "socket.io";

export const connectionController = () =>{
    const onConnection = async (socket: Socket) =>{
        let chatrooms = await prisma.chatroom.findMany({
            where: {
                chatroom_user: {
                    some: {
                        user_id: socket.data.user,
                        joined_at: {
                            not: null
                        },
                        left_at: null,
                    },
                },
            },
            include: {
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
                                person: {
                                    select: {
                                        first_name: true,
                                        last_name: true
                                    }
                                }
                            }
                        },
                    },

                },
                message: {
                    orderBy: {
                        sent_at: 'desc'
                    },
                    take: 20,
                    //TODO: on scroll up, fetch more messages
                }
            }
        });
        if(chatrooms.length > 0){
            chatrooms.forEach((chatroom) => {
                socket.emit("chatrooms",chatrooms);
                socket.join(chatroom.id as unknown as string);
                console.log(`User ${socket.data.user} joined chatroom ${chatroom.id}`);
            })
            const unreadMessages = await prisma.chatroom_user.findMany({
                where: {
                    chatroom_id: {
                        in: chatrooms.map((chatroom) => chatroom.id)
                    },
                    user_id: socket.data.user,
                },
                select: {
                    chatroom_id: true,
                    unread_count: true,
                }
            });

            socket.emit("unread-messages", unreadMessages);
        }
        return chatrooms;
    }

    return {
        onConnection,
    }
}
