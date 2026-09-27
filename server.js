// server.js - 島遊大亨（手機部署用單檔合併版：所有邏輯都在這一個檔案裡）
// src/board.js
// 台灣環島棋盤資料。共 40 格，形成環島一圈的迴圈路線。
// type: start | property | card_night | card_daily | hsr | typhoon | parking | hotspring | traffic_jam

const REGION_COLOR = {
  north: '#2E86FF',   // 台灣海洋藍 - 北部
  central: '#2FAE60', // 山林綠 - 中部
  south: '#FF8C42',   // 夕陽橘 - 南部
  east: '#9B6FD6',    // 紫 - 東部
};

const REGION_NAME = {
  north: '北部',
  central: '中部',
  south: '南部',
  east: '東部',
};

// 每個地區完整/多數持有的加成標題
const REGION_TITLE = {
  north: '台北王',
  central: '中台灣霸主',
  south: '南霸天',
  east: '後山之王',
};

const board = [
  { id: 0, type: 'start', name: '台北車站', emoji: '🚩', desc: '環島起點，每經過一次獲得 NT$2000 旅遊補助！' },
  { id: 1, type: 'property', name: '台北101', emoji: '🏙️', city: '台北', region: 'north', price: 4800, baseFee: 480 },
  { id: 2, type: 'property', name: '西門町', emoji: '🛍️', city: '台北', region: 'north', price: 3800, baseFee: 380 },
  { id: 3, type: 'property', name: '士林夜市', emoji: '🍡', city: '台北', region: 'north', price: 3200, baseFee: 320, isNightMarket: true },
  { id: 4, type: 'card_night', name: '夜市時間', emoji: '🌙' },
  { id: 5, type: 'property', name: '淡水老街', emoji: '🌇', city: '新北', region: 'north', price: 2800, baseFee: 280 },
  { id: 6, type: 'hsr', name: '高鐵台北站', emoji: '🚄' },
  { id: 7, type: 'property', name: '九份山城', emoji: '🏮', city: '新北', region: 'north', price: 3500, baseFee: 350 },
  { id: 8, type: 'property', name: '基隆廟口', emoji: '🥟', city: '基隆', region: 'north', price: 2500, baseFee: 250, isNightMarket: true },
  { id: 9, type: 'card_daily', name: '台灣日常', emoji: '🎴' },
  { id: 10, type: 'property', name: '羅東夜市', emoji: '🎡', city: '宜蘭', region: 'east', price: 2600, baseFee: 260, isNightMarket: true },
  { id: 11, type: 'typhoon', name: '颱風假', emoji: '🌪️' },
  { id: 12, type: 'property', name: '七星潭', emoji: '🌊', city: '花蓮', region: 'east', price: 3200, baseFee: 320 },
  { id: 13, type: 'property', name: '三仙台', emoji: '🌅', city: '台東', region: 'east', price: 3000, baseFee: 300 },
  { id: 14, type: 'parking', name: '停車場', emoji: '🅿️' },
  { id: 15, type: 'property', name: '墾丁', emoji: '🏖️', city: '屏東', region: 'south', price: 4200, baseFee: 420 },
  { id: 16, type: 'property', name: '六合夜市', emoji: '🍢', city: '高雄', region: 'south', price: 2800, baseFee: 280, isNightMarket: true },
  { id: 17, type: 'property', name: '駁二藝術特區', emoji: '🎨', city: '高雄', region: 'south', price: 3200, baseFee: 320 },
  { id: 18, type: 'hsr', name: '高鐵左營站', emoji: '🚄' },
  { id: 19, type: 'hsr', name: '高鐵台南站', emoji: '🚄' },
  { id: 20, type: 'property', name: '安平古堡', emoji: '🏯', city: '台南', region: 'south', price: 3200, baseFee: 320 },
  { id: 21, type: 'property', name: '花園夜市', emoji: '🎪', city: '台南', region: 'south', price: 3000, baseFee: 300, isNightMarket: true },
  { id: 22, type: 'property', name: '赤崁樓', emoji: '⛩️', city: '台南', region: 'south', price: 2800, baseFee: 280 },
  { id: 23, type: 'card_night', name: '夜市時間', emoji: '🌙' },
  { id: 24, type: 'property', name: '阿里山', emoji: '🌲', city: '嘉義', region: 'south', price: 4000, baseFee: 400, special: 'alishan' },
  { id: 25, type: 'hotspring', name: '泡溫泉', emoji: '♨️' },
  { id: 26, type: 'property', name: '鹿港老街', emoji: '🏘️', city: '彰化', region: 'central', price: 2800, baseFee: 280 },
  { id: 27, type: 'property', name: '逢甲夜市', emoji: '🌃', city: '台中', region: 'central', price: 3500, baseFee: 350, isNightMarket: true },
  { id: 28, type: 'property', name: '台中國家歌劇院', emoji: '🎭', city: '台中', region: 'central', price: 3800, baseFee: 380 },
  { id: 29, type: 'hsr', name: '高鐵台中站', emoji: '🚄' },
  { id: 30, type: 'property', name: '高美濕地', emoji: '🌅', city: '台中', region: 'central', price: 3000, baseFee: 300, special: 'gaomei' },
  { id: 31, type: 'card_daily', name: '台灣日常', emoji: '🎴' },
  { id: 32, type: 'property', name: '三義木雕街', emoji: '🪵', city: '苗栗', region: 'north', price: 2200, baseFee: 220 },
  { id: 33, type: 'traffic_jam', name: '塞車中', emoji: '🚗' },
  { id: 34, type: 'property', name: '新竹城隍廟', emoji: '🛕', city: '新竹', region: 'north', price: 2400, baseFee: 240 },
  { id: 35, type: 'card_night', name: '夜市時間', emoji: '🌙' },
  { id: 36, type: 'property', name: '桃園國際機場', emoji: '✈️', city: '桃園', region: 'north', price: 4000, baseFee: 400, special: 'airport' },
  { id: 37, type: 'card_daily', name: '台灣日常', emoji: '🎴' },
  { id: 38, type: 'property', name: '平溪天燈', emoji: '🏮', city: '新北', region: 'north', price: 2600, baseFee: 260 },
  { id: 39, type: 'card_daily', name: '台灣日常', emoji: '🎴' },
];

