type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private static instance: Logger;
  private isProd = process.env.NODE_ENV === 'production';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (this.isProd) {
      // In production, send to error tracking service
      this.sendToErrorTracking(level, message, ...args);
    } else {
      // In development, log to console with colors
      const styles = {
        debug: 'color: #666',
        info: 'color: #0284c7',
        warn: 'color: #f59e0b',
        error: 'color: #dc2626'
      };

      console.log(`%c${prefix} ${message}`, styles[level], ...args);
    }
  }

  private async sendToErrorTracking(level: LogLevel, message: string, ...args: any[]) {
    try {
      await supabase.functions.invoke('log-error', {
        body: {
          level,
          message,
          args,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Fallback to console in case of error
      console.error('Error sending to error tracking:', error);
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const logger = Logger.getInstance();