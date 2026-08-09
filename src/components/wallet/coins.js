// TOLS Coins — TOLS professional — multi-chain support
// Supports BTC/ETH/SOL/USDT/LTC/DOGE/BCH etc. — TOLS focuses on USDT chains + BTC for crypto casino
export const COINS = [
  { id: "btc", symbol: "BTC", name: "Bitcoin", color: "#f7931a", network: "Bitcoin", fee: 0.00005, min: 0.0001, placeholder: "bc1q...x8f2" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA", network: "ERC20", fee: 0.002, min: 0.005, placeholder: "0xAb...3F" },
  { id: "solana", symbol: "SOL", name: "Solana", color: "#9945FF", network: "Solana", fee: 0.01, min: 0.01, placeholder: "7xKp...3fQ" },
  { id: "polygon", symbol: "POL", name: "Polygon", color: "#8247E5", network: "Polygon", fee: 0.05, min: 1, placeholder: "0xAb...3F" },
  { id: "usdt_erc20", symbol: "USDT", name: "Tether ERC20", color: "#26a17b", network: "ERC20", fee: 5, min: 10, placeholder: "0xAb...3F" },
  { id: "usdt_trc20", symbol: "USDT", name: "Tether TRC20", color: "#26a17b", network: "TRC20", fee: 1, min: 10, placeholder: "TAb...3F" },
  { id: "ltc", symbol: "LTC", name: "Litecoin", color: "#345d9d", network: "Litecoin", fee: 0.001, min: 0.01, placeholder: "ltc1q...x9f" },
];

export const coinById = (id) => COINS.find((c) => c.id === id) || COINS.find((c)=> c.id==="solana");
export const TOLS_COINS = COINS;
