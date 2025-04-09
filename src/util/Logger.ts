import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

export class Logger {
    private logFilePath: string;

    constructor(private instanceName: string, basePath: string) {
        const logDir = path.join(basePath, 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        this.logFilePath = path.join(logDir, `${this.instanceName}.log`);
    }

    private async writeLog(message: string): Promise<void> {
        try {
            const date = new Date();
            const formattedDate = `${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} às ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;

            const logMessage = `[${formattedDate}] ${message}`;

            await fsp.appendFile(this.logFilePath, logMessage + "\n");
            console.log(logMessage);
        } catch (err) {
            console.error('Erro ao escrever no arquivo de log:', err);
        }
    }

    public async info(message: string): Promise<void> {
        await this.writeLog(`INFO: ${message}`);
    }

    public async warn(message: string): Promise<void> {
        await this.writeLog(`WARN: ${message}`);
    }

    public async error(message: string): Promise<void> {
        await this.writeLog(`ERROR: ${message}`);
    }
}
