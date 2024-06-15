import http from 'node:http';
import XlsxPopulate from 'xlsx-populate';
import path from 'node:path';
import { EncryptedWallet } from '../other/types';
import { ethers } from 'ethers';
import fs from 'node:fs';
import ExcelJS from 'exceljs';
import url from 'node:url';
import { extractMappingPassword, parseRequest } from './common';

const __filename: string = url.fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);


async function loadWorkbook (buffer: Buffer, password: string): Promise<XlsxPopulate.Workbook> {
    return XlsxPopulate.fromDataAsync(buffer, { password });
}

async function processWorksheet (worksheet: XlsxPopulate.Sheet): Promise<any[]> {
    const range: XlsxPopulate.Range | undefined = worksheet.usedRange();
    if (!range) {
        throw new Error('Worksheet is missing');
    }

    const walletData: any[] = [];
    const rows: XlsxPopulate.cellValue[][] = range.value();

    for (const row of rows.slice(1)) {
        const file: string = row[0] as string;
        const password: string = row[1] as string;

        if (!file || !password) {
            throw new Error('File or password is missing');
        }

        const jsonFilePath: string = path.join(__dirname, '../../../data/encrypted', file);
        const encryptedJson: EncryptedWallet = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

        const wallet: ethers.Wallet | ethers.HDNodeWallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(encryptedJson), password.toString());

        let mnemonicPhrase: string | undefined;
        let index: string | undefined;

        if (wallet instanceof ethers.HDNodeWallet && wallet.mnemonic) {
            mnemonicPhrase = wallet.mnemonic.phrase;
            index = encryptedJson['x-ethers'].path.split('/').pop();
        }

        walletData.push([mnemonicPhrase || wallet.privateKey, index || '', password, wallet.address]);
    }

    return walletData;
}

async function createWalletFile (walletData: any[], walletFilePath: string): Promise<void> {
    const newWorkbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const newSheet: ExcelJS.Worksheet = newWorkbook.addWorksheet('Wallets');
    newSheet.columns = [
        { header: 'Mnemonic/Private Key', key: 'mnemonicOrPrivateKey' },
        { header: 'Index', key: 'index' },
        { header: 'Password', key: 'password' },
        { header: 'Address', key: 'address' },
    ];
    newSheet.addRows(walletData);

    await newWorkbook.xlsx.writeFile(walletFilePath);
}

export async function handleDecryptRequest (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
        const fileBuffer: Buffer = await parseRequest(req);

        if (fileBuffer.length === 0) {
            throw new Error('File buffer is empty');
        }

        const mappingPassword: string = extractMappingPassword(req);
        const workbook: XlsxPopulate.Workbook = await loadWorkbook(fileBuffer, mappingPassword);
        const worksheet: XlsxPopulate.Sheet = workbook.sheet(0);

        const walletData: any[] = await processWorksheet(worksheet);
        const walletFilePath: string = path.join(__dirname, '../../../data/decrypted/wallets.xlsx');

        await createWalletFile(walletData, walletFilePath);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Wallets decrypted successfully' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
    }
}
