// Submits the site's URLs to IndexNow (Bing, and other participating search
// engines) so new/changed pages get crawled quickly. Runs in CI after each
// GitHub Pages deploy; it reads the LIVE sitemap so it always submits exactly
// what is deployed. Safe to run manually: `npm run indexnow`.
//
// The key is public by design — IndexNow verifies ownership by fetching
// https://<host>/<key>.txt, which must be world-readable.

const HOST = 'nicholastrigger.com';
const KEY = 'ba7c9bb761b04533bf968ebee4297743';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Uses process.exitCode (not process.exit) so Node can wind down its network
// handles cleanly — exit() mid-fetch trips a libuv assertion on Windows.
async function main() {
  // 1. The key file must be live, otherwise submissions are silently invalid.
  const keyRes = await fetch(KEY_LOCATION);
  if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
    console.error(`indexnow: key file not reachable/valid at ${KEY_LOCATION} (HTTP ${keyRes.status})`);
    return 1;
  }

  // 2. Collect URLs from the deployed sitemap.
  const smRes = await fetch(`https://${HOST}/sitemap.xml`);
  if (!smRes.ok) {
    console.error(`indexnow: could not fetch sitemap.xml (HTTP ${smRes.status})`);
    return 1;
  }
  const urlList = [...(await smRes.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  if (urlList.length === 0) {
    console.error('indexnow: sitemap contained no URLs');
    return 1;
  }

  // 3. Submit the batch.
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });

  // 200 = submitted, 202 = accepted (key validation pending) — both are success.
  if (res.status === 200 || res.status === 202) {
    console.log(`indexnow: submitted ${urlList.length} URLs (HTTP ${res.status})`);
    return 0;
  }
  console.error(`indexnow: submission failed (HTTP ${res.status}): ${await res.text()}`);
  return 1;
}

process.exitCode = await main();
