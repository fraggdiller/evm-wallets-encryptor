[![Typing SVG](https://readme-typing-svg.demolab.com?font=Raleway&weight=500&size=50&duration=3000&pause=1000&color=20F700&center=true&vCenter=true&width=640&height=90&lines=EVM+Wallets+Encryptor)](https://git.io/typing-svg)

# Evm wallets encryptor

This script will allow you to encrypt/decrypt wallets to json

## Install dependencies

You can install it using:
```
npm i
```

## Usage

- Fill data/decrypted/wallets.xlsx

Mnemonic/Private Key - Necessary

Index - Optional (works only with mnemonics) (address_index from mnemonic)

Password - Optional (pwd for encrypted json) (if not specified soft will generate password)

Address - Optional (you can omit it when encrypting)

- Start server with `npm start`
- In console u can see `Server running at http://localhost:8080/`
- Open this link in your browser

### Encrypt
- Upload wallets.xlsx
- Enter password for jsonMapping.xlsx (a file with passwords from json)
- Press Encrypt Wallets button
- You can see your encrypted wallets in data/encrypted directory

### Decrypt
- Upload jsonMapping.xlsx
- Enter password for jsonMapping.xlsx
- Press Encrypt Wallets button
- You can see your decrypted wallets in data/decrypted/wallets.xlsx


### Why is it gem
- If the encrypted json accidentally leaked to the network, then without knowing the password, 
it can only be hacked using a brute force, so you have a lot of time to withdraw all funds before 
the json is hacked
- If by chance jsonMapping.xlsx, which contains all the passwords leaked to the network, 
then there's nothing wrong with that, because no one else has encrypted jsons
- You need to try really hard to get jsonMapping.xlsx and at least one encrypted json file
into the network at the same time
- Popular wallets (metamask, rabby wallet) support importing a wallet via encrypted
json and its password

### Cons
- It is not always convenient to manage a farm when all wallets are encrypted in this form
- Most likely, there is no json wallet import in any software, but only by mnemonics or a
private key in its pure form

## Conclusion
```
git clone https://github.com/fraggdiller/evm-wallets-encryptor.git
cd evm-wallets-encryptor
npm i
npm start
```

### Support / Qs

Suggestions for improvement are welcome

`Telegram:` https://t.me/retrodropTools | https://t.me/fraggdiller