const HSR_STATIONS = board.filter(t => t.type === 'hsr').map(t => t.id);

const LEVEL_MULTIPLIER = [1, 1.3, 1.7, 2.2, 2.8, 3.5]; // index = level (0~5)
const UPGRADE_COST_RATIO = 0.6; // 每次升級花費 = price * ratio

function createBoardState() {
  // 回傳一份乾淨的棋盤狀態（含可變動的 owner/level）
  return board.map(tile => ({
    ...tile,
    owner: null,
    level: tile.type === 'property' ? 1 : undefined,
  }));
}

function getRegionProperties(boardState, region) {
  return boardState.filter(t => t.type === 'property' && t.region === region);
}

// src/cards.js
// 事件卡資料。effect.type 由 game.js 解讀執行：
// pay(固定支出) / gain(固定收入) / randomGain(隨機收入) / move(相對移動格數)
// skipTurn(下回合停權) / diceBonus(下次骰子加值)

const NIGHT_MARKET_CARDS = [
  { text: '你夾娃娃上癮了，連續投了好幾次代幣。', effect: { type: 'pay', amount: 300 } },
  { text: '雞排老闆多送你一塊！', effect: { type: 'gain', amount: 200 } },
  { text: '你花 NT$100 套圈圈，居然套中最大的獎！', effect: { type: 'gain', amount: 1000 } },
  { text: '臭豆腐太香，你忍不住吃了三份。', effect: { type: 'pay', amount: 250 } },
  { text: '珍珠奶茶第二杯半價，順便加了珍珠布丁！', effect: { type: 'pay', amount: 100 } },
  { text: '夜市人太多，你跟朋友走散了。', effect: { type: 'move', amount: 'random-1-3' } },
  { text: '你在夜市看到熟人，開心聊了 30 分鐘。', effect: { type: 'none' } },
  { text: '射氣球神準，老闆佩服地送你一個小獎品。', effect: { type: 'gain', amount: 150 } },
  { text: '你買了一堆你根本吃不完的滷味。', effect: { type: 'pay', amount: 200 } },
  { text: '大腸包小腸加辣，爽度全開！', effect: { type: 'gain', amount: 50 } },
  { text: '你在彈珠台大殺四方，換到一堆小獎品折現。', effect: { type: 'gain', amount: 400 } },
  { text: '手搖飲店家把你的訂單搞錯，招待你一杯新品。', effect: { type: 'gain', amount: 100 } },
  { text: '停車格難找，你多繞了半小時才找到夜市入口。', effect: { type: 'pay', amount: 150 } },
  { text: '你在牛排攤被推銷升級套餐，荷包默默扁了。', effect: { type: 'pay', amount: 350 } },
  { text: '刮鬍刀小販的推銷術太強，你買了一把根本用不到的。', effect: { type: 'pay', amount: 300 } },
  { text: '你幫忙顧了一下攤位，老闆塞給你一杯飲料錢。', effect: { type: 'gain', amount: 80 } },
  { text: '排隊排到腳痠，但雞蛋糕真的值得。', effect: { type: 'pay', amount: 60 } },
  { text: '你的鹽酥雞加了滿滿九層塔，心情大好。', effect: { type: 'diceBonus', amount: 1 } },
  { text: '有人在夜市發傳單送你免費小吃兌換券。', effect: { type: 'gain', amount: 120 } },
  { text: '你不小心把飲料灑在自己身上，得買件新衣服。', effect: { type: 'pay', amount: 200 } },
  { text: '射飛鏢神準命中大獎，攤主直呼內行！', effect: { type: 'gain', amount: 600 } },
  { text: '你和朋友分食了整條夜市，花費比想像中多。', effect: { type: 'pay', amount: 400 } },
];

