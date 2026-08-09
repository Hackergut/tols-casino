// Mock admin data for demo without Base44 backend (localStorage + generated)
const LS_KEY = 'tols_mock_admin_v1';
const DEMO_ENABLED = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEMO_FALLBACK !== 'false');
// When VITE_DEMO_FALLBACK=false, mocks return empty / throw to force real backend

function rnd(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)] }

const GAME_NAMES = ['Crash','Dice','Mines','Plinko','Wheel','Keno','Limbo','Coinflip','Roulette','Sweet Bonanza','Gates of Olympus','Wolf Gold','Big Bass Bonanza','Book of Dead'];

function generateMockData() {
  const now = Date.now();
  const users = Array.from({length: 23}, (_,i)=> ({
    id: `u_${i+1}`,
    email: `player${i+1}@tols.local`,
    created_date: new Date(now - rnd(1, 30)*86400000).toISOString()
  }));
  const wallets = Array.from({length: 18}, (_,i)=> ({
    id: `w_${Math.random().toString(36).slice(2,10)}`,
    balance: +rnd(50, 25000).toFixed(2),
    total_wagered: +rnd(200, 85000).toFixed(2),
    xp: Math.floor(rnd(100, 5000)),
    vip_level: Math.floor(rnd(1,5)),
    updated_date: new Date(now - rnd(0,5)*86400000).toISOString()
  }));
  const bets = Array.from({length: 120}, (_,i)=> {
    const amount = +rnd(1, 500).toFixed(2);
    const isWin = Math.random() > 0.52;
    const mult = isWin ? rnd(1.1, 8) : 0;
    return {
      id: `b_${i+1}`,
      game_name: pick(GAME_NAMES),
      game_id: pick(GAME_NAMES).toLowerCase().replace(/ /g,'_'),
      amount,
      payout: isWin ? +(amount*mult).toFixed(2) : 0,
      result: isWin ? 'win' : 'lose',
      created_date: new Date(now - rnd(0,12)*3600000 - rnd(0,60)*60000).toISOString()
    };
  });
  const withdrawals = Array.from({length: 7}, (_,i)=> ({
    id: `wd_${i+1}`,
    amount: +rnd(50, 1500).toFixed(2),
    currency: 'USDT',
    chain: pick(['eth','polygon','solana','btc']),
    wallet_address: '0x'+Math.random().toString(16).slice(2,10)+'...'+Math.random().toString(16).slice(2,6),
    status: i < 3 ? 'pending' : pick(['approved','rejected']),
    created_date: new Date(now - rnd(0,48)*3600000).toISOString()
  }));
  const earnings = bets.slice(0,50).map(b=> ({
    id: `e_${b.id}`,
    game_name: b.game_name,
    game_id: b.game_id,
    wager: b.amount,
    payout: b.payout,
    house_profit: +(b.amount - b.payout).toFixed(2),
    created_date: b.created_date
  }));
  return { users, wallets, bets, withdrawals, earnings };
}

export function getMockAdminData() {
  if (!DEMO_ENABLED) return { users: [], wallets: [], bets: [], withdrawals: [], earnings: [] };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.bets?.length) return parsed;
    }
  } catch {}
  const fresh = generateMockData();
  try { localStorage.setItem(LS_KEY, JSON.stringify(fresh)); } catch {}
  return fresh;
}

export function resetMockAdminData() {
  localStorage.removeItem(LS_KEY);
  return getMockAdminData();
}

export function addMockBet(bet) {
  const data = getMockAdminData();
  data.bets.unshift(bet);
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
  return data;
}

export const DEMO_ADMIN_USER = { id: 'demo-admin', email: 'admin@tols.local', role: 'admin', name: 'Demo Admin' };

// ---- PlatformSettings mock (localStorage) ----
const LS_SETTINGS = 'tols_mock_settings_v1';
export function getMockPlatformSettings(category) {
  if (!DEMO_ENABLED) return [];
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    const all = raw ? JSON.parse(raw) : {};
    return Object.entries(all)
      .filter(([,v]) => v.category === category)
      .map(([k,v])=> ({ id: `mock_${k}`, key: k, value: v.value, category: v.category }));
  } catch { return []; }
}
export function setMockPlatformSetting(key, value, category) {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    const all = raw ? JSON.parse(raw) : {};
    all[key] = { value, category };
    localStorage.setItem(LS_SETTINGS, JSON.stringify(all));
  } catch {}
}
export function getAllMockSettings() {
  try { return JSON.parse(localStorage.getItem(LS_SETTINGS) || '{}'); } catch { return {}; }
}

