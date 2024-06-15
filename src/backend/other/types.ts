type CipherParams = {
    iv: string
};

type KdfParams = {
    salt: string,
    n: number,
    dklen: number,
    p: number,
    r: number
};

type Crypto = {
    cipher: string,
    cipherparams: CipherParams,
    ciphertext: string,
    kdf: string,
    kdfparams: KdfParams,
    mac: string
};

type XEthers = {
    client: string,
    gethFilename: string,
    path: string,
    locale: string,
    mnemonicCounter: string,
    mnemonicCiphertext: string,
    version: string
};

export type EncryptedWallet = {
    address: string,
    id: string,
    version: number,
    Crypto: Crypto,
    'x-ethers': XEthers
};