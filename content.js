const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const walletActivity = {}; // { [walletAddress]: { buys: 0, sells: 0 } }

async function getBuySellCounts(wallet, mint) {
  const url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=6d36f6d7-558b-4e67-8b76-a0e8881d604c&limit=200`;

  try {
    const res = await fetch(url);
    const txs = await res.json();

    let buys = 0;
    let sells = 0;

    for (const tx of txs) {
      for (const t of tx.tokenTransfers || []) {
        if (t.mint !== mint) continue;
        if (t.toUserAccount === wallet) buys++;
        if (t.fromUserAccount === wallet) sells++;
      }
    }

    return { buys, sells };
  } catch (e) {
    console.error("helius error", e);
    return { buys: 0, sells: 0 };
  }
}

const injectBadge = (el, buys, sells) => {
  const existing = el.querySelector(".wallet-badge");
  if (existing) existing.remove(); // clean ancien badge

  const badge = document.createElement("span");
  badge.className = "wallet-badge";
  badge.innerText = `🟢${buys} 🔴${sells}`;
  el.appendChild(badge);
};

const scanWallets = async () => {
  const rows = document.querySelectorAll("div.c-grid-table__tr");

  for (const row of rows) {
    if (row.dataset.processed === "true") continue;

    const addrEl = row.querySelector("a[href*='solscan.io/account']");
    const typeEl = row.querySelector("div[data-id='type']");
    if (!addrEl || !typeEl) continue;

    const address = addrEl.href.split("/").pop();
    const type = typeEl.innerText.trim();

    if (!walletActivity[address]) {
      walletActivity[address] = { buys: 0, sells: 0 };
    }

    if (type === "Buy") walletActivity[address].buys++;
    if (type === "Sell") walletActivity[address].sells++;

    row.dataset.processed = "true";

    const { buys, sells } = walletActivity[address];
    injectBadge(addrEl, buys, sells);
  }
};

setInterval(scanWallets, 3000);