export async function getBuySellCounts(wallet, mint) {
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
    console.error("Erreur Helius:", e);
    return { buys: 0, sells: 0 };
  }
}
