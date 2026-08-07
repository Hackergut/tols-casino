const COLORS = ["#ccff00", "#4f8aff", "#ff4fa3", "#ff8a4f", "#2a8a6a", "#c4a01a", "#8a5a1a", "#a06aff"];

export function userColor(name) {
  let h = 0;
  const s = String(name || "x");
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

/**
 * Real, account-based leaderboard. Aggregates real TournamentEntry records by
 * username (live-synced from every bet the player places). The current user is
 * seeded from their own wallet/bet stats so they appear even before joining a
 * tournament. No mock players.
 */
export function buildLeaderboard(entries, currentUser) {
  const map = new Map();
  for (const e of entries || []) {
    const key = e.username || "Player";
    const cur = map.get(key) || { username: key, wagered: 0, wins: 0, biggest_win: 0 };
    cur.wagered += Number(e.wagered) || 0;
    cur.wins += Number(e.wins) || 0;
    cur.biggest_win = Math.max(cur.biggest_win, Number(e.biggest_win) || 0);
    map.set(key, cur);
  }

  if (currentUser && currentUser.username && !map.has(currentUser.username) && (currentUser.wagered || 0) > 0) {
    map.set(currentUser.username, {
      username: currentUser.username,
      wagered: currentUser.wagered,
      wins: currentUser.wins || 0,
      biggest_win: currentUser.biggest_win || 0,
    });
  }

  let board = [...map.values()].map((r) => ({ ...r, avatar_color: userColor(r.username) }));
  if (currentUser && currentUser.username) {
    board = board.map((r) => (r.username === currentUser.username ? { ...r, isCurrentUser: true } : r));
  }
  board.sort((a, b) => b.wagered - a.wagered);
  return board.map((r, i) => ({ ...r, rank: i + 1 }));
}

export function formatPrize(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${n}`;
}