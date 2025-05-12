const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const liveActivity = {};
const historicActivity = {};
const seenRows = new WeakSet();

async function getHistoricalActivity(wallet, mint) {
  const url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=INSERT_YOUR_API_KEY_HERE&limit=1000`;

  try {
    const res = await fetch(url);
    const txs = await res.json();
    let buys = 0;
    let sells = 0;

    for (const tx of txs) {
      for (const t of tx.tokenTransfers || []) {
        if (t.mint !== mint) continue;
        if (t.toUserAccount === wallet && t.fromUserAccount !== wallet) buys++;
        if (t.fromUserAccount === wallet && t.toUserAccount !== wallet) sells++;
      }
    }

    historicActivity[wallet] = { buys, sells };
  } catch (e) {
    console.error("helius fetch failed", e);
    historicActivity[wallet] = { buys: 0, sells: 0 };
  }
}

const injectBadge = (el, buys, sells) => {
  const existing = el.querySelector(".wallet-badge");
  if (existing) existing.remove();

  const badge = document.createElement("span");
  badge.className = "wallet-badge";
  badge.innerText = `🟢${buys} 🔴${sells}`;
  el.appendChild(badge);
};

const scanWallets = async () => {
  const rows = document.querySelectorAll("div.c-grid-table__tr");
  const mint = new URLSearchParams(window.location.search).get("handle");
  if (!mint) return;

  const pendingLookups = new Set();

  for (const row of rows) {
    if (seenRows.has(row)) continue;

    const addrEl = row.querySelector("a[href*='solscan.io/account']");
    const typeEl = row.querySelector("div[data-id='type']");
    if (!addrEl || !typeEl) continue;

    const address = addrEl.href.split("/").pop();
    const type = typeEl.innerText.trim();

    if (!liveActivity[address]) liveActivity[address] = { buys: 0, sells: 0 };
    if (type === "Buy") liveActivity[address].buys++;
    if (type === "Sell") liveActivity[address].sells++;

    if (!historicActivity[address] && !pendingLookups.has(address)) {
      pendingLookups.add(address);
      getHistoricalActivity(address, mint);
    }

    seenRows.add(row);
  }

  for (const row of rows) {
    const addrEl = row.querySelector("a[href*='solscan.io/account']");
    if (!addrEl) continue;

    const address = addrEl.href.split("/").pop();
    const live = liveActivity[address] || { buys: 0, sells: 0 };
    const hist = historicActivity[address] || { buys: 0, sells: 0 };

    const totalBuys = live.buys + hist.buys;
    const totalSells = live.sells + hist.sells;

    injectBadge(addrEl, totalBuys, totalSells);
  }
};

setInterval(scanWallets, 2000);