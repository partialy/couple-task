import EventEmitter from "./EventEmittor";

const eventBus = new EventEmitter(["UNAUTHORIZED", "REQUEST_ERROR", "LOGOUT"]);

export default eventBus;