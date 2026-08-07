export const COINS = [
  { id: "solana", symbol: "SOL", name: "Solana", color: "#9945FF", network: "Solana", fee: 0.01, placeholder: "7xKp...3fQ" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA", network: "ERC20", fee: 0.76, placeholder: "0xAb...3F" },
  { id: "polygon", symbol: "POL", name: "Polygon", color: "#8247E5", network: "Polygon", fee: 0.05, placeholder: "0xAb...3F" },
];

export const coinById = (id) => COINS.find((c) => c.id === id) || COINS[0];