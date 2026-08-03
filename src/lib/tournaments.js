export const DEMO_LEADERS = [
  { username: "CryptoKing", wagered: 284500, wins: 1240, biggest_win: 18200, avatar_color: "#ccff00" },
  { username: "NeonShark", wagered: 201300, wins: 980, biggest_win: 9800, avatar_color: "#4f8aff" },
  { username: "LunaBet", wagered: 178900, wins: 1120, biggest_win: 7600, avatar_color: "#ff6b9d" },
  { username: "SatoshiJr", wagered: 156700, wins: 870, biggest_win: 12500, avatar_color: "#d4a017" },
  { username: "WagerWolf", wagered: 132400, wins: 760, biggest_win: 6400, avatar_color: "#c43d2a" },
  { username: "PlinkoPro", wagered: 118900, wins: 690, biggest_win: 5300, avatar_color: "#1a8a6a" },
  { username: "CrashQueen", wagered: 96500, wins: 540, biggest_win: 14200, avatar_color: "#ff4fa3" },
  { username: "DiceDaddy", wagered: 84200, wins: 610, biggest_win: 4200, avatar_color: "#6a4ac4" },
  { username: "MinesMaster", wagered: 71800, wins: 430, biggest_win: 3800, avatar_color: "#2a8a6a" },
  { username: "LimboLegend", wagered: 64300, wins: 380, biggest_win: 9100, avatar_color: "#ff8a4f" },
  { username: "RouletteRex", wagered: 52100, wins: 290, biggest_win: 2600, avatar_color: "#8a1a1a" },
  { username: "KenoKnight", wagered: 43600, wins: 240, biggest_win: 3400, avatar_color: "#1a4a8a" },
  { username: "SpinSultan", wagered: 38900, wins: 210, biggest_win: 2200, avatar_color: "#d4a017" },
  { username: "BetBaron", wagered: 31200, wins: 180, biggest_win: 1900, avatar_color: "#3a5a3a" },
  { username: "JackpotJane", wagered: 27800, wins: 150, biggest_win: 8800, avatar_color: "#ff6b9d" },
];

export function buildLeaderboard(userStats) {
  const board = [...DEMO_LEADERS];
  if (userStats && userStats.username && userStats.wagered > 0) {
    board.push({
      username: userStats.username,
      wagered: userStats.wagered,
      wins: userStats.wins || 0,
      biggest_win: userStats.biggest_win || 0,
      avatar_color: userStats.avatar_color || "#ccff00",
      isCurrentUser: true,
    });
  }
  board.sort((a, b) => b.wagered - a.wagered);
  return board.map((row, i) => ({ ...row, rank: i + 1 }));
}

export function formatPrize(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${n}`;
}