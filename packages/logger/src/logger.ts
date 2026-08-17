import { LogEvent, LogType } from './log-event';
import { LoggerManager } from './log-manager';

/** Logger emitting log events */
export class Logger {
    private source: string;

    constructor(source: string) {
        this.source = source;
    }

    public log(message: string, ...args: unknown[]): void {
        LoggerManager.dispatch(
            new LogEvent(this.source, LogType.INFO, message, args)
        );
    }

    public error(message: string, error?: unknown, ...args: unknown[]): void {
        LoggerManager.dispatch(
            new LogEvent(this.source, LogType.ERROR, message, args, error)
        );
    }

    public warn(message: string, ...args: unknown[]): void {
        LoggerManager.dispatch(
            new LogEvent(this.source, LogType.WARNING, message, args)
        );
    }
}
