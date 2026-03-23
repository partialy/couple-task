import EventEmitter from "./EventEmittor";

const eventBus = new EventEmitter([
  "UNAUTHORIZED",
  "REQUEST_ERROR",
  "LOGOUT",
  "CHAT_MESSAGE_INCOMING",
]);

export default eventBus;