import {Session} from "express-session";
import {Socket} from "socket.io";

export const authSocket = (socket: Socket, next: (err?: any) => void) => {
    let session = (socket.request as any).session as Session;
    let user = (socket.request as any).session?.passport?.user;

    if(!session || !user){
        next(new Error("Unauthorized"));
    }
    else{
        socket.data.user = user;
        next();
    }
}
