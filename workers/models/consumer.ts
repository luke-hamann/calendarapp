import { connect } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import IMessage from "./message.ts";

export default class Consumer {
  queueName: string;
  handler: (m: IMessage) => Promise<void>;

  constructor(queueName: string, handler: (m: IMessage) => Promise<void>) {
    this.queueName = queueName;
    this.handler = handler;
  }

  async run() {
    // deno-lint-ignore no-var
    var running: boolean = true;
    // deno-lint-ignore no-unused-vars
    const onmessage = (signal: boolean) => running = signal;

    const connection = await connect();
    const channel = await connection.openChannel();
    await channel.declareQueue({ queue: this.queueName });

    while (running) {
      await channel.consume(
        { queue: this.queueName },
        async (args, _props, data) => {
          const json = JSON.parse(new TextDecoder().decode(data));
          await this.handler(json);
          await channel.ack({ deliveryTag: args.deliveryTag });
        },
      );
    }
  }
}
