# Agora RTC Token Server (Cloudflare Workers 版)

A lightweight, serverless Agora RTC Token generator built on Cloudflare Workers. Supports the latest **Agora AccessToken2 (007 version)** protocol with high performance and global edge availability.

這是一個基於 Cloudflare Workers 構建的輕量級 Agora RTC Token 產生伺服器。支援最新的 Agora 007 版本 Token 規範，具備高性能、低延遲且無需維護伺服器基礎設施的優點。

## 🚀 API Usage
**Endpoint:** `GET https://<your-worker>.workers.dev/`

**Parameters:**
- `channelName`: (Required) The name of the Agora channel.
- `uid`: (Optional) User ID (Integer), defaults to `0`.

**Example:**
`GET https://<your-worker>.dev/?channelName=test&uid=12345`

---



## 🛠️ Installation & Setup

### 1. Initialize Project & Configure Credentials
```bash
npx wrangler init agora-token-server2
cd agora-token-server2
npm install agora-token             

（以下兩個金鑰也可以直接在 Cloudflare dashboard 中的設定輸入）
npx wrangler secret put AGORA_APP_ID
npx wrangler secret put AGORA_APP_CERTIFICATE
```

## 2. Create and Configure wrangler.toml（or it can be set on Cloudflare dashboard > setting manually）
```
name = "agora-token-server2"
main = "src/index.js"
compatibility_date = "2025-11-17"
compatibility_flags = [ "nodejs_compat" ]

workers_dev = true
```

## 3. AccessToken2.js Modification

To ensure compatibility with Cloudflare Workers (ES Modules), modify the official SDK as follows:

I. Enable ESM Exports: Prepend export to class ServiceRtc and class AccessToken2.
- 將 class ServiceRtc ... 改為 export class ServiceRtc ...
- 將 class AccessToken2 ... 改為 export class AccessToken2 ...

II. Clean up CommonJS: Remove the module.exports = {...} block.

III. Define Roles: Add the following snippet at the end of the file:
```
export const Role = {
    PUBLISHER: 1, // 對應 kPrivilegeJoinChannel (以及基本的發布權限)
    SUBSCRIBER: 2
};
```



## 4. src/index.js Modification
The index.js handles the HTTP request, parses parameters, and invokes AccessToken2 to build the token with join/publish privileges.

## 5. 部署至 Cloudflare
```bash
npx wrangler deploy
```
