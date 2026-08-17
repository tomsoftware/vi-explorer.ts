import { LogEvent } from './log-event';

export interface LogListener {
  onLog(event: LogEvent): void;
}