const DAILY_LIFE_CARDS = [
  { text: '統一發票中獎！', effect: { type: 'gain', amount: 2000 } },
  { text: '機車突然需要保養。', effect: { type: 'pay', amount: 800 } },
  { text: '今天油價漲了。', effect: { type: 'pay', amount: 300 } },
  { text: '朋友結婚，紅包跑不掉。', effect: { type: 'pay', amount: 1200 } },
  { text: '公司發年終！', effect: { type: 'gain', amount: 2500 } },
  { text: '突然下超大午後雷陣雨，你被困在騎樓下。', effect: { type: 'move', amount: -2 } },
  { text: '颱風夜泡麵被你買光了。', effect: { type: 'pay', amount: 400 } },
  { text: '你的外送晚了一個小時，店家補償你。', effect: { type: 'gain', amount: 100 } },
  { text: '搶到演唱會門票！值得。', effect: { type: 'pay', amount: 1800 } },
  { text: '朋友揪你臨時說走就走去環島。', effect: { type: 'move', amount: 5 } },
  { text: '捷運坐過站，你又搭回頭車。', effect: { type: 'move', amount: -3 } },
  { text: '你在路上找到一張還有錢的悠遊卡。', effect: { type: 'gain', amount: 300 } },
  { text: '刮刮樂中獎！', effect: { type: 'randomGain', min: 200, max: 2000 } },
  { text: '過年長輩發紅包！', effect: { type: 'gain', amount: 1500 } },
  { text: '你包出去的紅包比收到的多更多。', effect: { type: 'pay', amount: 2000 } },
  { text: '手機螢幕突然摔裂，得送修。', effect: { type: 'pay', amount: 900 } },
  { text: '銀行帳戶多了一筆忘記的利息。', effect: { type: 'gain', amount: 150 } },
  { text: '你參加抽獎活動，抽中家電折價券。', effect: { type: 'gain', amount: 500 } },
  { text: '停車繳費機故障，你被多扣了一筆錢。', effect: { type: 'pay', amount: 250 } },
  { text: '朋友還你欠很久的錢，意外驚喜！', effect: { type: 'gain', amount: 600 } },
  { text: '網購包裹遺失，客服補償你運費。', effect: { type: 'gain', amount: 80 } },
  { text: '信用卡帳單比想像中高，你嚇了一跳。', effect: { type: 'pay', amount: 700 } },
  { text: '朋友的生日趴，你負責訂蛋糕。', effect: { type: 'pay', amount: 350 } },
  { text: '你在路邊撿到一枚硬幣，開心一整天。', effect: { type: 'gain', amount: 10 } },
];

function drawCard(deck) {
  const idx = Math.floor(Math.random() * deck.length);
  return deck[idx];
}

// src/room.js
// 房間 / 玩家生命週期管理：建立房間、加入、準備、斷線保留、房主轉移。

const CHARACTERS = [
  { id: 'boba', emoji: '🧋', name: '珍奶杯' },
  { id: 'scooter', emoji: '🛵', name: '小機車' },
  { id: 'hsr', emoji: '🚄', name: '高鐵' },
  { id: 'pineapple', emoji: '🍍', name: '鳳梨' },
  { id: 'xiaolongbao', emoji: '🥟', name: '小籠包' },
  { id: 'bear', emoji: '🐻', name: '台灣黑熊' },
  { id: 'lantern', emoji: '🏮', name: '紅燈籠' },
  { id: 'suitcase', emoji: '🧳', name: '旅行箱' },
];

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD166', '#6A4C93', '#1B998B', '#F26522'];

const DISCONNECT_GRACE_MS = 60 * 1000;
const STARTING_MONEY = 15000;

class Room {
  constructor(code, hostSocketId) {
    this.code = code;
    this.hostId = hostSocketId;
    this.players = new Map(); // socketId -> player
    this.turnOrder = [];
    this.currentTurnIndex = 0;
    this.started = false;
    this.boardState = createBoardState();
    this.weather = { type: 'sunny', label: '☀️ 大晴天' };
    this.turnCounter = 0;
    this.pendingDisconnects = new Map(); // socketId -> timeout
    this.gameLog = [];
    this.createdAt = Date.now();
  }

  addPlayer(socketId, name) {
    const usedColors = new Set([...this.players.values()].map(p => p.color));
    const color = COLORS.find(c => !usedColors.has(c)) || COLORS[this.players.size % COLORS.length];
    const player = {
      id: socketId,
      name: name || `旅人${this.players.size + 1}`,
      character: null,
      color,
      money: STARTING_MONEY,
      position: 0,
      properties: [],
      titles: [],
      isReady: false,
      isBankrupt: false,
      isConnected: true,
      skipNextTurn: false,
      diceBonus: 0,
      statistics: {
        feesCollected: 0,
        feesPaid: 0,
        loops: 0,
        cardsDrawn: 0,
        luckiestEvent: null,
        unluckiestEvent: null,
      },
    };
    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    this.turnOrder = this.turnOrder.filter(id => id !== socketId);
    if (this.hostId === socketId) {
      const next = [...this.players.keys()][0];
      this.hostId = next || null;
    }
  }

