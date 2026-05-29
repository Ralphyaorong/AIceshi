const http = require("http");
const { spawn } = require("child_process");
const crypto = require("crypto");

const publicPort = Number(process.env.PORT || 8787);
const publicHost = process.env.HOST || "0.0.0.0";
const upstreamPort = Number(process.env.AUTH_UPSTREAM_PORT || publicPort + 1);
const upstreamHost = "127.0.0.1";
const internalAccessCode = process.env.UPSTREAM_ACCESS_CODE || "__wrapper_internal_access__";
const cookieName = "cc_access";

const defaultAccessCodeHashes = new Set([
  "6a56a311c2d8ba7edd056732e2bd3bbbc8c357c7d87b5cb121eb8aeae8337be0",
  "2b082ff5af229940435998bcf353a36141925d5919f649013c4c9a86f17a23d9",
  "5792d2981981be5a2677cd353db6f55cd9d2779570061ae8d86176635b3cc745",
  "386a85d8c88778b00b1355608363c7e3078857f3e9633cfd0802d3bf1c0b5b83",
]);
const accessCodeHashes = configuredAccessCodeHashes(process.env.ACCESS_CODES || process.env.ACCESS_CODE);

const upstream = spawn(process.execPath, ["server.js"], {
  cwd: __dirname,
  env: {
    ...process.env,
    PORT: String(upstreamPort),
    HOST: upstreamHost,
    ACCESS_CODES: process.env.UPSTREAM_ACCESS_CODES || internalAccessCode,
  },
  stdio: ["ignore", "inherit", "inherit"],
});

process.on("exit", () => upstream.kill());
process.on("SIGTERM", () => {
  upstream.kill("SIGTERM");
  process.exit(0);
});
process.on("SIGINT", () => {
  upstream.kill("SIGINT");
  process.exit(0);
});

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method === "POST" && url.pathname === "/api/login") {
      const payload = JSON.parse((await readBody(request, 1024 * 32)).toString("utf8") || "{}");
      const hash = hashAllowedCode(payload.accessCode);
      if (!hash) return sendJson(response, 401, { error: "访问密码不正确，请重新输入。" });
      return sendJson(response, 200, { ok: true }, { "Set-Cookie": sessionCookie(hash, request) });
    }

    if (request.method === "GET" && url.pathname === "/api/login/status") {
      return sendJson(response, isAuthorized(request) ? 200 : 401, { ok: isAuthorized(request) });
    }

    if (request.method === "POST" && url.pathname === "/api/logout") {
      return sendJson(response, 200, { ok: true }, { "Set-Cookie": `${cookieName}=; Path=/; Max-Age=0; SameSite=Lax` });
    }

    if (isProtectedPath(url.pathname) && !isAuthorized(request)) {
      return sendJson(response, 401, { error: "请先输入正确的访问密码。" });
    }

    return proxyToUpstream(request, response, url.pathname);
  } catch (error) {
    console.error(error);
    return sendJson(response, 500, { error: error.message || "Server error" });
  }
});

function proxyToUpstream(request, response, pathname) {
  const target = new URL(request.url, `http://${upstreamHost}:${upstreamPort}`);
  const headers = { ...request.headers, host: `${upstreamHost}:${upstreamPort}`, "x-access-code": internalAccessCode };
  delete headers.connection;
  delete headers["accept-encoding"];

  const proxyRequest = http.request(
    target,
    {
      method: request.method,
      headers,
    },
    (proxyResponse) => {
      const contentType = String(proxyResponse.headers["content-type"] || "");
      const shouldInject = request.method === "GET" && contentType.includes("text/html");
      if (!shouldInject) {
        response.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
        proxyResponse.pipe(response);
        return;
      }

      const chunks = [];
      proxyResponse.on("data", (chunk) => chunks.push(chunk));
      proxyResponse.on("end", () => {
        const html = Buffer.concat(chunks).toString("utf8");
        const protectedHtml = injectAccessGate(html, pathname);
        const responseHeaders = { ...proxyResponse.headers, "content-length": Buffer.byteLength(protectedHtml) };
        response.writeHead(proxyResponse.statusCode || 200, responseHeaders);
        response.end(protectedHtml);
      });
    },
  );

  proxyRequest.on("error", () => {
    sendHtml(response, 503, "<h1>服务正在启动</h1><p>请稍后刷新页面。</p>");
  });
  request.pipe(proxyRequest);
}

