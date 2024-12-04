import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import Message from "../../models/entities/message.ts";

export default class Consumer {
  _queueName: string;
  _handler: (m: Message) => Promise<void>;

  constructor(queueName: string, handler: (m: Message) => Promise<void>) {
    this._queueName = queueName;
    this._handler = handler;
  }

  async run() {
    // Connect to the queue
    const connection = await connect();
    const channel = await connection.openChannel();
    await channel.declareQueue({ queue: this._queueName });

    while (true) {
      // Pass messages from the queue to the handler
      await channel.consume(
        { queue: this._queueName },
        async (args, _props, data) => {
          const json = JSON.parse(new TextDecoder().decode(data));
          const message = Message.fromJSON(json);
          await this._handler(message);
          await channel.ack({ deliveryTag: args.deliveryTag });
        },
      );
    }
  }
}
