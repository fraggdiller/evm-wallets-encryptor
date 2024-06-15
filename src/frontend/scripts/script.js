document.getElementById('encryptDropArea').addEventListener('click', () => {
    document.getElementById('walletFile').click();
});

document.getElementById('encryptDropArea').addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('encryptDropArea').classList.add('dragover');
});

document.getElementById('encryptDropArea').addEventListener('dragleave', (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('encryptDropArea').classList.remove('dragover');
});

document.getElementById('encryptDropArea').addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('encryptDropArea').classList.remove('dragover');
    const files = event.dataTransfer.files;
    document.getElementById('walletFile').files = files;
    document.getElementById('encryptFileName').textContent = files[0].name;
    document.getElementById('encryptDropArea').classList.add('hidden');
    document.getElementById('cancelEncryptUpload').classList.remove('hidden');
});

document.getElementById('walletFile').addEventListener('change', () => {
    const fileInput = document.getElementById('walletFile').files[0];
    document.getElementById('encryptFileName').textContent = fileInput ? fileInput.name : '';
    document.getElementById('encryptDropArea').classList.add('hidden');
    document.getElementById('cancelEncryptUpload').classList.remove('hidden');
});

document.getElementById('cancelEncryptUpload').addEventListener('click', () => {
    document.getElementById('walletFile').value = '';
    document.getElementById('encryptFileName').textContent = '';
    document.getElementById('encryptDropArea').classList.remove('hidden');
    document.getElementById('cancelEncryptUpload').classList.add('hidden');
});

document.getElementById('encryptDropArea').addEventListener('paste', (event) => {
    const items = (event.clipboardData || window.clipboardData).items;
    for (const item of items) {
        if (item.kind === 'file') {
            const file = item.getAsFile();
            document.getElementById('walletFile').files = [file];
            document.getElementById('encryptFileName').textContent = file.name;
            document.getElementById('encryptDropArea').classList.add('hidden');
            document.getElementById('cancelEncryptUpload').classList.remove('hidden');
        }
    }
});

document.getElementById('decryptDropArea').addEventListener('click', () => {
    document.getElementById('mappingFile').click();
});

document.getElementById('decryptDropArea').addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('decryptDropArea').classList.add('dragover');
});

document.getElementById('decryptDropArea').addEventListener('dragleave', (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('decryptDropArea').classList.remove('dragover');
});

document.getElementById('decryptDropArea').addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('decryptDropArea').classList.remove('dragover');
    const files = event.dataTransfer.files;
    document.getElementById('mappingFile').files = files;
    document.getElementById('decryptFileName').textContent = files[0].name;
    document.getElementById('decryptDropArea').classList.add('hidden');
    document.getElementById('cancelDecryptUpload').classList.remove('hidden');
});

document.getElementById('mappingFile').addEventListener('change', () => {
    const fileInput = document.getElementById('mappingFile').files[0];
    document.getElementById('decryptFileName').textContent = fileInput ? fileInput.name : '';
    document.getElementById('decryptDropArea').classList.add('hidden');
    document.getElementById('cancelDecryptUpload').classList.remove('hidden');
});

document.getElementById('cancelDecryptUpload').addEventListener('click', () => {
    document.getElementById('mappingFile').value = '';
    document.getElementById('decryptFileName').textContent = '';
    document.getElementById('decryptDropArea').classList.remove('hidden');
    document.getElementById('cancelDecryptUpload').classList.add('hidden');
});

document.getElementById('decryptDropArea').addEventListener('paste', (event) => {
    const items = (event.clipboardData || window.clipboardData).items;
    for (const item of items) {
        if (item.kind === 'file') {
            const file = item.getAsFile();
            document.getElementById('mappingFile').files = [file];
            document.getElementById('decryptFileName').textContent = file.name;
            document.getElementById('decryptDropArea').classList.add('hidden');
            document.getElementById('cancelDecryptUpload').classList.remove('hidden');
        }
    }
});

document.getElementById('encryptButton').addEventListener('click', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('walletFile').files[0];
    const passwordInput = document.getElementById('mappingPassword').value;
    const responseElement = document.getElementById('encryptResponse');

    responseElement.textContent = '';

    if (!fileInput) {
        responseElement.textContent = 'Please upload a file';
        return;
    }

    if (!passwordInput) {
        responseElement.textContent = 'Please enter a password for jsonMapping.xlsx';
        return;
    }

    try {
        const fileBuffer = await fileInput.arrayBuffer();
        const response = await fetch('/api/encrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Mapping-Password': passwordInput
            },
            body: fileBuffer
        });

        const data = await response.json();
        responseElement.textContent = response.ok ? data.message : `Error: ${data.details}`;
    } catch (error) {
        responseElement.textContent = 'Error connecting to server';
        console.error('Error:', error);
    }
});

document.getElementById('decryptButton').addEventListener('click', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('mappingFile').files[0];
    const passwordInput = document.getElementById('decryptPassword').value;
    const responseElement = document.getElementById('decryptResponse');

    responseElement.textContent = '';

    if (!fileInput) {
        responseElement.textContent = 'Please upload a file';
        return;
    }

    if (!passwordInput) {
        responseElement.textContent = 'Please enter a password for jsonMapping.xlsx';
        return;
    }

    try {
        const fileBuffer = await fileInput.arrayBuffer();
        const response = await fetch('/api/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Mapping-Password': passwordInput
            },
            body: fileBuffer
        });

        const data = await response.json();
        responseElement.textContent = response.ok ? data.message : `Error: ${data.details}`;
    } catch (error) {
        responseElement.textContent = 'Error connecting to server';
        console.error('Error:', error);
    }
});

const themeSelect = document.getElementById('themeSelect');
themeSelect.addEventListener('change', (event) => {
    const theme = event.target.value;
    switchTheme(theme);
    localStorage.setItem('theme', theme);
});

function switchTheme (theme) {
    if (theme === 'system') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    } else if (theme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    themeSelect.value = savedTheme;
    switchTheme(savedTheme);
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (themeSelect.value === 'system') {
        switchTheme('system');
    }
});
