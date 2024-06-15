import Filehandler from './backend/other/filehandler';
import ExcelJS from 'exceljs';


async function postinstall (): Promise<void> {
    await Filehandler.mkDir('./data');
    await Filehandler.mkDir('./data/decrypted');
    await Filehandler.mkDir('./data/encrypted');

    const newWorkbook: ExcelJS.Workbook = new ExcelJS.Workbook();
    const newSheet: ExcelJS.Worksheet = newWorkbook.addWorksheet('Wallets');
    newSheet.columns = [
        { header: 'Mnemonic/Private Key', key: 'mnemonicOrPrivateKey' },
        { header: 'Index', key: 'index' },
        { header: 'Password', key: 'password' },
        { header: 'Address', key: 'address' },
    ];
    await newWorkbook.xlsx.writeFile('./data/decrypted/wallets.xlsx');
}

await postinstall();