const COOKIE_NAME = "dlc_access";
const COOKIE_VALUE = "granted";
const MAX_AGE = 60 * 60 * 12;

function loginPage(message = "") {
  const error = message ? `<p class="error">${message}</p>` : "";
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pleasantville Schools | Digital Learning Collective</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet"><style>:root{--hunter:#073821;--forrest:#2e7448;--cloud:#f1f1f2;--silver:#c9c9cb;--slate:#666667}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#fafafa;color:#1d1d1d;font-family:Figtree,system-ui,sans-serif;-webkit-font-smoothing:antialiased}.wrap{width:min(100% - 40px,470px);margin:0 auto;padding:14vh 0 60px}.brand{margin:0 0 13px;color:var(--forrest);font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase}h1{margin:0;color:var(--hunter);font-size:clamp(38px,8vw,50px);font-weight:600;letter-spacing:-.05em;line-height:1}p{margin:15px 0 34px;color:var(--slate);line-height:1.5}label{display:block;margin-bottom:8px;font-size:13px;font-weight:600}input{width:100%;padding:14px 15px;border:1px solid #d6d6d6;border-radius:11px;background:#f3f3f3;font:400 16px Figtree,system-ui,sans-serif;outline:none;transition:.2s cubic-bezier(.22,1,.36,1)}input:hover{background:#f7f7f7}input:focus{background:#fff;border-color:rgba(46,116,72,.65);box-shadow:0 0 0 4px rgba(46,116,72,.09),0 9px 26px rgba(7,56,33,.045);transform:translateY(-1px)}button{margin-top:14px;width:100%;padding:14px;border:0;border-radius:11px;background:var(--hunter);color:#fff;font:600 14px Figtree,system-ui,sans-serif;cursor:pointer;transition:.2s cubic-bezier(.22,1,.36,1)}button:hover{background:#0d4a2e;transform:translateY(-2px);box-shadow:0 8px 20px rgba(7,56,33,.15)}button:active{transform:scale(.98)}.error{color:#9b2f29;margin:0 0 18px;font-size:13px}</style></head><body><main class="wrap"><p class="brand">Pleasantville Schools</p><h1>Digital Learning Collective</h1><p>Enter the password to continue.</p>${error}<form method="POST" action="/__access"><label for="password">Password</label><input id="password" name="password" type="password" required autofocus autocomplete="current-password"><button type="submit">Continue</button></form></main></body></html>`, { status: message ? 401 : 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function hasAccess(request) {
  return (request.headers.get("cookie") || "").split(";").some(part => part.trim() === `${COOKIE_NAME}=${COOKIE_VALUE}`);
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.pathname === "/__access" && request.method === "POST") {
    const form = await request.formData();
    if (form.get("password") === "DLC") {
      return new Response(null, { status: 303, headers: { "location": "/", "set-cookie": `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`, "cache-control": "no-store" } });
    }
    return loginPage("That password is not correct. Please try again.");
  }

  if (!hasAccess(request)) return loginPage();
  return next();
}
