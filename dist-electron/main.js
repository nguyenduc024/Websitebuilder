"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const http_1 = __importDefault(require("http"));
// Refresh PATH từ Windows registry để nhận đúng biến môi trường mới nhất
function refreshPath() {
    try {
        const machinePath = (0, child_process_1.execSync)('powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable(\'Path\',\'Machine\')"', { encoding: 'utf-8' }).trim();
        const userPath = (0, child_process_1.execSync)('powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable(\'Path\',\'User\')"', { encoding: 'utf-8' }).trim();
        process.env.Path = machinePath + ';' + userPath;
        console.log('[Startup] PATH da duoc refresh tu Windows registry.');
    }
    catch (err) {
        console.warn('[Startup] Khong the refresh PATH:', err);
    }
}
refreshPath();
const BACKEND_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5173';
let backendProcess = null;
let frontendProcess = null;
// ===== Kiểm tra service đã chạy chưa =====
function isServiceRunning(url) {
    return new Promise((resolve) => {
        const req = http_1.default.get(url, (res) => {
            res.resume();
            resolve(true);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(3000, () => { req.destroy(); resolve(false); });
    });
}
// ===== Chờ service sẵn sàng =====
function waitForService(url, timeoutMs) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            const req = http_1.default.get(url, (res) => {
                res.resume();
                resolve();
            });
            req.on('error', () => {
                if (Date.now() - start > timeoutMs) {
                    reject(new Error(`Timeout: ${url} khong phan hoi sau ${timeoutMs / 1000}s`));
                }
                else {
                    setTimeout(check, 2000);
                }
            });
            req.setTimeout(5000, () => {
                req.destroy();
                if (Date.now() - start > timeoutMs) {
                    reject(new Error(`Timeout: ${url}`));
                }
                else {
                    setTimeout(check, 2000);
                }
            });
        };
        check();
    });
}
// ===== Khởi động Backend Java =====
function startBackend() {
    const projectRoot = path_1.default.resolve(__dirname, '..');
    const child = (0, child_process_1.spawn)('mvn', ['-f', 'HealthLinkJava/pom.xml', 'spring-boot:run'], {
        cwd: projectRoot,
        stdio: 'pipe',
        shell: true,
    });
    child.stdout?.on('data', (d) => console.log(`[Backend] ${d.toString().trim()}`));
    child.stderr?.on('data', (d) => console.error(`[Backend] ${d.toString().trim()}`));
    child.on('error', (err) => console.error('[Backend] Loi khoi dong:', err.message));
    return child;
}
// ===== Khởi động Frontend Vite =====
function startFrontend() {
    const projectRoot = path_1.default.resolve(__dirname, '..');
    const child = (0, child_process_1.spawn)('npx', ['vite'], {
        cwd: projectRoot,
        stdio: 'pipe',
        shell: true,
    });
    child.stdout?.on('data', (d) => console.log(`[Frontend] ${d.toString().trim()}`));
    child.stderr?.on('data', (d) => console.error(`[Frontend] ${d.toString().trim()}`));
    child.on('error', (err) => console.error('[Frontend] Loi khoi dong:', err.message));
    return child;
}
// ===== Tắt process con (Windows-safe) =====
function killProcess(proc) {
    if (proc && !proc.killed && proc.pid) {
        if (process.platform === 'win32') {
            (0, child_process_1.spawn)('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { shell: true });
        }
        else {
            proc.kill('SIGTERM');
        }
    }
}
// ===== Cleanup khi tắt app =====
function cleanupAll() {
    killProcess(backendProcess);
    killProcess(frontendProcess);
    backendProcess = null;
    frontendProcess = null;
}
// ===== LOADING HTML =====
const LOADING_HTML = `data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif">
<div style="text-align:center">
  <div style="width:60px;height:60px;border:4px solid #d1d5db;border-top-color:#059669;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px"></div>
  <h2 style="color:#059669;margin:0 0 8px">HealthLink</h2>
  <p style="color:#64748b;margin:0 0 4px">Dang khoi dong he thong...</p>
  <p style="color:#94a3b8;font-size:13px;margin:0">Backend (Java) & Frontend (Vite) dang ket noi</p>
</div>
<style>@keyframes spin{to{transform:rotate(360deg)}}</style>
</body></html>`)}`;
const ERROR_HTML = (msg) => `data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fef2f2;font-family:system-ui,-apple-system,sans-serif">
<div style="text-align:center;max-width:500px;padding:20px">
  <h2 style="color:#dc2626;margin:0 0 12px">Loi khoi dong</h2>
  <p style="color:#64748b;margin:0 0 16px">${msg}</p>
  <p style="color:#94a3b8;font-size:13px;margin:0">Kiem tra SQL Server da chay chua, roi thu mo lai app.</p>
</div>
</body></html>`)}`;
// ===== MAIN =====
electron_1.app.on("ready", async () => {
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        icon: path_1.default.resolve(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false,
        }
    });
    // Hiển thị màn hình loading
    mainWindow.loadURL(LOADING_HTML);
    try {
        // 1. Kiểm tra & khởi động Backend
        const backendAlive = await isServiceRunning(BACKEND_URL);
        if (!backendAlive) {
            console.log('[Startup] Backend chua chay -> Dang khoi dong...');
            backendProcess = startBackend();
        }
        else {
            console.log('[Startup] Backend da chay san.');
        }
        // 2. Kiểm tra & khởi động Frontend
        const frontendAlive = await isServiceRunning(FRONTEND_URL);
        if (!frontendAlive) {
            console.log('[Startup] Frontend chua chay -> Dang khoi dong...');
            frontendProcess = startFrontend();
        }
        else {
            console.log('[Startup] Frontend da chay san.');
        }
        // 3. Chờ cả 2 sẵn sàng (Backend 2 phút, Frontend 1 phút)
        console.log('[Startup] Dang cho Backend & Frontend san sang...');
        await Promise.all([
            waitForService(BACKEND_URL, 120000),
            waitForService(FRONTEND_URL, 60000),
        ]);
        console.log('[Startup] Tat ca service da san sang!');
        // 4. Load giao diện chính
        mainWindow.loadURL(FRONTEND_URL);
        if (process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools();
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[Startup] Loi:', message);
        mainWindow.loadURL(ERROR_HTML(message));
    }
});
// Dọn dẹp khi tắt app
electron_1.app.on('before-quit', cleanupAll);
electron_1.app.on('window-all-closed', () => {
    cleanupAll();
    electron_1.app.quit();
});