  getPlayer(socketId) {
    return this.players.get(socketId);
  }

  get playerList() {
    return [...this.players.values()];
  }

  availableCharacters() {
    const taken = new Set(this.playerList.map(p => p.character).filter(Boolean));
    return CHARACTERS.filter(c => !taken.has(c.id));
  }

  canStart() {
    const list = this.playerList;
    return list.length >= 2 && list.every(p => p.isReady && p.character) && list.length <= 6;
  }

  currentPlayerId() {
    return this.turnOrder[this.currentTurnIndex];
  }

  nextTurn() {
    if (this.turnOrder.length === 0) return null;
    let attempts = 0;
    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
      attempts++;
      const p = this.players.get(this.turnOrder[this.currentTurnIndex]);
      if (p && !p.isBankrupt && p.isConnected !== false) break;
    } while (attempts <= this.turnOrder.length);
    this.turnCounter++;
    return this.currentPlayerId();
  }

  activePlayers() {
    return this.playerList.filter(p => !p.isBankrupt);
  }

  addLog(message) {
    const entry = { message, time: Date.now() };
    this.gameLog.push(entry);
    if (this.gameLog.length > 200) this.gameLog.shift();
    return entry;
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  generateCode() {
    let code;
    do {
      code = 'TW' + Math.floor(1000 + Math.random() * 9000);
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostSocketId) {
    const code = this.generateCode();
    const room = new Room(code, hostSocketId);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code);
  }

  deleteRoom(code) {
    this.rooms.delete(code);
  }

  findRoomBySocket(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.has(socketId)) return room;
    }
    return null;
  }
}

// src/game.js
// 遊戲核心邏輯。函式盡量保持單純：接收 room/player，回傳描述結果的物件，
// 由 server.js 負責把結果透過 Socket.IO 廣播出去。


const PASS_START_BONUS = 2000;
const WEATHER_TYPES = [
  { type: 'sunny', label: '☀️ 大晴天', desc: '陽光普照，海邊景點旅遊費 +20%' },
  { type: 'rain', label: '🌧️ 下雨', desc: '雨天生意冷清，夜市景點旅遊費 -20%' },
  { type: 'spring', label: '🌸 春天', desc: '氣候宜人，所有景點恢復正常費率' },
  { type: 'cold', label: '🥶 寒流', desc: '天氣濕冷，溫泉相關景點吸引力大增' },
];

