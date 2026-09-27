// client.js - 島遊大亨前端邏輯
(() => {
  const BOARD_SIZE = 40;
  const GRID_COLS = 13;
  const GRID_ROWS = 9;

  const socket = io();

  let myToken = localStorage.getItem('tw_token') || null;
  let myRoomCode = localStorage.getItem('tw_room') || null;
  let myName = localStorage.getItem('tw_name') || '';
  let characters = [];
  let lastState = null;
  let boardBuilt = false;
  const animatingPlayers = new Set();
  let hasRolledThisTurn = false;

  // ---------- 小工具 ----------
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function showScreen(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $('#' + id).classList.add('active');
  }

  function showError(msg) {
    const el = $('#global-error');
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3200);
  }

  function fmtMoney(n) {
    const sign = n < 0 ? '-' : '';
    return sign + 'NT$' + Math.abs(n).toLocaleString();
  }

  // ---------- 首頁 ----------
  $('#input-name').value = myName;
  $('#btn-create').addEventListener('click', () => {
    const name = $('#input-name').value.trim() || '旅人';
    myName = name;
    localStorage.setItem('tw_name', name);
    socket.emit('createRoom', { name });
  });
  $('#btn-join').addEventListener('click', () => {
    const name = $('#input-name').value.trim() || '旅人';
    const code = $('#input-code').value.trim().toUpperCase();
    if (!code) return showError('請輸入房間代碼');
    myName = name;
    localStorage.setItem('tw_name', name);
    socket.emit('joinRoom', { code, name });
  });

  // 嘗試自動重連
  if (myToken && myRoomCode) {
    socket.emit('rejoin', { code: myRoomCode, token: myToken });
  }

  // ---------- Socket 基本事件 ----------
  socket.on('joined', ({ token, roomCode, characters: chars, resumed }) => {
    myToken = token;
    myRoomCode = roomCode;
    localStorage.setItem('tw_token', token);
    localStorage.setItem('tw_room', roomCode);
    characters = chars;
    buildCharacterGrid();
    $('#lobby-code').textContent = roomCode;
  });

  socket.on('errorMsg', msg => showError(msg));

  socket.on('state', state => {
    lastState = state;
    render(state);
  });

  socket.on('gameStarted', () => {
    showScreen('screen-game');
    boardBuilt = false;
    hasRolledThisTurn = false;
  });

  socket.on('backToLobby', () => {
    showScreen('screen-lobby');
  });

  // ---------- 大廳 ----------
  function buildCharacterGrid() {
    const grid = $('#character-grid');
    grid.innerHTML = '';
    characters.forEach(c => {
      const div = document.createElement('div');
      div.className = 'char-item';
      div.dataset.id = c.id;
      div.innerHTML = `<div class="char-emoji">${c.emoji}</div><div class="char-name">${c.name}</div>`;
      div.addEventListener('click', () => {
        if (div.classList.contains('taken')) return;
        socket.emit('selectCharacter', { characterId: c.id });
      });
      grid.appendChild(div);
    });
  }

  $('#btn-ready').addEventListener('click', () => socket.emit('toggleReady'));
  $('#btn-start').addEventListener('click', () => socket.emit('startGame'));
  $('#btn-copy-code').addEventListener('click', () => {
    navigator.clipboard?.writeText(myRoomCode || '');
    showError('房間代碼已複製！');
  });

  function renderLobby(state) {
    showScreen('screen-lobby');
    $('#lobby-code').textContent = state.code;

    // 角色選取狀態
    const takenIds = new Set(state.players.map(p => p.character).filter(Boolean));
    const me = state.players.find(p => p.id === myToken);
    $$('.char-item').forEach(el => {
      const id = el.dataset.id;
      el.classList.toggle('selected', me && me.character === id);
      el.classList.toggle('taken', takenIds.has(id) && !(me && me.character === id));
    });

    // 玩家列表
    const ul = $('#lobby-players');
    ul.innerHTML = '';
    state.players.forEach(p => {
      const li = document.createElement('li');
      const charInfo = characters.find(c => c.id === p.character);
      li.innerHTML = `
        <span class="dot" style="background:${p.color}"></span>
        <span>${charInfo ? charInfo.emoji : '❓'}</span>
        <span class="name">${p.name}</span>
        ${p.id === state.hostId ? '<span class="badge-host">房主</span>' : ''}
        ${p.isReady ? '<span class="badge-ready">已準備</span>' : ''}
      `;
      ul.appendChild(li);
    });

    $('#btn-ready').textContent = me && me.isReady ? '❌ 取消準備' : '✅ 準備';
    $('#btn-start').style.display = (me && me.id === state.hostId) ? 'block' : 'none';
    $('#btn-start').disabled = !state.players.every(p => p.isReady && p.character) || state.players.length < 2;
  }

  // ---------- 遊戲畫面：棋盤建構 ----------
  function tilePosition(i) {
    if (i <= 12) return { col: i, row: 0 };
    if (i <= 20) return { col: 12, row: i - 12 };
    if (i <= 32) return { col: 12 - (i - 20), row: 8 };
    return { col: 0, row: 8 - (i - 32) };
  }

  function buildBoard(boardState) {
    const board = $('#board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${GRID_COLS}, minmax(0,1fr))`;
    board.style.gridTemplateRows = `repeat(${GRID_ROWS}, minmax(0,1fr))`;

    boardState.forEach(tile => {
      const pos = tilePosition(tile.id);
      const div = document.createElement('div');
      div.className = 'tile';
      div.id = 'tile-' + tile.id;
      div.style.gridColumn = pos.col + 1;
      div.style.gridRow = pos.row + 1;
      div.innerHTML = `
        <div class="t-emoji">${tile.emoji}</div>
        <div class="t-name">${tile.name}</div>
        <div class="t-stars"></div>
        <div class="t-owner"></div>
      `;
      div.addEventListener('click', () => showTileInfo(tile.id));
      board.appendChild(div);
    });

    const center = document.createElement('div');
    center.className = 'tile-center';
    center.style.gridColumn = `2 / ${GRID_COLS}`;
    center.style.gridRow = `2 / ${GRID_ROWS}`;
    center.innerHTML = `🏝️<div class="center-title">島遊大亨</div>`;
    board.appendChild(center);

    const tokenLayer = document.createElement('div');
    tokenLayer.className = 'token-layer';
    tokenLayer.id = 'token-layer';
    board.appendChild(tokenLayer);

    boardBuilt = true;
  }

  function showTileInfo(tileId) {
    if (!lastState) return;
    const tile = lastState.boardState.find(t => t.id === tileId);
    if (!tile || tile.type !== 'property') return;
    const owner = lastState.players.find(p => p.id === tile.owner);
    const msg = `${tile.name}｜${tile.city || ''}\n售價 NT$${tile.price}\n目前 ${tile.level}⭐\n${owner ? '擁有者：' + owner.name : '尚無人持有'}`;
    appendLog(msg.replace(/\n/g, '　'));
  }

  function updateTilesOwnership(boardState) {
    boardState.forEach(tile => {
      const el = document.getElementById('tile-' + tile.id);
      if (!el) return;
      const starsEl = el.querySelector('.t-stars');
      const ownerEl = el.querySelector('.t-owner');
      if (tile.type === 'property' && tile.owner) {
        const owner = lastState.players.find(p => p.id === tile.owner);
        starsEl.textContent = '⭐'.repeat(tile.level);
        ownerEl.textContent = '●';
        ownerEl.style.color = owner ? owner.color : '#999';
        el.classList.add('owned-strip');
        el.style.borderBottomColor = owner ? owner.color : '#999';
      } else {
        starsEl.textContent = '';
        ownerEl.textContent = '';
        el.classList.remove('owned-strip');
      }
    });
  }

  // ---------- Tokens ----------
  function tileCenter(tileId) {
    const el = document.getElementById('tile-' + tileId);
    const board = $('#board');
    if (!el || !board) return { x: 0, y: 0 };
    return {
      x: el.offsetLeft + el.offsetWidth / 2 - 11,
      y: el.offsetTop + el.offsetHeight / 2 - 11,
    };
  }

  function ensureTokenEl(player) {
    const layer = $('#token-layer');
    let el = document.getElementById('token-' + player.id);
    if (!el) {
      el = document.createElement('div');
      el.id = 'token-' + player.id;
      el.className = 'token';
      el.style.background = player.color;
      const charInfo = characters.find(c => c.id === player.character);
      el.textContent = charInfo ? charInfo.emoji : '❓';
      layer.appendChild(el);
    }
    return el;
  }

  function setTokenAt(playerId, tileId) {
    const player = lastState.players.find(p => p.id === playerId);
    if (!player) return;
    const el = ensureTokenEl(player);
    const sameTilePlayers = lastState.players.filter(p => p.position === tileId && !p.isBankrupt);
    const idx = sameTilePlayers.findIndex(p => p.id === playerId);
    const offset = [[0, 0], [10, 0], [0, 10], [10, 10], [5, -8], [-8, 5]][idx % 6] || [0, 0];
    const c = tileCenter(tileId);
    el.style.left = (c.x + offset[0]) + 'px';
    el.style.top = (c.y + offset[1]) + 'px';
  }

  function renderTokens(state) {
    if (!boardBuilt) return;
    state.players.forEach(p => {
      if (p.isBankrupt) {
        const el = document.getElementById('token-' + p.id);
        if (el) el.remove();
        return;
      }
      if (animatingPlayers.has(p.id)) return;
      setTokenAt(p.id, p.position);
    });
  }

  function animateTokenSteps(playerId, fromPos, steps, toPos) {
    if (!boardBuilt) return;
    animatingPlayers.add(playerId);
    let pos = fromPos;
    let i = 0;
    const timer = setInterval(() => {
      pos = (pos + 1) % BOARD_SIZE;
      i++;
      setTokenAt(playerId, pos);
      if (i >= steps) {
        clearInterval(timer);
        animatingPlayers.delete(playerId);
        setTokenAt(playerId, toPos);
        if (lastState) renderTokens(lastState);
      }
    }, 200);
  }

  // ---------- 骰子動畫 ----------
  function animateDice(dice) {
    const d1 = $('#dice1'), d2 = $('#dice2');
    d1.classList.add('rolling');
    d2.classList.add('rolling');
    setTimeout(() => {
      d1.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][dice[0] - 1];
      d2.textContent = ['⚀','⚁','⚂','⚃','⚄','⚅'][dice[1] - 1];
      d1.classList.remove('rolling');
      d2.classList.remove('rolling');
    }, 550);
  }

  // ---------- 主要渲染 ----------
  function render(state) {
    if (!state.started) {
      renderLobby(state);
      return;
    }
    showScreen('screen-game');
    if (!boardBuilt) buildBoard(state.boardState);
    updateTilesOwnership(state.boardState);
    renderTokens(state);
    renderLeaderboard(state);
    renderMyInfo(state);
    renderMineList(state);
    renderLog(state);
    renderTurnBanner(state);
    $('#weather-box').textContent = state.weather.label + ' ' + (state.weather.desc || '');
  }

  function renderLeaderboard(state) {
    const list = [...state.players].sort((a, b) => b.money - a.money);
    const ol = $('#leaderboard-list');
    ol.innerHTML = '';
    list.forEach((p, idx) => {
      const charInfo = characters.find(c => c.id === p.character);
      const li = document.createElement('li');
      if (p.isBankrupt) li.classList.add('bankrupt');
      li.innerHTML = `
        <span class="rank">${idx + 1}</span>
        <span class="emoji">${charInfo ? charInfo.emoji : '❓'}</span>
        <span class="info">
          <div class="lname">${p.name}${!p.isConnected ? ' 📴' : ''}</div>
          <div class="lmoney">${fmtMoney(p.money)}・🏠${p.properties.length}</div>
        </span>
      `;
      ol.appendChild(li);
    });
  }

  function renderMyInfo(state) {
    const me = state.players.find(p => p.id === myToken);
    if (!me) return;
    const el = $('#my-info');
    el.innerHTML = `
      <div class="mi-row"><span>💰 現金</span><strong>${fmtMoney(me.money)}</strong></div>
      <div class="mi-row"><span>🏠 景點數</span><strong>${me.properties.length}</strong></div>
      <div class="my-titles">${me.titles.map(t => `<span>${titleLabel(t)}</span>`).join('')}</div>
    `;
  }

  function titleLabel(id) {
    const map = {
      newbie: '🏠 地產新手', investor: '💼 投資高手', tycoon: '👑 地產王',
      poor: '🍜 只能吃泡麵了', lucky: '🤑 財運有點猛',
    };
    return map[id] || id;
  }

  function renderMineList(state) {
    const me = state.players.find(p => p.id === myToken);
    const ul = $('#mine-list');
    ul.innerHTML = '';
    if (!me) return;
    me.properties.forEach(tid => {
      const tile = state.boardState.find(t => t.id === tid);
      if (!tile) return;
      const li = document.createElement('li');
      const cost = Math.round(tile.price * 0.6);
      li.innerHTML = `<span>${tile.emoji} ${tile.name} ${'⭐'.repeat(tile.level)}</span>`;
      const btn = document.createElement('button');
      const isMyTurn = state.currentTurnId === myToken;
      btn.textContent = tile.level >= 5 ? '已滿星' : `升級 NT$${cost}`;
      btn.disabled = tile.level >= 5 || !isMyTurn;
      btn.addEventListener('click', () => socket.emit('upgradeProperty', { tileId: tid }));
      li.appendChild(btn);
      ul.appendChild(li);
    });
    if (me.properties.length === 0) {
      ul.innerHTML = '<li style="justify-content:center;color:#aaa">還沒有任何景點</li>';
    }
  }

  let lastLogCount = 0;
  function renderLog(state) {
    const ul = $('#log-list');
    ul.innerHTML = '';
    state.log.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = entry.message;
      ul.appendChild(li);
    });
    ul.scrollTop = ul.scrollHeight;
  }
  function appendLog(text) {
    const ul = $('#log-list');
    const li = document.createElement('li');
    li.textContent = text;
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
  }

  function renderTurnBanner(state) {
    const cur = state.players.find(p => p.id === state.currentTurnId);
    const banner = $('#turn-banner');
    if (!cur) { banner.textContent = '等待遊戲開始⋯'; return; }
    if (cur.id === myToken) {
      banner.textContent = '🎲 輪到你環島了！';
      $('#btn-roll').disabled = hasRolledThisTurn;
    } else {
      banner.textContent = `等待 ${cur.name} 的旅程⋯`;
      $('#btn-roll').disabled = true;
    }
  }

  // ---------- 骰子 / 回合操作 ----------
  $('#btn-roll').addEventListener('click', () => {
    hasRolledThisTurn = true;
    $('#btn-roll').disabled = true;
    socket.emit('rollDice');
  });
  $('#btn-end-turn').addEventListener('click', () => {
    $('#btn-end-turn').disabled = true;
    socket.emit('endTurn');
  });

  socket.on('diceRolled', data => {
    animateDice(data.dice);
    animateTokenSteps(data.playerId, data.fromPos, data.steps, data.toPos);
  });

  socket.on('turnChanged', () => {
    hasRolledThisTurn = false;
    $('#btn-end-turn').disabled = true;
  });

  socket.on('turnSkipped', ({ playerId }) => {
    if (lastState) {
      const p = lastState.players.find(pl => pl.id === playerId);
      if (p) appendLog(`⏭️ ${p.name} 本回合被跳過。`);
    }
  });

  socket.on('canEndTurn', () => {
    $('#btn-end-turn').disabled = false;
  });

  // ---------- 購買 Modal ----------
  const purchaseModal = $('#modal-purchase');
  socket.on('promptPurchase', ({ tile }) => {
    $('#purchase-emoji').textContent = tile.emoji;
    $('#purchase-name').textContent = tile.name;
    $('#purchase-city').textContent = tile.city || '';
    $('#purchase-price').textContent = fmtMoney(tile.price);
    $('#purchase-fee').textContent = fmtMoney(tile.baseFee);
    purchaseModal.classList.remove('hidden');
  });
  $('#btn-buy').addEventListener('click', () => {
    socket.emit('buyProperty');
    purchaseModal.classList.add('hidden');
  });
  $('#btn-skip').addEventListener('click', () => {
    socket.emit('skipPurchase');
    purchaseModal.classList.add('hidden');
  });

  socket.on('propertyBought', ({ tileId }) => {
    flashTile(tileId, '🏠');
  });
  socket.on('propertyUpgraded', ({ tileId }) => {
    flashTile(tileId, '⭐');
  });

  function flashTile(tileId, emoji) {
    const el = document.getElementById('tile-' + tileId);
    if (!el) return;
    const pop = document.createElement('div');
    pop.className = 'money-pop gain';
    pop.textContent = emoji;
    pop.style.left = '50%';
    pop.style.top = '0';
    el.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
  }

  socket.on('rentPaid', ({ payerId, ownerId, amount, tileId }) => {
    const el = document.getElementById('tile-' + tileId);
    if (el) {
      const pop = document.createElement('div');
      pop.className = 'money-pop loss';
      pop.textContent = '-' + amount;
      pop.style.left = '50%';
      pop.style.top = '0';
      el.appendChild(pop);
      setTimeout(() => pop.remove(), 1000);
    }
  });

  // ---------- 高鐵 Modal ----------
  const hsrModal = $('#modal-hsr');
  socket.on('promptHSR', ({ destinations }) => {
    const box = $('#hsr-options');
    box.innerHTML = '';
    destinations.forEach(destId => {
      const tile = lastState.boardState.find(t => t.id === destId);
      const btn = document.createElement('button');
      btn.textContent = `🚄 ${tile ? tile.name : destId}`;
      btn.addEventListener('click', () => {
        socket.emit('takeHSR', { destTileId: destId, take: true });
        hsrModal.classList.add('hidden');
      });
      box.appendChild(btn);
    });
    hsrModal.classList.remove('hidden');
  });
  $('#btn-hsr-skip').addEventListener('click', () => {
    socket.emit('takeHSR', { take: false });
    hsrModal.classList.add('hidden');
  });
  socket.on('hsrTravel', ({ playerId, destTileId }) => {
    if (!animatingPlayers.has(playerId)) setTokenAt(playerId, destTileId);
  });

  // ---------- 事件卡 Modal ----------
  const cardModal = $('#modal-card');
  socket.on('cardDrawn', ({ deckType, card }) => {
    $('#card-emoji').textContent = deckType === 'card_night' ? '🌙' : '🎴';
    $('#card-deck-name').textContent = deckType === 'card_night' ? '夜市事件卡' : '台灣日常卡';
    $('#card-text').textContent = card.text;
    const amountEl = $('#card-amount');
    amountEl.className = 'card-amount';
    if (card.effect.type === 'pay') {
      amountEl.textContent = '-' + fmtMoney(card.effect.amount).replace('NT$', 'NT$');
      amountEl.classList.add('negative');
    } else if (card.effect.type === 'gain') {
      amountEl.textContent = '+' + fmtMoney(card.effect.amount);
      amountEl.classList.add('positive');
    } else if (card.effect.type === 'randomGain') {
      amountEl.textContent = '+' + fmtMoney(card.amount || 0);
      amountEl.classList.add('positive');
    } else {
      amountEl.textContent = '';
    }
    cardModal.classList.remove('hidden');
  });
  $('#btn-card-close').addEventListener('click', () => cardModal.classList.add('hidden'));

  // ---------- 稱號 Toast ----------
  socket.on('titleUnlocked', ({ playerId, titles }) => {
    const p = lastState?.players.find(pl => pl.id === playerId);
    const toast = $('#toast-title');
    $('#toast-title-text').textContent = `🏆 ${p ? p.name : ''} 解鎖「${titles.join('、')}」`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2600);
  });

  socket.on('weatherChanged', w => {
    $('#weather-box').textContent = w.label + ' ' + (w.desc || '');
  });

  socket.on('festival', ({ amount }) => {
    appendLog(`🎉 節慶小確幸！所有玩家獲得 NT$${amount}`);
  });

  socket.on('playerBankrupt', ({ playerId }) => {
    const p = lastState?.players.find(pl => pl.id === playerId);
    appendLog(`💸 ${p ? p.name : ''} 的環島夢暫時結束了。`);
  });

  // ---------- 遊戲結束 ----------
  socket.on('gameOver', ({ winnerId, stats }) => {
    const winner = lastState?.players.find(p => p.id === winnerId);
    const charInfo = winner ? characters.find(c => c.id === winner.character) : null;
    $('#gameover-winner').textContent = `${charInfo ? charInfo.emoji : ''} ${winner ? winner.name : ''} 成為全台最強旅遊大亨！`;
    const s = stats[winnerId] || {};
    const box = $('#gameover-stats');
    box.innerHTML = `
      <div><span>總資產</span><strong>${fmtMoney(s.money || 0)}</strong></div>
      <div><span>擁有景點</span><strong>${s.properties || 0}</strong></div>
      <div><span>總共收過旅遊費</span><strong>${fmtMoney(s.feesCollected || 0)}</strong></div>
      <div><span>總共付過旅遊費</span><strong>${fmtMoney(s.feesPaid || 0)}</strong></div>
      <div><span>環島次數</span><strong>${s.loops || 0}</strong></div>
      <div><span>抽過事件卡</span><strong>${s.cardsDrawn || 0}</strong></div>
    `;
    $('#modal-gameover').classList.remove('hidden');
  });
  $('#btn-restart').addEventListener('click', () => {
    socket.emit('restartGame');
    $('#modal-gameover').classList.add('hidden');
  });
  $('#btn-back-lobby').addEventListener('click', () => {
    $('#modal-gameover').classList.add('hidden');
    showScreen('screen-lobby');
  });

  // ---------- 聊天 / Emoji ----------
  $('#btn-chat-send').addEventListener('click', sendChat);
  $('#chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
  function sendChat() {
    const input = $('#chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    socket.emit('sendChat', { message: msg });
    input.value = '';
  }
  socket.on('chatMessage', ({ name, color, message }) => {
    const ul = $('#chat-list');
    const li = document.createElement('li');
    li.innerHTML = `<span class="chat-name" style="color:${color}">${name}</span>${message}`;
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
  });

  $$('#emoji-bar button').forEach(btn => {
    btn.addEventListener('click', () => socket.emit('sendEmoji', { emoji: btn.dataset.emoji }));
  });
  socket.on('emojiFloat', ({ emoji }) => {
    const el = document.createElement('div');
    el.className = 'float-emoji';
    el.textContent = emoji;
    el.style.left = (30 + Math.random() * 60) + 'vw';
    el.style.top = (40 + Math.random() * 20) + 'vh';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  });

  // ---------- 分頁切換（右側面板 & 手機版）----------
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $('#tab-' + btn.dataset.tab).classList.add('active');
    });
  });
  $$('.mbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.open;
      if (target === 'leaderboard') {
        $('#panel-leaderboard').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      $('#panel-right').scrollIntoView({ behavior: 'smooth' });
      $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === target));
      $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + target));
    });
  });

  window.addEventListener('resize', () => { if (lastState) renderTokens(lastState); });
})();
