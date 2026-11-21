/**
 * ZQF.DRIVE API — Cloudflare Pages Function (single file routing)
 *
 * 路由（均从 /api/drive?action=... 进入）：
 *   GET  ?action=state   → 公开，返回是否配置了密码（用于前端提示）
 *   POST ?action=login   → 校验密码，通过则返回一个短期 token（HMAC）
 *   GET  ?action=list    → 需 token，列出文件（含 customMetadata）
 *   GET  ?action=info    → 公开，凭 code 返回文件元信息（分享页展示用）
 *   GET  ?action=get     → 公开，凭 code 下载文件本体
 *   POST ?action=upload  → 需 token，上传，返回 code
 *   POST ?action=remove  → 需 token，按 code 删除
 *
 * 存储：R2 绑定名 DRIVE_BUCKET；管理员密码来自环境变量 DRIVE_PASS。
 * 安全：管理操作用 HMAC 签名的短期 token 鉴权；下载用 128bit 随机 code
 *      作为“持有即授权”的能力 URL，code 不可从文件列表之外的途径猜出。
 */

const DAY = 86400000;
const MAX_FILE = 90 * 1024 * 1024; // 免费版 Worker 请求体上限 100MB，留余量
const CODE_RE = /^[0-9a-f]{32}$/;

const j = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const randCode = () => {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
};

const b64url = (buf) => {
  const s = typeof buf === 'string' ? buf : String.fromCharCode(...new Uint8Array(buf));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function hmacKey(secret) {
  return await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  );
}

async function sign(secret, payload, expMs) {
  const body = `${payload}.${expMs}`;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), new TextEncoder().encode(body));
  return `${body}.${b64url(sig)}`;
}

async function verify(secret, token) {
  if (!token || !envSaltOk(secret)) return false;
  const parts = String(token).split('.');
  if (parts.length !== 3) return false;
  const [payload, exp, sig] = parts;
  if (!/^\d+$/.test(exp) || Date.now() > Number(exp)) return false;
  const expect = await sign(secret, payload, exp);
  return constantEqual(expect, token);
}

function envSaltOk(secret) { return !!secret && secret.length >= 8; }

function constantEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function authToken(request) {
  const h = request.headers.get('authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7) : (request.headers.get('x-auth') || '');
}

function decodeName(md) {
  try { return decodeURIComponent(md.name || '未命名文件'); }
  catch { return md.name || '未命名文件'; }
}

export async function onRequest({ request, env }) {
  const bucket = env.DRIVE_BUCKET;
  const secret = env.DRIVE_PASS;
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'list';

  if (!bucket) return j({ ok: false, error: '存储桶未绑定，请在 Cloudflare 绑定 R2 桶 DRIVE_BUCKET。', code: 'NO_BUCKET' }, 503);

  // 公开：配置状态
  if (action === 'state') {
    return j({ ok: true, configured: envSaltOk(secret), maxFile: MAX_FILE });
  }

  // 公开：登录换 token
  if (action === 'login') {
    if (!envSaltOk(secret)) return j({ ok: false, error: '管理员密码未配置。', code: 'NO_PASS' }, 503);
    let input = '';
    const raw = await request.text().catch(() => '');
    if (raw && raw[0] === '{') { try { input = JSON.parse(raw).pass || ''; } catch { input = ''; } }
    else input = raw || (request.headers.get('x-pass') || '');
    if (!constantEqual(String(input), secret)) return j({ ok: false, error: '密码不正确。' }, 401);
    const payload = 'admin';
    const exp = String(Date.now() + 7 * DAY);
    return j({ ok: true, token: await sign(secret, payload, exp), expires: Number(exp) });
  }

  // 公开：文件元信息（分享页用）
  if (action === 'info') {
    const code = url.searchParams.get('code') || '';
    if (!CODE_RE.test(code)) return j({ ok: false, error: '文件编号无效。' }, 400);
    const obj = await bucket.head(code);
    if (!obj) return j({ ok: false, error: '文件不存在或已被删除。' }, 404);
    const md = obj.customMetadata || {};
    return j({
      ok: true, name: decodeName(md), size: Number(md.size || obj.size || 0),
      type: md.type || 'application/octet-stream', uploaded: md.uploaded || '', code,
    });
  }

  // 公开：下载文件本体
  if (action === 'get') {
    const code = url.searchParams.get('code') || '';
    if (!CODE_RE.test(code)) return j({ ok: false, error: '文件编号无效。' }, 400);
    const obj = await bucket.get(code);
    if (!obj) return j({ ok: false, error: '文件不存在或已被删除。' }, 404);
    const md = obj.customMetadata || {};
    const name = decodeName(md);
    const type = md.type || 'application/octet-stream';
    const dl = url.searchParams.get('dl') === '1';
    const headers = {
      'content-type': type,
      'cache-control': 'private, no-store',
      'content-disposition': `${dl ? 'attachment' : 'inline'}; filename="file"; filename*=UTF-8''${encodeURIComponent(name)}`,
    };
    if (obj.size != null) headers['content-length'] = String(obj.size);
    return new Response(obj.body, { headers });
  }

  // 以下操作需要管理员 token
  if (!envSaltOk(secret)) return j({ ok: false, error: '管理员密码未配置。', code: 'NO_PASS' }, 503);
  if (!(await verify(secret, authToken(request)))) return j({ ok: false, error: '未授权，请重新登录。' }, 401);

  if (action === 'list') {
    const files = [];
    let cursor;
    do {
      const page = await bucket.list({ include: ['customMetadata'], limit: 1000, cursor });
      for (const o of page.objects) {
        const md = o.customMetadata || {};
        files.push({
          code: o.key, name: decodeName(md), size: Number(md.size || o.size || 0),
          type: md.type || 'application/octet-stream', uploaded: md.uploaded || '',
        });
      }
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    files.sort((a, b) => String(b.uploaded).localeCompare(String(a.uploaded)));
    return j({ ok: true, files });
  }

  if (action === 'upload') {
    const name = url.searchParams.get('name') || '未命名文件';
    const type = url.searchParams.get('type') || 'application/octet-stream';
    const size = Number(request.headers.get('x-file-size') || 0);
    if (size > MAX_FILE) return j({ ok: false, error: `单文件上限 ${Math.round(MAX_FILE / 1024 / 1024)}MB。` }, 413);
    const code = randCode();
    await bucket.put(code, request.body, {
      httpMetadata: { contentType: type },
      customMetadata: {
        name: encodeURIComponent(name), type, size: String(size),
        uploaded: new Date().toISOString(),
      },
    });
    return j({ ok: true, code, name, size, url: `/13-drive/get.html?code=${code}` });
  }

  if (action === 'remove') {
    const code = url.searchParams.get('code') || '';
    if (!CODE_RE.test(code)) return j({ ok: false, error: '文件编号无效。' }, 400);
    await bucket.delete(code);
    return j({ ok: true });
  }

  return j({ ok: false, error: '未知操作。' }, 400);
}
