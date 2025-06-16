import {Message} from "@src/shared/actions/content/core/types";

export interface ContentMessenger {
  sendMessage(message: Message): void;
}

export class ContentMessengerWrapper {

  constructor(private contentMessenger: ContentMessenger) {

  }

  async sendMessage(message: Message) {
    this.contentMessenger.sendMessage(message);
  }
}
