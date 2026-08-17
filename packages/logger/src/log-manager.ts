import { ConsoleLogListener } from './console-log-listener';
import { LogEvent } from './log-event';
import { LogListener } from './log-listener';

export class LoggerManager {
  private static listeners: LogListener[] = [new ConsoleLogListener()];

  public static clearListeners() {
    this.listeners.length = 0;
  }

  public static addListener(listener: LogListener) {
    this.listeners.push(listener);
  }

  public static dispatch(event: LogEvent) {
    for (const listener of this.listeners) {
      listener.onLog(event);
    }
  }
}
