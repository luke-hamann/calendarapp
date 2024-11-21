export default class CalendarEvent {
  id: number;
  description: string;
  timestamp: Date;
  broadcast: boolean;

  constructor(
    id: number,
    description: string,
    timestamp: Date,
    broadcast: boolean,
  ) {
    this.id = id;
    this.description = description;
    this.timestamp = timestamp;
    this.broadcast = broadcast;
  }
}