function rollTwoDice() {
  return [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
}

function rollDice(room, player) {
  const [d1, d2] = rollTwoDice();
  let steps = d1 + d2 + (player.diceBonus || 0);
  player.diceBonus = 0;
  const fromPos = player.position;
  let toPos = (fromPos + steps) % BOARD_SIZE;
  const passedStart = fromPos + steps >= BOARD_SIZE;
  player.position = toPos;

  let bonus = 0;
  if (passedStart) {
    bonus = PASS_START_BONUS;
    player.money += bonus;
    player.statistics.loops += 1;
  }

  return { dice: [d1, d2], steps, fromPos, toPos, passedStart, bonus };
}

function regionBonusMultiplier(room, ownerId, region) {
  const regionTiles = getRegionProperties(room.boardState, region);
  const ownedCount = regionTiles.filter(t => t.owner === ownerId).length;
  if (ownedCount === regionTiles.length && regionTiles.length > 0) return { mult: 1.2, full: true };
  if (ownedCount >= 3) return { mult: 1.1, full: false };
  return { mult: 1, full: false };
}

function weatherMultiplier(room, tile) {
  const w = room.weather.type;
  if (w === 'sunny' && ['屏東', '花蓮', '台東', '宜蘭'].includes(tile.city)) return 1.2;
  if (w === 'rain' && tile.isNightMarket) return 0.8;
  if (w === 'cold' && tile.special === 'hotspring') return 2;
  return 1;
}

function calcRent(room, tile) {
  const level = tile.level || 1;
  const base = tile.baseFee * LEVEL_MULTIPLIER[level - 1];
  const { mult } = regionBonusMultiplier(room, tile.owner, tile.region);
  const wMult = weatherMultiplier(room, tile);
  return Math.round(base * mult * wMult);
}

function buyProperty(room, player, tile) {
  if (tile.owner || player.money < tile.price) return { ok: false };
  tile.owner = player.id;
  tile.level = 1;
  player.money -= tile.price;
  player.properties.push(tile.id);
  return { ok: true };
}

function upgradeProperty(room, player, tile) {
  if (tile.owner !== player.id) return { ok: false, reason: 'not-owner' };
  if (tile.level >= LEVEL_MULTIPLIER.length) return { ok: false, reason: 'max-level' };
  const cost = Math.round(tile.price * UPGRADE_COST_RATIO);
  if (player.money < cost) return { ok: false, reason: 'no-money' };
  player.money -= cost;
  tile.level += 1;
  return { ok: true, cost, newLevel: tile.level };
}

function payRent(room, payer, owner, amount) {
  amount = Math.min(amount, Math.max(0, payer.money + 999999)); // 允許扣到負值以觸發破產判斷
  payer.money -= amount;
  payer.statistics.feesPaid += amount;
  if (owner) {
    owner.money += amount;
    owner.statistics.feesCollected += amount;
  }
  return amount;
}

function applyCardEffect(room, player, card) {
  player.statistics.cardsDrawn += 1;
  const effect = card.effect;
  const result = { text: card.text, effect };
  switch (effect.type) {
    case 'pay':
      player.money -= effect.amount;
      trackLuck(player, -effect.amount, card.text);
      break;
    case 'gain':
      player.money += effect.amount;
      trackLuck(player, effect.amount, card.text);
      break;
    case 'randomGain': {
      const amt = Math.round(effect.min + Math.random() * (effect.max - effect.min));
      player.money += amt;
      result.amount = amt;
      trackLuck(player, amt, card.text);
      break;
    }
    case 'move': {
      let delta = effect.amount;
      if (typeof delta === 'string' && delta.startsWith('random')) {
        const [, min, max] = delta.split('-').map(Number);
        const mag = min + Math.floor(Math.random() * (max - min + 1));
        delta = Math.random() < 0.5 ? mag : -mag;
      }
      player.position = ((player.position + delta) % BOARD_SIZE + BOARD_SIZE) % BOARD_SIZE;
      result.delta = delta;
      break;
    }
    case 'skipTurn':
      player.skipNextTurn = true;
      break;
    case 'diceBonus':
      player.diceBonus = (player.diceBonus || 0) + effect.amount;
      break;
    default:
      break;
  }
  return result;
}

function trackLuck(player, amount, text) {
  if (amount >= 500) {
    if (!player.statistics.luckiestEvent || amount > player.statistics.luckiestEvent.amount) {
      player.statistics.luckiestEvent = { text, amount };
    }
  }
  if (amount <= -500) {
    if (!player.statistics.unluckiestEvent || amount < player.statistics.unluckiestEvent.amount) {
      player.statistics.unluckiestEvent = { text, amount };
    }
  }
}

function drawNightMarketCard() {
  return drawCard(NIGHT_MARKET_CARDS);
}

function drawDailyCard() {
  return drawCard(DAILY_LIFE_CARDS);
}

function checkBankrupt(room, player) {
  if (player.money < 0 && !player.isBankrupt) {
    player.isBankrupt = true;
    room.boardState.forEach(tile => {
      if (tile.owner === player.id) {
        tile.owner = null;
        tile.level = 1;
      }
    });
    player.properties = [];
    return true;
  }
  return false;
}

function checkWinner(room) {
  const active = room.activePlayers();
  if (active.length === 1 && room.playerList.length > 1) return active[0];
  return null;
}

const TITLE_DEFS = [
  { id: 'newbie', label: '🏠 地產新手', check: p => p.properties.length >= 1 },
  { id: 'investor', label: '💼 投資高手', check: p => p.properties.length >= 5 },
  { id: 'tycoon', label: '👑 地產王', check: p => p.properties.length >= 10 },
  { id: 'poor', label: '🍜 只能吃泡麵了', check: p => p.money < 1000 && p.money >= 0 },
  { id: 'lucky', label: '🤑 今天財運有點猛', check: p => p.statistics.luckiestEvent && p.statistics.luckiestEvent.amount >= 2000 },
];

function checkNewTitles(player) {
  const newlyUnlocked = [];
  TITLE_DEFS.forEach(def => {
    if (def.check(player) && !player.titles.includes(def.id)) {
      player.titles.push(def.id);
      newlyUnlocked.push(def.label);
    }
  });
  return newlyUnlocked;
}

function rotateWeather(room) {
  const next = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
  room.weather = next;
  return next;
}

function buildStatsSummary(player) {
  return {
    money: player.money,
    properties: player.properties.length,
    feesCollected: player.statistics.feesCollected,
    feesPaid: player.statistics.feesPaid,
    loops: player.statistics.loops,
    cardsDrawn: player.statistics.cardsDrawn,
    luckiestEvent: player.statistics.luckiestEvent,
    unluckiestEvent: player.statistics.unluckiestEvent,
  };
}

const game = {
  rollDice,
  calcRent,
  buyProperty,
  upgradeProperty,
  payRent,
  applyCardEffect,
  drawNightMarketCard,
  drawDailyCard,
  checkBankrupt,
  checkWinner,
  checkNewTitles,
  rotateWeather,
  regionBonusMultiplier,
  buildStatsSummary,
  WEATHER_TYPES,
  PASS_START_BONUS,
};

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const roomManager = new RoomManager();

function newToken() {
  return crypto.randomBytes(8).toString('hex');
}

function serializeRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    started: room.started,
    weather: room.weather,
    currentTurnId: room.currentPlayerId(),
    turnOrder: room.turnOrder,
    boardState: room.boardState.map(t => ({
      id: t.id,
      type: t.type,
      name: t.name,
      emoji: t.emoji,
      city: t.city,
      region: t.region,
      price: t.price,
      baseFee: t.baseFee,
      isNightMarket: t.isNightMarket || false,
      owner: t.owner,
      level: t.level,
    })),
    players: room.playerList.map(p => ({
      id: p.id,
      name: p.name,
      character: p.character,
      color: p.color,
      money: p.money,
      position: p.position,
      properties: p.properties,
      titles: p.titles,
      isReady: p.isReady,
      isBankrupt: p.isBankrupt,
      isConnected: p.isConnected !== false,
    })),
    log: room.gameLog.slice(-30),
    availableCharacters: room.availableCharacters(),
  };
}