// Mock sync results
export function mockSyncResult(type) {
  if (type === 'igaming') return { status: 'ok', fetched: 342, created: 12, updated: 28, hasMore: false };
  if (type === 'aggregator') return { status: 'ok', fetched: 120, created: 5, updated: 10 };
  return { created: 8, updated: 14, total: 156 };
}

// Demo sessions for DemoMonitor
export function getMockDemoSessions() {
  if (!DEMO_ENABLED) return [];
  const LS_DEMO = 'tols_mock_demo_v1';
  try {
    const raw = localStorage.getItem(LS_DEMO);
    if (raw) return JSON.parse(raw);
  } catch {}
  // generate 9 sessions
  const sessions = Array.from({length: 9}, (_,i)=> ({
    id: `ds_${i+1}`,
    wagered: +(Math.random()*8000+500).toFixed(2),
    payout: +(Math.random()*7500+400).toFixed(2),
    bets: Math.floor(Math.random()*80+10),
    refills: Math.floor(Math.random()*3),
    exhausted: Math.random()>0.7,
    game_stats: JSON.stringify({
      crash: { name: 'Crash', n: Math.floor(Math.random()*30), w: +(Math.random()*2000).toFixed(2), p: +(Math.random()*1900).toFixed(2) },
      dice: { name: 'Dice', n: Math.floor(Math.random()*25), w: +(Math.random()*1500).toFixed(2), p: +(Math.random()*1400).toFixed(2) },
    }),
    created_date: new Date(Date.now() - Math.random()*86400000*3).toISOString()
  }));
  try { localStorage.setItem(LS_DEMO, JSON.stringify(sessions)); } catch {}
  return sessions;
}

// ---- Cards / Packs / Marketplace mocks ----
const LS_CARDS = 'tols_mock_cards_v1';
const LS_PACKS = 'tols_mock_packs_v1';
const LS_LISTINGS = 'tols_mock_listings_v1';

export function getMockPacks() {
  if (!DEMO_ENABLED) return [];
  try {
    const raw = localStorage.getItem(LS_PACKS);
    if (raw) return JSON.parse(raw);
  } catch {}
  const packs = [
    { id: 'pack_starter', name: 'Starter Pack', collection: 'Pokémon', price: 15, currency: 'USDT', cards_per_pack: 3, enabled: true, description: '3 cards · Pokémon · perfect to start', image: '' },
    { id: 'pack_premium', name: 'Premium Vault', collection: 'NBA', price: 49, currency: 'USDT', cards_per_pack: 5, enabled: true, description: '5 cards · NBA · higher legendary rate', image: '' },
    { id: 'pack_elite', name: 'Elite FIFA', collection: 'FIFA', price: 99, currency: 'USDT', cards_per_pack: 5, enabled: true, description: '5 cards · FIFA icons · mythic chance', image: '' },
    { id: 'pack_f1', name: 'F1 Legends', collection: 'F1', price: 35, currency: 'USDT', cards_per_pack: 3, enabled: true, description: '3 cards · F1 legends', image: '' },
  ];
  try { localStorage.setItem(LS_PACKS, JSON.stringify(packs)); } catch {}
  return packs;
}

