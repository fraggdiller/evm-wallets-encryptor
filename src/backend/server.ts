import http from 'node:http';
import url from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { handleEncryptRequest } from './core/encrypt';
import { handleDecryptRequest } from './core/decrypt';

const __filename: string = url.fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

async function checkPort (port: number): Promise<void> {
    return new Promise((resolve, reject): void => {
        const server: net.Server = net.createServer();

        server.once('error', (err: any): void => {
            if (err.code === 'EADDRINUSE') {
                reject(new Error(`Port ${port} is already in use`));
            } else {
                reject(err);
            }
        });

        server.once('listening', (): void => {
            server.close();
            resolve();
        });

        server.listen(port);
    });
}

function serveStaticFile (req: http.IncomingMessage, res: http.ServerResponse, pathname: string): void {
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath: string = path.join(__dirname, '../frontend', pathname);

    fs.readFile(filePath, (err: NodeJS.ErrnoException | null, data: Buffer): void => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        } else {
            const ext: string = path.extname(filePath);
            let contentType: string = 'text/plain';

            switch (ext) {
                case '.html':
                    contentType = 'text/html';
                    break;
                case '.js':
                    contentType = 'application/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function requestHandler (req: http.IncomingMessage, res: http.ServerResponse): void {
    const parsedUrl: url.UrlWithParsedQuery = url.parse(req.url!, true);
    const pathname: string | null = parsedUrl.pathname;

    if (pathname === '/api/encrypt' && req.method === 'POST') {
        handleEncryptRequest(req, res);
    } else if (pathname === '/api/decrypt' && req.method === 'POST') {
        handleDecryptRequest(req, res);
    } else {
        serveStaticFile(req, res, pathname!);
    }
}

export async function startServer (port: number): Promise<void> {
    try {
        await checkPort(port);
        const server: http.Server = http.createServer(requestHandler);

        server.listen(port, (): void => {
            console.log(`Server running at http://localhost:${port}/`);
        });
    } catch (err) {
        console.error(err.message);
        startServer(port + 1);
    }
}