function broadcast(room) {
  io.to(room.code).emit('state', serializeRoom(room));
}

function findPlayerBySocket(room, socketId) {
  return room.playerList.find(p => p.socketId === socketId);
}

function getTile(room, id) {
  return room.boardState[id];
}

function endGameIfWinner(room) {
  const winner = game.checkWinner(room);
  if (winner) {
    room.started = false;
    const stats = {};
    room.playerList.forEach(p => {
      stats[p.id] = game.buildStatsSummary(p);
    });
    io.to(room.code).emit('gameOver', { winnerId: winner.id, stats });
    return true;
  }
  return false;
}

function resolveLanding(room, player, socket) {
  const tile = getTile(room, player.position);
  let canEndTurn = true;

  if (tile.type === 'property') {
    if (!tile.owner) {
      if (player.money >= tile.price) {
        io.to(player.socketId).emit('promptPurchase', { tile });
        canEndTurn = false;
      } else {
        room.addLog(`🚶 ${player.name} 資金不足，只能路過「${tile.name}」。`);
      }
    } else if (tile.owner !== player.id) {
      const owner = room.getPlayer(tile.owner);
      const rent = game.calcRent(room, tile);
      game.payRent(room, player, owner, rent);
      room.addLog(`💸 ${player.name} 來到 ${owner ? owner.name : '無人'} 的「${tile.name}」，支付旅遊費 NT$${rent}。`);
      io.to(room.code).emit('rentPaid', { payerId: player.id, ownerId: tile.owner, amount: rent, tileId: tile.id });
      const bankrupted = game.checkBankrupt(room, player);
      if (bankrupted) {
        room.addLog(`💸 ${player.name} 的環島夢暫時結束了。`);
        io.to(room.code).emit('playerBankrupt', { playerId: player.id });
      }
    }
  } else if (tile.type === 'card_night' || tile.type === 'card_daily') {
    const card = tile.type === 'card_night' ? game.drawNightMarketCard() : game.drawDailyCard();
    const result = game.applyCardEffect(room, player, card);
    room.addLog(`${tile.emoji} ${player.name} 抽到事件卡：「${card.text}」`);
    io.to(room.code).emit('cardDrawn', { playerId: player.id, deckType: tile.type, card: result, newPosition: player.position });
    game.checkBankrupt(room, player);
  } else if (tile.type === 'hsr') {
    const destinations = HSR_STATIONS.filter(id => id !== tile.id);
    io.to(player.socketId).emit('promptHSR', { fromTileId: tile.id, destinations, cost: 500 });
    canEndTurn = false;
  } else if (tile.type === 'typhoon') {
    player.money += 300;
    player.skipNextTurn = true;
    room.addLog(`🌪️ 颱風假！${player.name} 宣布放假在家叫外送，獲得 NT$300，下回合停權一次。`);
  } else if (tile.type === 'traffic_jam') {
    player.skipNextTurn = true;
    room.addLog(`🚗 ${player.name} 遇到國道塞車，開始懷疑人生。下回合無法行動。`);
  } else if (tile.type === 'parking') {
    player.money -= 500;
    room.addLog(`🅿️ ${player.name} 終於找到停車位，支付停車費 NT$500。`);
    game.checkBankrupt(room, player);
  } else if (tile.type === 'hotspring') {
    room.addLog(`♨️ ${player.name} 今天不拚輸贏，先泡個溫泉放鬆一下。`);
  } else if (tile.type === 'start') {
    room.addLog(`🚩 ${player.name} 回到台北車站整裝待發！`);
  }

  const newTitles = game.checkNewTitles(player);
  if (newTitles.length) {
    io.to(room.code).emit('titleUnlocked', { playerId: player.id, titles: newTitles });
  }

  return canEndTurn;
}

