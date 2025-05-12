
## photon wallet tracker

a lightweight chrome extension that annotates wallets on photon with their buy/sell count for a specific token. it shows a green number for buys and red for sells.

### features
- tracks how many times a wallet has bought or sold the currently viewed token
- displays a live badge next to each wallet
- updates automatically as new wallets appear

### installation
1. clone or download this repo
2. open chrome and go to `chrome://extensions`
3. enable "developer mode"
4. click "load unpacked" and select the project directory

### requirements
- a valid helius api key (insert it in `utils/helius.js`)

### file structure
```
├── background.js
├── content.js
├── manifest.json
├── popup/
│   ├── popup.html
│   └── popup.js
├── styles/
│   └── badge.css
├── utils/
│   └── helius.js
```

### customization
- adjust css styles in `styles/badge.css` for different appearance
- update selector logic in `content.js` if photon layout changes

### notes
this extension only runs on photon-sol.tinyastro.io. it fetches transaction data using the helius api and displays visual indicators without modifying the platform layout.
