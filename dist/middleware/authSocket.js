"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSocket = void 0;
const authSocket = (socket, next) => {
    let session = socket.request.session;
    let user = socket.request.session?.passport?.user;
    if (!session || !user) {
        next(new Error("Unauthorized"));
    }
    else {
        next();
    }
};
exports.authSocket = authSocket;
//# sourceMappingURL=authSocket.js.map