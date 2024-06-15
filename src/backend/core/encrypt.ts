import http from 'node:http';
import ExcelJS from 'exceljs';
import { ethers } from 'ethers';
import { EncryptedWallet } from '../other/types';
import path from 'node:path';
import Filehandler from '../other/filehandler';
import XlsxPopulate from 'xlsx-populate';
import url from 'node:url';
import { extractMappingPassword, generatePassword, parseRequest, zpad } from './common';

const __filename: string = url.fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);


async function loadWorkbook (buffer: Buffer): Promise<ExcelJS.Workbook> {
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    return workbook;
}

async function processWorksheet (worksheet: ExcelJS.Worksheet): Promise<Record<string, string>> {
    const mapping: Record<string, string> = {};

    for (let i: number = 2; i <= worksheet.rowCount; i++) {
        const row: ExcelJS.Row = worksheet.getRow(i);
        const mnemonicOrPrivateKey: string | undefined = row.getCell(1).value as string | undefined;

        if (!mnemonicOrPrivateKey) continue;

        const index: number | undefined = row.getCell(2).value as number | undefined;

        const password: string | undefined = row.getCell(3).value as string | undefined;

        const mnemonic: string | undefined = mnemonicOrPrivateKey.includes(' ') ? mnemonicOrPrivateKey : undefined;
        const privateKey: string | undefined = mnemonic ? undefined : mnemonicOrPrivateKey;
        const idx: number = index || 0;
        const pwd: string = password || generatePassword();

        let wallet: ethers.HDNodeWallet | ethers.Wallet;
        let gethFilename: string;

        if (mnemonic) {
            wallet = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, `m/44'/60'/0'/0/${idx}`);
        } else if (privateKey) {
            wallet = new ethers.Wallet(privateKey);
        } else {
            throw new Error('Invalid input: either mnemonic or private key must be provided');
        }

        const encryptedJsonStr: string = await wallet.encrypt(pwd.toString());
        const encryptedJson: EncryptedWallet = JSON.parse(encryptedJsonStr);

        if (mnemonic) {
            gethFilename = encryptedJson['x-ethers'].gethFilename;
        } else {
            const now: Date = new Date();

            const timestamp: string = (now.getUTCFullYear() + '-' +
                zpad(now.getUTCMonth() + 1, 2) + '-' +
                zpad(now.getUTCDate(), 2) + 'T' +
                zpad(now.getUTCHours(), 2) + '-' +
                zpad(now.getUTCMinutes(), 2) + '-' +
                zpad(now.getUTCSeconds(), 2) + '.0Z');
            gethFilename = ('UTC--' + timestamp + '--' + wallet.address.replace('0x', ''));
        }

        const jsonFilePath: string = path.join(__dirname, '../../../data/encrypted', `${gethFilename}.json`);

        await Filehandler.writeJson(jsonFilePath, encryptedJson);

        mapping[`${gethFilename}.json`] = pwd;
    }
    return mapping;
}

async function createMappingFile (mapping: Record<string, string>, mappingPassword: string, mappingFilePath: string): Promise<void> {
    const newWorkbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const newSheet: ExcelJS.Worksheet = newWorkbook.addWorksheet('Mappings');
    newSheet.columns = [
        { header: 'File', key: 'file' },
        { header: 'Password', key: 'password' },
    ];
    newSheet.addRows(Object.entries(mapping).map(([file, password]: string[]): { file: string, password: string } => ({ file, password })));

    const buffer: ExcelJS.Buffer = await newWorkbook.xlsx.writeBuffer();
    const populatedWorkbook: XlsxPopulate.Workbook = await XlsxPopulate.fromDataAsync(buffer);
    await populatedWorkbook.toFileAsync(mappingFilePath, { password: mappingPassword });
}

export async function handleEncryptRequest (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
        const fileBuffer: Buffer = await parseRequest(req);
        if (fileBuffer.length === 0) {
            throw new Error('File buffer is empty');
        }

        const mappingPassword: string = extractMappingPassword(req);
        const workbook: ExcelJS.Workbook = await loadWorkbook(fileBuffer);
        const worksheet: ExcelJS.Worksheet = workbook.worksheets[0];
        if (!worksheet) {
            throw new Error('Worksheet is not found');
        }

        const mapping: Record<string, string> = await processWorksheet(worksheet);
        const mappingFilePath: string = path.join(__dirname, '../../../data/encrypted/jsonMapping.xlsx');
        await createMappingFile(mapping, mappingPassword, mappingFilePath);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Files created successfully' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
    }
}
