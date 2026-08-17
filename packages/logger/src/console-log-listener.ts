import { LogEvent, LogType } from './log-event';
import { LogListener } from './log-listener';

export class ConsoleLogListener implements LogListener {
    private logLevel: LogType;

    constructor(logLevel: LogType = LogType.INFO) {
        this.logLevel = logLevel;
    }

    protected static format(message: string, args: unknown[]): string {
        if (args == null || args.length == 0) {
            return message;
        }

        return message.replace(/\{(\d+)\}/g, (_, index) => {
            const value = args[Number(index)];
            return value !== undefined ? String(value) : `{${index}}`;
        });
    }
    
    public onLog(event: LogEvent): void {
        if (event.type < this.logLevel) {
            return;
        }

        const prefix = `[${event.source}] ${LogType[event.type]}:`;
        const message = ConsoleLogListener.format(event.message, event.args);

        switch (event.type) {
            case LogType.ERROR:
                console.error(prefix, message);
                break;
            case LogType.WARNING:
                console.warn(prefix, message);
                break;
            case LogType.INFO:
                console.info(prefix, message);
                break;
            default:
                console.log(prefix, message);
        }
    }
}
