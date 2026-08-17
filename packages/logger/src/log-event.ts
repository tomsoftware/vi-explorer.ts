export enum LogType {
    TRACE = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3
}

/** One Logging Message getting emitted by a logger */
export class LogEvent {
    public readonly type: LogType;
    public readonly source: string;
    public readonly message: string;
    public readonly error?: unknown;
    public readonly args: unknown[];
    
    constructor(source: string, type: LogType, message: string, args: unknown[], error?: unknown) {
        this.source = source;
        this.type = type;
        this.message = message;
        this.error = error;
        this.args = args;
    }
}