export function getMockCollectibleCards() {
  if (!DEMO_ENABLED) return [];
  try {
    const raw = localStorage.getItem(LS_CARDS);
    if (raw) return JSON.parse(raw);
  } catch {}
  // seed with 6 cards
  const seeded = [
    { id: 'c_1', collection: 'Pokémon', card_name: 'Charizard ex', rarity: 'legendary', insured_value: 6200, token_id: 'TOLS-001', grading_company: 'PSA', grading_id: 'PSA-9-001', image: '', created_date: new Date().toISOString() },
    { id: 'c_2', collection: 'NBA', card_name: 'LeBron James #23', rarity: 'mythic', insured_value: 18500, token_id: 'TOLS-002', grading_company: 'PSA', grading_id: 'PSA-10-002', image: '', created_date: new Date().toISOString() },
    { id: 'c_3', collection: 'FIFA', card_name: 'Mbappé Icon', rarity: 'epic', insured_value: 2100, token_id: 'TOLS-003', grading_company: 'PSA', grading_id: 'PSA-9-003', image: '', created_date: new Date().toISOString() },
    { id: 'c_4', collection: 'Pokémon', card_name: 'Pikachu V', rarity: 'rare', insured_value: 450, token_id: 'TOLS-004', grading_company: 'PSA', grading_id: 'PSA-8-004', image: '', created_date: new Date().toISOString() },
    { id: 'c_5', collection: 'F1', card_name: 'Verstappen #1', rarity: 'legendary', insured_value: 5400, token_id: 'TOLS-005', grading_company: 'PSA', grading_id: 'PSA-9-005', image: '', created_date: new Date().toISOString() },
    { id: 'c_6', collection: 'UFC', card_name: 'Conor McGregor', rarity: 'epic', insured_value: 1800, token_id: 'TOLS-006', grading_company: 'PSA', grading_id: 'PSA-9-006', image: '', created_date: new Date().toISOString() },
  ];
  try { localStorage.setItem(LS_CARDS, JSON.stringify(seeded)); } catch {}
  return seeded;
}
export function setMockCollectibleCards(list) {
  try { localStorage.setItem(LS_CARDS, JSON.stringify(list)); } catch {}
}
export function addMockCollectibleCards(newCards) {
  const cur = getMockCollectibleCards();
  const next = [...newCards, ...cur];
  setMockCollectibleCards(next);
  return next;
}

