import http from 'node:http';

export async function parseRequest (req: http.IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject): void => {
        const buffers: Buffer[] = [];
        req.on('data', (chunk: any) => buffers.push(chunk));
        req.on('end', (): void => resolve(Buffer.concat(buffers)));
        req.on('error', (err: Error) => reject(err));
    });
}

export function generatePassword (length: number = 12): string {
    const lowerCase: string = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits: string = '0123456789';
    const specialChars: string = '!@#$%^&*()_+[]{}|;:,.<>?';

    let password: string = '';

    for (let i: number = 0; i < length; i++) {
        const charType: number = i % 4;

        let charPool: string;
        switch (charType) {
            case 0:
                charPool = lowerCase;
                break;
            case 1:
                charPool = upperCase;
                break;
            case 2:
                charPool = digits;
                break;
            default:
                charPool = specialChars;
                break;
        }

        password += charPool.charAt(Math.floor(Math.random() * charPool.length));
    }

    return password;
}

export function extractMappingPassword (req: http.IncomingMessage): string {
    const mappingPassword: string | undefined = req.headers['x-mapping-password'] as string | undefined;
    if (!mappingPassword) {
        throw new Error('Mapping password is missing');
    }
    return mappingPassword;
}

export function zpad (value: String | number, length: number): String {
    value = String(value);
    while (value.length < length) { value = '0' + value; }
    return value;
}