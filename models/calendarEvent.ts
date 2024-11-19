export default class CalendarEvent {
  id: number;
  description: string;
  timestamp: Date;
  broadcasted: boolean;

  constructor(
    id: number,
    description: string,
    timestamp: Date,
    broadcasted: boolean,
  ) {
    this.id = id;
    this.description = description;
    this.timestamp = timestamp;
    this.broadcasted = broadcasted;
  }
}
