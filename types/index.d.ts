
interface BigInt {
    /** Convert to BigInt to string form in JSON.stringify */
    toJSON: () => string;
}

// add session to incoming message
declare module "http" {
    interface IncomingMessage {
        session?: any;
    }
}