function injectAccessGate(html, pathname) {
  const extra = `<style>
body.cc-locked .wrap{filter:blur(2px);pointer-events:none;user-select:none}
.cc-gate{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(36,33,28,.46)}
.cc-gate[hidden]{display:none}
.cc-card{width:min(420px,100%);border:1px solid #ddd8cc;border-radius:8px;background:#fff;box-shadow:0 24px 70px rgba(32,28,18,.28);padding:20px;color:#24211c;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}
.cc-card h2{margin:0 0 8px;font-size:22px}
.cc-card p{margin:0 0 12px;color:#716b61;line-height:1.55}
.cc-card label{display:block;margin:12px 0 6px;color:#4a463e;font-size:13px;font-weight:800}
.cc-card input{width:100%;height:40px;border:1px solid #ddd8cc;border-radius:6px;background:#fffefa;color:#24211c;padding:0 10px;box-sizing:border-box}
.cc-card button{width:100%;min-height:40px;margin-top:12px;border:0;border-radius:6px;background:#177f75;color:white;font-weight:800;cursor:pointer}
.cc-error{min-height:22px;margin-top:10px;color:#b42318;font-size:13px}
</style>
<div class="cc-gate" id="ccGate" hidden>
  <div class="cc-card">
    <h2>请输入访问密码</h2>
    <p>输入授权口令后才能使用检测工具或查看报告。</p>
    <label for="ccAccessCode">访问密码</label>
    <input id="ccAccessCode" type="password" autocomplete="current-password" placeholder="请输入访问密码">
    <button id="ccAccessBtn" type="button">进入使用</button>
    <div class="cc-error" id="ccAccessError"></div>
  </div>
</div>
<script>
(function(){
  const gate=document.getElementById("ccGate");
  const input=document.getElementById("ccAccessCode");
  const button=document.getElementById("ccAccessBtn");
  const error=document.getElementById("ccAccessError");
  const isShare=${JSON.stringify(pathname.startsWith("/share/"))};
  button.addEventListener("click",login);
  input.addEventListener("keydown",event=>{if(event.key==="Enter")login();});
  checkStatus();
  async function checkStatus(){
    try{
      const response=await fetch("/api/login/status",{cache:"no-store"});
      if(response.ok){hideGate();return;}
    }catch{}
    showGate("");
  }
  async function login(){
    const accessCode=input.value.trim();
    if(!accessCode){showGate("请输入访问密码。");return;}
    button.disabled=true;
    error.textContent="正在验证...";
    try{
      const response=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accessCode})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||"访问密码不正确，请重新输入。");
      hideGate();
      if(isShare) location.reload();
    }catch(err){
      showGate(err.message||"访问密码不正确，请重新输入。");
    }finally{
      button.disabled=false;
    }
  }
  function showGate(message){
    document.body.classList.add("cc-locked");
    gate.hidden=false;
    error.textContent=message||"";
    setTimeout(()=>input.focus(),0);
  }
  function hideGate(){
    document.body.classList.remove("cc-locked");
    gate.hidden=true;
    error.textContent="";
  }
})();
</script>`;
  return html.includes("</body>") ? html.replace("</body>", `${extra}</body>`) : `${html}${extra}`;
}

function isProtectedPath(pathname) {
  return pathname === "/api/audit" || pathname.startsWith("/api/report/");
}

function isAuthorized(request) {
  const hashFromHeader = hashAllowedCode(request.headers["x-access-code"]);
  if (hashFromHeader) return true;
  const cookieHash = parseCookies(request.headers.cookie || "")[cookieName];
  return Boolean(cookieHash && accessCodeHashes.has(cookieHash));
}

function hashAllowedCode(accessCode) {
  const normalized = String(Array.isArray(accessCode) ? accessCode[0] : accessCode || "").trim().toLowerCase();
  if (!normalized) return "";
  const hash = hashAccessCode(normalized);
  return accessCodeHashes.has(hash) ? hash : "";
}

function configuredAccessCodeHashes(rawCodes) {
  const codes = String(rawCodes || "")
    .split(/[,\s，、]+/)
    .map((code) => code.trim().toLowerCase())
    .filter(Boolean);
  return codes.length ? new Set(codes.map(hashAccessCode)) : defaultAccessCodeHashes;
}

function hashAccessCode(accessCode) {
  return crypto.createHash("sha256").update(accessCode).digest("hex");
}

function parseCookies(cookieHeader) {
  return Object.fromEntries(
    String(cookieHeader || "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)]),
  );
}

function sessionCookie(hash, request) {
  const isHttps = request.headers["x-forwarded-proto"] === "https";
  return `${cookieName}=${encodeURIComponent(hash)}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax${isHttps ? "; Secure" : ""}`;
}

function readBody(request, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    request.on("data", (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new Error("请求内容过大"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function sendJson(response, status, data, extraHeaders = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...extraHeaders });
  response.end(JSON.stringify(data));
}

function sendHtml(response, status, html) {
  response.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
}

server.listen(publicPort, publicHost, () => {
  console.log(`Access wrapper running on ${publicHost}:${publicPort}`);
  console.log(`Upstream content checker running on ${upstreamHost}:${upstreamPort}`);
});
