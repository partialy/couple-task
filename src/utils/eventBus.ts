import EventEmitter from "./EventEmittor";

const eventBus = new EventEmitter([
  "UNAUTHORIZED",
  "REQUEST_ERROR",
  "LOGOUT",
  "CHAT_MESSAGE_INCOMING",
  "CHAT_CONVERSATION_READ",
  "OPEN_MESSAGES_TAB",
]);

export default eventBus;