io.on('connection', socket => {
  socket.on('createRoom', ({ name }) => {
    const token = newToken();
    const room = roomManager.createRoom(token);
    const player = room.addPlayer(token, name);
    player.socketId = socket.id;
    socket.join(room.code);
    socket.data.token = token;
    socket.data.roomCode = room.code;
    socket.emit('joined', { token, roomCode: room.code, characters: CHARACTERS });
    broadcast(room);
  });

  socket.on('joinRoom', ({ code, name }) => {
    const room = roomManager.getRoom(code);
    if (!room) return socket.emit('errorMsg', '找不到這個房間代碼。');
    if (room.started) return socket.emit('errorMsg', '這場遊戲已經開始了。');
    if (room.players.size >= 6) return socket.emit('errorMsg', '房間已滿（最多 6 人）。');
    const token = newToken();
    const player = room.addPlayer(token, name);
    player.socketId = socket.id;
    socket.join(room.code);
    socket.data.token = token;
    socket.data.roomCode = room.code;
    socket.emit('joined', { token, roomCode: room.code, characters: CHARACTERS });
    room.addLog(`👋 ${player.name} 加入了房間。`);
    broadcast(room);
  });

  socket.on('rejoin', ({ code, token }) => {
    const room = roomManager.getRoom(code);
    if (!room) return socket.emit('errorMsg', '房間已不存在，請重新建立或加入。');
    const player = room.getPlayer(token);
    if (!player) return socket.emit('errorMsg', '找不到你的玩家資料，請重新加入。');
    player.socketId = socket.id;
    player.isConnected = true;
    const pending = room.pendingDisconnects.get(token);
    if (pending) {
      clearTimeout(pending);
      room.pendingDisconnects.delete(token);
    }
    socket.join(room.code);
    socket.data.token = token;
    socket.data.roomCode = room.code;
    socket.emit('joined', { token, roomCode: room.code, characters: CHARACTERS, resumed: true });
    room.addLog(`🔌 ${player.name} 重新連線。`);
    broadcast(room);
  });

  function withRoom(handler) {
    return payload => {
      const room = roomManager.getRoom(socket.data.roomCode);
      if (!room) return;
      const player = room.getPlayer(socket.data.token);
      if (!player) return;
      handler(room, player, payload || {});
    };
  }

  socket.on('selectCharacter', withRoom((room, player, { characterId }) => {
    if (room.started) return;
    const taken = room.playerList.some(p => p.character === characterId && p.id !== player.id);
    if (taken) return socket.emit('errorMsg', '這個角色已經被選走了。');
    player.character = characterId;
    broadcast(room);
  }));

  socket.on('toggleReady', withRoom((room, player) => {
    if (room.started) return;
    player.isReady = !player.isReady;
    broadcast(room);
  }));

  socket.on('startGame', withRoom((room, player) => {
    if (player.id !== room.hostId) return socket.emit('errorMsg', '只有房主可以開始遊戲。');
    if (!room.canStart()) return socket.emit('errorMsg', '至少需要 2 位玩家都選好角色並準備完成。');
    room.started = true;
    room.turnOrder = room.playerList.map(p => p.id);
    room.currentTurnIndex = 0;
    room.addLog('🎉 遊戲開始！祝大家環島順利！');
    io.to(room.code).emit('gameStarted');
    broadcast(room);
  }));

  socket.on('rollDice', withRoom((room, player) => {
    if (!room.started) return;
    if (room.currentPlayerId() !== player.id) return;
    if (player.skipNextTurn) {
      player.skipNextTurn = false;
      room.addLog(`⏭️ ${player.name} 本回合停權，直接跳過。`);
      room.nextTurn();
      broadcast(room);
      io.to(room.code).emit('turnSkipped', { playerId: player.id });
      return;
    }
    const rollResult = game.rollDice(room, player);
    if (rollResult.passedStart) {
      room.addLog(`🚩 ${player.name} 完成環島一圈！獲得 NT$${rollResult.bonus} 旅遊補助！`);
    }
    io.to(room.code).emit('diceRolled', { playerId: player.id, ...rollResult });
    const canEndTurn = resolveLanding(room, player, socket);
    if (endGameIfWinner(room)) return;
    broadcast(room);
    if (canEndTurn) {
      io.to(player.socketId).emit('canEndTurn');
    }
  }));

  socket.on('buyProperty', withRoom((room, player) => {
    if (room.currentPlayerId() !== player.id) return;
    const tile = getTile(room, player.position);
    const result = game.buyProperty(room, player, tile);
    if (result.ok) {
      room.addLog(`🏠 ${player.name} 投資了「${tile.name}」！`);
      io.to(room.code).emit('propertyBought', { playerId: player.id, tileId: tile.id });
    }
    broadcast(room);
    io.to(player.socketId).emit('canEndTurn');
  }));

  socket.on('skipPurchase', withRoom((room, player) => {
    if (room.currentPlayerId() !== player.id) return;
    const tile = getTile(room, player.position);
    room.addLog(`🚶 ${player.name} 這次選擇路過「${tile.name}」。`);
    broadcast(room);
    io.to(player.socketId).emit('canEndTurn');
  }));

  socket.on('takeHSR', withRoom((room, player, { destTileId, take }) => {
    if (room.currentPlayerId() !== player.id) return;
    if (take && player.money >= 500 && HSR_STATIONS.includes(destTileId)) {
      player.money -= 500;
      player.position = destTileId;
      const destTile = getTile(room, destTileId);
      room.addLog(`🚄💨 ${player.name} 搭乘高鐵前往「${destTile.name}」！`);
      io.to(room.code).emit('hsrTravel', { playerId: player.id, destTileId });
    } else {
      room.addLog(`🚄 ${player.name} 這次沒有搭高鐵。`);
    }
    broadcast(room);
    io.to(player.socketId).emit('canEndTurn');
  }));

  socket.on('upgradeProperty', withRoom((room, player, { tileId }) => {
    if (room.currentPlayerId() !== player.id) return;
    const tile = getTile(room, tileId);
    if (!tile) return;
    const result = game.upgradeProperty(room, player, tile);
    if (result.ok) {
      room.addLog(`⭐ ${player.name} 把「${tile.name}」升級到 ${result.newLevel} 星！`);
      io.to(room.code).emit('propertyUpgraded', { tileId: tile.id, newLevel: result.newLevel, playerId: player.id });
      broadcast(room);
    } else {
      socket.emit('errorMsg', '無法升級（資金不足或已達最高等級）。');
    }
  }));

  socket.on('endTurn', withRoom((room, player) => {
    if (room.currentPlayerId() !== player.id) return;
    if (endGameIfWinner(room)) return;
    room.nextTurn();
    if (room.turnCounter % 5 === 0) {
      const w = game.rotateWeather(room);
      room.addLog(`${w.label} ${w.desc}`);
      io.to(room.code).emit('weatherChanged', room.weather);
    }
    if (Math.random() < 0.08) {
      const bonus = 300;
      room.activePlayers().forEach(p => { p.money += bonus; });
      room.addLog(`🎉 突然的小確幸節慶！所有玩家獲得 NT$${bonus}！`);
      io.to(room.code).emit('festival', { amount: bonus });
    }
    broadcast(room);
    const next = room.getPlayer(room.currentPlayerId());
    if (next) io.to(room.code).emit('turnChanged', { playerId: next.id });
  }));

  socket.on('sendChat', withRoom((room, player, { message }) => {
    if (!message || !String(message).trim()) return;
    const clean = String(message).slice(0, 200);
    io.to(room.code).emit('chatMessage', { playerId: player.id, name: player.name, color: player.color, message: clean, time: Date.now() });
  }));

  socket.on('sendEmoji', withRoom((room, player, { emoji }) => {
    io.to(room.code).emit('emojiFloat', { playerId: player.id, emoji, time: Date.now() });
  }));

  socket.on('restartGame', withRoom((room, player) => {
    if (player.id !== room.hostId) return;
    room.boardState = createBoardState();
    room.started = false;
    room.turnCounter = 0;
    room.currentTurnIndex = 0;
    room.gameLog = [];
    room.playerList.forEach(p => {
      p.money = 15000;
      p.position = 0;
      p.properties = [];
      p.titles = [];
      p.isReady = false;
      p.isBankrupt = false;
      p.skipNextTurn = false;
      p.diceBonus = 0;
      p.statistics = { feesCollected: 0, feesPaid: 0, loops: 0, cardsDrawn: 0, luckiestEvent: null, unluckiestEvent: null };
    });
    room.addLog('🔄 房主開啟了新的一局！');
    io.to(room.code).emit('backToLobby');
    broadcast(room);
  }));

  socket.on('disconnect', () => {
    const room = roomManager.getRoom(socket.data.roomCode);
    if (!room) return;
    const player = room.getPlayer(socket.data.token);
    if (!player) return;
    player.isConnected = false;
    room.addLog(`📴 ${player.name} 暫時離線⋯`);
    broadcast(room);
    const timeout = setTimeout(() => {
      room.removePlayer(player.id);
      room.turnOrder = room.turnOrder.filter(id => id !== player.id);
      room.pendingDisconnects.delete(player.id);
      if (room.players.size === 0) {
        roomManager.deleteRoom(room.code);
        return;
      }
      room.addLog(`👋 ${player.name} 離開了房間。`);
      broadcast(room);
    }, DISCONNECT_GRACE_MS);
    room.pendingDisconnects.set(player.id, timeout);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🏝️  島遊大亨伺服器已啟動： http://localhost:${PORT}`);
});
