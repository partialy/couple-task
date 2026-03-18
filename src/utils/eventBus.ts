import EventEmitter from "./EventEmittor";

const eventBus = new EventEmitter(["UNAUTHORIZED", "REQUEST_ERROR"]);

export default eventBus;