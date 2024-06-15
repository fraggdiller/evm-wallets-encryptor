import fs from 'node:fs/promises';
import path from 'node:path';
import { constants } from 'node:os';

export default class Filehandler {

    public static async readFile (filePath: string): Promise<string> {
        try {
            await fs.access(filePath);
        } catch {
            throw Error(`File doesn't exist: ${filePath}`);
        }
        return fs.readFile(filePath, 'utf-8');
    };

    public static async loadFile (filePath: string): Promise<string[]> {
        filePath = path.join(process.cwd(), filePath);

        const data: string = await this.readFile(filePath);
        return data.split('\n')
            .map((line: string): string => line.replace(/\r/g, '').trim())
            .filter((line: string): boolean => line !== '');
    };

    public static async createFile (filePath: string, data: string): Promise<void> {
        try {
            const file: fs.FileHandle = await fs.open(filePath, 'wx');
            await file.writeFile(data);
            await file.close();
        } catch (e) {
            if (e.code === constants.errno.EEXIST) {
                return;
            } else {
                throw Error(`Произошла ошибка при создании файла ${filePath}: ${e}`);
            }
        }
    };

    public static async writeJson<T extends string | number | symbol, B> (filePath: string, newData: Record<T, B>): Promise<void> {
        try {
            const dataString: string = JSON.stringify(newData, null, 2);
            await fs.writeFile(filePath, dataString);
        } catch (e) {
            throw Error(`Произошла ошибка при работе с файлом ${filePath}: ${e}`);
        }
    };

    public static async mkDir (dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath);
        }
    };
}