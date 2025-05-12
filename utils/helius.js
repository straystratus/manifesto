export async function getBuySellCounts(wallet, mint) {
  const url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=YOUR_API_KEYd604c&limit=200`;

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