export function getMockListings() {
  if (!DEMO_ENABLED) return [];
  try {
    const raw = localStorage.getItem(LS_LISTINGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  const listings = [
    { id: 'l_1', card_name: 'Charizard ex', collection: 'Pokémon', rarity: 'legendary', price: 5800, currency: 'USDT', listing_type: 'sale', status: 'active', created_date: new Date().toISOString(), updated_date: new Date().toISOString(), created_by_id: 'other' },
    { id: 'l_2', card_name: 'LeBron James #23', collection: 'NBA', rarity: 'mythic', price: 17200, currency: 'USDT', listing_type: 'sale', status: 'active', created_date: new Date().toISOString(), updated_date: new Date().toISOString(), created_by_id: 'other' },
    { id: 'l_3', card_name: 'Haaland Gold', collection: 'FIFA', rarity: 'legendary', price: 4200, currency: 'USDT', listing_type: 'swap', status: 'active', created_date: new Date().toISOString(), updated_date: new Date().toISOString(), created_by_id: 'other' },
  ];
  try { localStorage.setItem(LS_LISTINGS, JSON.stringify(listings)); } catch {}
  return listings;
}
export function setMockListings(list) {
  try { localStorage.setItem(LS_LISTINGS, JSON.stringify(list)); } catch {}
}

// Slot catalog mock (fallback slots)
export function getMockSlots() {
  if (!DEMO_ENABLED) return [];
  return [
    { id: 'wanted', slug: 'wanted', name: 'Wanted Dead or a Wild', provider: 'Hacksaw', demo_url: '', accent: '#f97316', category: 'slots', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop' },
    { id: 'sugar-rush', slug: 'sugar-rush', name: 'Sugar Rush', provider: 'Pragmatic', demo_url: '', accent: '#ec4899', category: 'slots', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop' },
    { id: 'gates-of-olympus', slug: 'gates-of-olympus', name: 'Gates of Olympus', provider: 'Pragmatic', demo_url: '', accent: '#a855f7', category: 'slots', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=500&fit=crop' },
    { id: 'book-of-shadows', slug: 'book-of-shadows', name: 'Book of Shadows', provider: 'Nolimit', demo_url: '', accent: '#eab308', category: 'slots', image: 'https://images.unsplash.com/photo-1535666669445-2c61900d215f?w=400&h=500&fit=crop' },
    { id: 'big-bass-splash', slug: 'big-bass-splash', name: 'Big Bass Splash', provider: 'Pragmatic', demo_url: '', accent: '#22c55e', category: 'slots', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=500&fit=crop' },
    { id: 'dog-house', slug: 'dog-house', name: 'The Dog House', provider: 'Pragmatic', demo_url: '', accent: '#f59e0b', category: 'slots', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=500&fit=crop' },
    { id: 'floating-dragon', slug: 'floating-dragon', name: 'Floating Dragon', provider: 'Reel Kingdom', demo_url: '', accent: '#a855f7', category: 'slots', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=500&fit=crop' },
    { id: 'sweet-bonanza', slug: 'sweet-bonanza', name: 'Sweet Bonanza', provider: 'Pragmatic', demo_url: '', accent: '#ccff00', category: 'slots', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop' },
  ];
}

// ---- Tournaments / Chat / Community mocks ----
const LS_TOURNAMENTS = 'tols_mock_tournaments_v1';
const LS_ENTRIES = 'tols_mock_entries_v1';
const LS_CHAT = 'tols_mock_chat_v1';
export function getMockTournaments() {
  if (!DEMO_ENABLED) return [];
  try { const raw=localStorage.getItem(LS_TOURNAMENTS); if(raw) return JSON.parse(raw);} catch{}
  const now=Date.now();
  const list=[
    { id:'t_weekly', name:'Weekly Masters', description:'Top wagered wins', prize_pool: 5000, currency:'USDT', status:'active', participants_count: 142, max_participants: 500, start_date: new Date(now-2*86400000).toISOString(), end_date: new Date(now+5*86400000).toISOString(), created_date: new Date(now-7*86400000).toISOString() },
    { id:'t_daily', name:'Daily Sprint', description:'Fast 24h race', prize_pool: 800, currency:'USDT', status:'active', participants_count: 89, max_participants: 200, start_date: new Date(now-12*3600000).toISOString(), end_date: new Date(now+12*3600000).toISOString(), created_date: new Date(now-86400000).toISOString() },
    { id:'t_vip', name:'VIP High Rollers', description:'Min wager 5k', prize_pool: 15000, currency:'USDT', status:'upcoming', participants_count: 12, max_participants: 100, start_date: new Date(now+3*86400000).toISOString(), end_date: new Date(now+10*86400000).toISOString(), created_date: new Date(now-3*86400000).toISOString() },
  ];
  try{localStorage.setItem(LS_TOURNAMENTS, JSON.stringify(list));}catch{}
  return list;
}
export function getMockEntries() {
  if (!DEMO_ENABLED) return [];
  try{const raw=localStorage.getItem(LS_ENTRIES); if(raw) return JSON.parse(raw);}catch{}
  const entries=[
    { id:'e1', tournament_id:'t_weekly', username:'Whale_88', wagered: 45200, wins: 88, biggest_win: 4200 },
    { id:'e2', tournament_id:'t_weekly', username:'CryptoKid', wagered: 32100, wins: 54, biggest_win: 3100 },
    { id:'e3', tournament_id:'t_weekly', username:'LuckyDuck', wagered: 28900, wins: 42, biggest_win: 2800 },
    { id:'e4', tournament_id:'t_weekly', username:'MoonBoy', wagered: 12100, wins: 19, biggest_win: 1500 },
    { id:'e5', tournament_id:'t_daily', username:'DiceKing', wagered: 5400, wins: 22, biggest_win: 900 },
  ];
  try{localStorage.setItem(LS_ENTRIES, JSON.stringify(entries));}catch{}
  return entries;
}
export function addMockEntry(username, tournament_id, wagered=0) {
  const cur=getMockEntries();
  cur.push({ id:'e_'+Date.now(), tournament_id, username, wagered, wins:0, biggest_win:0 });
  try{localStorage.setItem(LS_ENTRIES, JSON.stringify(cur));}catch{}
  return cur;
}
export function getMockChat(channel='generale') {
  if (!DEMO_ENABLED) return [];
  const key=LS_CHAT+'_'+channel;
  try{const raw=localStorage.getItem(key); if(raw) return JSON.parse(raw);}catch{}
  const seed=[
    { id:'m1', username:'Alice', avatar_color:'#ccff00', message:'Welcome to TOLS! 🚀', channel, created_date: new Date(Date.now()-3600000*2).toISOString()},
    { id:'m2', username:'Bob', avatar_color:'#4f8aff', message:'Just hit 5x on Crash!', channel, created_date: new Date(Date.now()-3600000).toISOString()},
    { id:'m3', username:'Carol', avatar_color:'#ff4fa3', message:'Anyone opening packs?', channel, created_date: new Date(Date.now()-1800000).toISOString()},
  ];
  try{localStorage.setItem(key, JSON.stringify(seed));}catch{}
  return seed;
}
export function addMockChat(channel, msg, user) {
  const key=LS_CHAT+'_'+channel;
  const list=getMockChat(channel);
  list.push({ id:'m_'+Date.now(), username: user.full_name||user.email||'Guest', avatar_color: user.avatar_color||'#ccff00', message: msg, channel, created_date: new Date().toISOString()});
  try{localStorage.setItem(key, JSON.stringify(list));}catch{}
  return list;
}

