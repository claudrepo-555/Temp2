/* ============================================
   GAME.JS — Chronicles of Fate
   Main game logic, state management, UI control
   ============================================ */

'use strict';

// ── Game State ──────────────────────────────────────────────────
const state = {
  apiKey: '',
  phase: 'setup',        // setup | character_creation | campaign_intro | playing | dead
  character: null,
  campaign: '',
  campaignShort: '',
  conversationHistory: [],
  deathCount: 0,
  pendingRoll: null,     // { ability, skill, dc, modifier, reason }
  isLoading: false,
  selectedBehaviour: null  // one of the 11 behaviour keys, or null
};

// ── DOM References ──────────────────────────────────────────────
const el = {
  setupScreen: document.getElementById('setup-screen'),
  gameScreen:  document.getElementById('game-screen'),
  deathScreen: document.getElementById('death-screen'),

  apiKeyInput: document.getElementById('api-key-input'),
  beginBtn:    document.getElementById('begin-btn'),
  restartBtn:  document.getElementById('restart-btn'),

  campaignLabel: document.getElementById('campaign-label'),
  storyLog:      document.getElementById('story-log'),
  inputArea:     document.getElementById('input-area'),
  playerInput:   document.getElementById('player-input'),
  sendBtn:       document.getElementById('send-btn'),
  sendIcon:      document.getElementById('send-icon'),
  sendSpinner:   document.getElementById('send-spinner'),
  inputHint:     document.getElementById('input-hint'),
  behaviourChips: document.getElementById('behaviour-chips'),
  behaviourHint:  document.getElementById('behaviour-hint'),

  sceneImageWrap: document.getElementById('scene-image-wrap'),
  sceneImage:     document.getElementById('scene-image'),

  diceOverlay:   document.getElementById('dice-overlay'),
  diceTitle:     document.getElementById('dice-title'),
  diceDc:        document.getElementById('dice-dc'),
  diceFace:      document.getElementById('dice-face'),
  diceResult:    document.getElementById('dice-result'),
  diceRollBtn:   document.getElementById('dice-roll-btn'),

  charName:    document.getElementById('char-name'),
  charSubtitle: document.getElementById('char-subtitle'),
  charPortrait: document.getElementById('char-portrait'),
  hpBar:       document.getElementById('hp-bar'),
  hpCurrent:   document.getElementById('hp-current'),
  hpMax:       document.getElementById('hp-max'),
  statsSection: document.getElementById('stats-section'),
  statStr:     document.getElementById('stat-str'),
  statDex:     document.getElementById('stat-dex'),
  statCon:     document.getElementById('stat-con'),
  statInt:     document.getElementById('stat-int'),
  statWis:     document.getElementById('stat-wis'),
  statCha:     document.getElementById('stat-cha'),
  deathCounterSection: document.getElementById('death-counter-section'),
  deathCount:  document.getElementById('death-count'),

  deathTitle:   document.getElementById('death-title'),
  deathMessage: document.getElementById('death-message')
};

// ── Utility ─────────────────────────────────────────────────────

function roll(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function modifier(score) {
  return Math.floor((score - 10) / 2);
}

function modStr(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function scrollToBottom() {
  el.storyLog.scrollTop = el.storyLog.scrollHeight;
}

function buildImageUrl(prompt) {
  const full = `dark fantasy DnD 5e art, ${prompt}, dramatic lighting, detailed, painterly, high quality`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=900&height=300&nologo=true&seed=${Date.now()}`;
}

// ── UI Helpers ───────────────────────────────────────────────────

function showScreen(name) {
  el.setupScreen.classList.remove('active');
  el.gameScreen.classList.remove('active');
  el.deathScreen.style.display = 'none';

  if (name === 'setup') el.setupScreen.classList.add('active');
  if (name === 'game')  el.gameScreen.classList.add('active');
  if (name === 'death') {
    el.deathScreen.style.display = 'flex';
  }
}

function setLoading(loading) {
  state.isLoading = loading;
  el.sendBtn.disabled = loading;
  el.playerInput.disabled = loading;
  el.sendIcon.style.display = loading ? 'none' : 'inline';
  el.sendSpinner.style.display = loading ? 'inline-block' : 'none';
}

function appendMessage(type, text, extra = {}) {
  const div = document.createElement('div');
  div.className = `msg msg-${type}`;

  if (type === 'dm') {
    div.innerHTML = `<div class="msg-label">Dungeon Master</div><div class="msg-text">${escapeHtml(text)}</div>`;
  } else if (type === 'player') {
    div.innerHTML = `<div class="msg-label">You</div><div class="msg-text">${escapeHtml(text)}</div>`;
  } else if (type === 'system') {
    div.innerHTML = `<div class="msg-text">${escapeHtml(text)}</div>`;
  } else if (type === 'roll') {
    const success = extra.success;
    const cls = success ? 'success' : 'failure';
    const label = success ? '✓ SUCCESS' : '✗ FAILURE';
    div.innerHTML = `
      <div class="roll-label">${escapeHtml(extra.ability || 'Roll')} Check — ${escapeHtml(extra.reason || '')}</div>
      <div class="roll-result ${cls}">${label} — Rolled ${extra.rolled} ${modStr(extra.modifier)} = ${extra.total} vs DC ${extra.dc}</div>
      <div class="roll-detail">${extra.detail || ''}</div>
    `;
  }

  el.storyLog.appendChild(div);
  scrollToBottom();
  return div;
}

function appendTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'msg msg-dm';
  div.id = 'typing-indicator';
  div.innerHTML = `<div class="msg-label">Dungeon Master</div><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  el.storyLog.appendChild(div);
  scrollToBottom();
  return div;
}

function removeTypingIndicator() {
  const t = document.getElementById('typing-indicator');
  if (t) t.remove();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>');
}

function updateCharPanel(character) {
  if (!character) return;

  el.charName.textContent = character.name || '—';
  el.charSubtitle.textContent = `${character.race || ''} ${character.class || ''}`.trim() || '—';

  const hp = character.current_hp;
  const maxHp = character.max_hp;
  el.hpCurrent.textContent = hp;
  el.hpMax.textContent = maxHp;

  const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
  el.hpBar.style.width = `${pct}%`;
  el.hpBar.classList.toggle('low', pct <= 25);

  const stats = character.stats;
  if (stats) {
    el.statsSection.style.display = '';
    el.statStr.textContent = stats.str;
    el.statDex.textContent = stats.dex;
    el.statCon.textContent = stats.con;
    el.statInt.textContent = stats.int;
    el.statWis.textContent = stats.wis;
    el.statCha.textContent = stats.cha;
  }

  el.deathCounterSection.style.display = '';
  el.deathCount.textContent = state.deathCount;
}

function updateSceneImage(prompt) {
  if (!prompt) return;
  const url = buildImageUrl(prompt);
  el.sceneImageWrap.style.display = '';
  el.sceneImage.style.opacity = '0';
  const img = new Image();
  img.onload = () => {
    el.sceneImage.src = url;
    el.sceneImage.style.opacity = '1';
  };
  img.src = url;
}

function updateCharPortrait(prompt) {
  if (!prompt || !state.character) return;
  const charPrompt = `portrait of ${state.character.race} ${state.character.class}, ${state.character.gender}, ${prompt}, fantasy character portrait`;
  const url = buildImageUrl(charPrompt);
  const img = document.createElement('img');
  img.onload = () => {
    el.charPortrait.innerHTML = '';
    el.charPortrait.appendChild(img);
  };
  img.src = url;
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
}

// ── Dice Roll System ─────────────────────────────────────────────

function showDiceRoll(rollData) {
  state.pendingRoll = rollData;
  const abilityLabel = rollData.skill ? `${rollData.ability} (${rollData.skill})` : rollData.ability;
  el.diceTitle.textContent = `${abilityLabel} Check`;
  el.diceDc.textContent = `DC ${rollData.dc} (Normal: DC ${rollData.normal_dc || rollData.dc - 10}) — ${rollData.reason || ''}`;
  el.diceFace.textContent = 'd20';
  el.diceFace.className = 'dice';
  el.diceResult.textContent = '';
  el.diceResult.className = 'dice-result';
  el.diceRollBtn.disabled = false;
  el.diceRollBtn.textContent = 'Roll the Dice!';
  el.diceOverlay.style.display = 'flex';
}

async function performRoll() {
  if (!state.pendingRoll) return;

  el.diceRollBtn.disabled = true;
  const roll_data = state.pendingRoll;
  const mod = roll_data.modifier !== undefined ? roll_data.modifier : 0;

  // Animate rolling
  el.diceFace.className = 'dice rolling';
  for (let i = 0; i < 15; i++) {
    el.diceFace.textContent = Math.floor(Math.random() * 20) + 1;
    await sleep(60);
  }

  // Final roll
  const rolled = roll(20);
  const total = rolled + mod;
  const success = total >= roll_data.dc;

  el.diceFace.className = 'dice landed';
  el.diceFace.textContent = rolled;

  await sleep(300);

  const abilityLabel = roll_data.skill ? `${roll_data.ability} (${roll_data.skill})` : roll_data.ability;
  el.diceResult.className = `dice-result ${success ? 'success' : 'failure'}`;
  el.diceResult.textContent = success
    ? `✓ ${total} vs DC ${roll_data.dc} — SUCCESS!`
    : `✗ ${total} vs DC ${roll_data.dc} — FAILURE!`;

  await sleep(1200);

  // Hide dice overlay and log result
  el.diceOverlay.style.display = 'none';

  appendMessage('roll', '', {
    ability: abilityLabel,
    reason: roll_data.reason,
    rolled,
    modifier: mod,
    total,
    dc: roll_data.dc,
    success,
    detail: `Die: ${rolled}, Modifier: ${modStr(mod)}, Total: ${total}`
  });

  state.pendingRoll = null;

  // Continue the narrative with the roll result
  await resolveRoll(rolled, total, roll_data, success);
}

async function resolveRoll(rolled, total, rollData, success) {
  const resultMsg = success
    ? `I rolled a ${rolled} + ${modStr(rollData.modifier)} = ${total}. SUCCESS against DC ${rollData.dc}.`
    : `I rolled a ${rolled} + ${modStr(rollData.modifier)} = ${total}. FAILURE against DC ${rollData.dc}.`;

  const userMsg = `[ROLL RESULT] ${resultMsg} ${success ? 'I succeeded!' : 'I failed!'}`;
  state.conversationHistory.push({ role: 'user', content: userMsg });

  await fetchDMResponse();
}

// ── API Flow ─────────────────────────────────────────────────────

async function fetchDMResponse() {
  setLoading(true);
  const typing = appendTypingIndicator();

  try {
    let response;

    if (state.phase === 'character_creation') {
      response = await DM.startCharacterCreation(state.apiKey, state.conversationHistory);
    } else if (state.phase === 'campaign_intro') {
      response = await DM.selectCampaign(state.apiKey, state.conversationHistory, state.character);
    } else {
      response = await DM.sendAction(state.apiKey, state.conversationHistory, state.character, state.campaign, state.deathCount);
    }

    removeTypingIndicator();
    await handleDMResponse(response);

  } catch (err) {
    removeTypingIndicator();
    appendMessage('system', `⚠ ${err.message}`);
    console.error(err);
  } finally {
    setLoading(false);
  }
}

async function handleDMResponse(response) {
  // Push DM message to history
  state.conversationHistory.push({ role: 'assistant', content: JSON.stringify(response) });

  const narrative = response.narrative || '';
  appendMessage('dm', narrative);

  // Handle scene image
  if (response.scene_image_prompt) {
    if (state.phase === 'character_creation' && response.character_ready) {
      updateCharPortrait(response.scene_image_prompt);
    }
    updateSceneImage(response.scene_image_prompt);
  }

  // ── Character Creation Phase ──────────────────────────────────
  if (state.phase === 'character_creation') {
    if (response.character_ready && response.character) {
      state.character = response.character;
      updateCharPanel(state.character);
      appendMessage('system', `Character created: ${state.character.name}, ${state.character.race} ${state.character.class}`);

      // Move to campaign selection
      await sleep(800);
      state.phase = 'campaign_intro';
      state.conversationHistory.push({
        role: 'user',
        content: 'My character is ready. Choose a campaign that fits and begin the adventure!'
      });
      await fetchDMResponse();
    }
    return;
  }

  // ── Campaign Intro Phase ──────────────────────────────────────
  if (state.phase === 'campaign_intro') {
    if (response.campaign_name) {
      state.campaign = response.campaign_name;
      state.campaignShort = response.campaign_short || response.campaign_name;
      el.campaignLabel.textContent = state.campaignShort;
      appendMessage('system', `Campaign: ${state.campaign}`);
    }
    state.phase = 'playing';
    el.inputArea.style.display = '';
    el.inputHint.textContent = `Type your action. (${state.campaign} — Brutal difficulty active)`;
    return;
  }

  // ── Playing Phase ─────────────────────────────────────────────

  // HP change
  if (response.hp_change && response.hp_change !== 0 && state.character) {
    const prev = state.character.current_hp;
    state.character.current_hp = Math.max(0, Math.min(state.character.max_hp, state.character.current_hp + response.hp_change));
    const diff = response.hp_change;
    if (diff < 0) {
      appendMessage('system', `💔 ${Math.abs(diff)} damage! HP: ${prev} → ${state.character.current_hp}/${state.character.max_hp}`);
    } else {
      appendMessage('system', `💚 Healed ${diff} HP! HP: ${prev} → ${state.character.current_hp}/${state.character.max_hp}`);
    }
    updateCharPanel(state.character);
  }

  // Character death
  if (response.character_died || (state.character && state.character.current_hp <= 0)) {
    await handleDeath(response);
    return;
  }

  // Ability check required
  if (response.requires_roll) {
    await sleep(400);
    showDiceRoll(response.requires_roll);
    return;
  }
}

// ── Death System ─────────────────────────────────────────────────

async function handleDeath(response) {
  const deadName = state.character ? state.character.name : 'Your character';
  const cause = response.death_cause || 'struck down by the merciless world';

  // Show death screen
  el.deathTitle.textContent = `${deadName} IS DEAD`;
  el.deathMessage.textContent = cause;
  showScreen('death');
  el.deathScreen.style.display = 'flex';

  state.deathCount++;

  await sleep(3000);

  // If DM already provided new character
  if (response.new_character) {
    await transitionToNewCharacter(response.new_character);
    return;
  }

  // Otherwise ask DM to create one
  const deathGender = state.character ? state.character.gender : 'unknown';
  state.conversationHistory.push({
    role: 'user',
    content: `[DEATH EVENT] ${deadName} has died: ${cause}. Please create a new character with the same gender (${deathGender}) but different race, class, name, and background. Continue the campaign with this new character entering the story. Set character_died=true and new_character in your JSON response.`
  });

  try {
    const newResponse = await DM.sendAction(state.apiKey, state.conversationHistory, state.character, state.campaign, state.deathCount);
    if (newResponse.new_character) {
      state.conversationHistory.push({ role: 'assistant', content: JSON.stringify(newResponse) });
      await transitionToNewCharacter(newResponse.new_character, newResponse.narrative);
    } else {
      // Fallback: generate a basic replacement
      await transitionToNewCharacter(generateFallbackCharacter(deathGender));
    }
  } catch (e) {
    await transitionToNewCharacter(generateFallbackCharacter(deathGender));
  }
}

async function transitionToNewCharacter(newChar, intro) {
  // Update state
  state.character = newChar;
  updateCharPanel(state.character);
  el.deathCount.textContent = state.deathCount;

  // Fade out death screen
  el.deathScreen.style.display = 'none';
  showScreen('game');

  appendMessage('system', `💀 Death #${state.deathCount} — A new soul enters the story.`);
  appendMessage('system', `New character: ${newChar.name}, ${newChar.race} ${newChar.class} (${newChar.gender})`);

  if (intro) {
    appendMessage('dm', intro);
  }

  updateCharPortrait(`${newChar.race} ${newChar.class}, ${newChar.gender}, fantasy portrait`);
}

function generateFallbackCharacter(gender) {
  const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Tiefling', 'Dragonborn', 'Half-Orc'];
  const classes = ['Fighter', 'Rogue', 'Wizard', 'Cleric', 'Ranger', 'Paladin', 'Warlock', 'Barbarian'];
  const names = { male: ['Aldric', 'Dorin', 'Vex', 'Castor', 'Thane', 'Rolen'], female: ['Lyra', 'Mira', 'Vesper', 'Nyx', 'Cara', 'Zara'], other: ['Quinn', 'Sage', 'Riven', 'Ash', 'Vale'] };

  const race = races[Math.floor(Math.random() * races.length)];
  const cls = classes[Math.floor(Math.random() * classes.length)];
  const namePool = names[gender] || names.other;
  const name = namePool[Math.floor(Math.random() * namePool.length)];

  const stats = {};
  ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(s => {
    stats[s] = Math.min(18, Math.max(8, [roll(6), roll(6), roll(6), roll(6)].sort().slice(1).reduce((a, b) => a + b, 0)));
  });

  const hp = 8 + modifier(stats.con);

  return {
    name, gender, race, class: cls,
    background: 'Outlander',
    level: 1,
    max_hp: Math.max(1, hp),
    current_hp: Math.max(1, hp),
    stats,
    ac: 10 + modifier(stats.dex),
    proficiency_bonus: 2,
    personality: 'A stranger to fate, shaped by desperation.'
  };
}

// ── Input Handling ───────────────────────────────────────────────

async function handlePlayerInput() {
  if (state.isLoading) return;
  const text = el.playerInput.value.trim();
  if (!text && !state.selectedBehaviour) return;

  // Build display text and DM content
  const behaviour = state.selectedBehaviour;
  const displayText = text || `[Acts ${behaviour}]`;

  let dmContent = text;
  if (behaviour) {
    const desc = BEHAVIOUR_DESCS[behaviour] || '';
    if (text) {
      dmContent = `[BEHAVIOUR: ${behaviour} — ${desc}]\n${text}`;
    } else {
      dmContent = `[BEHAVIOUR: ${behaviour} — ${desc}]\nMy character responds/acts in a ${behaviour.toLowerCase()} manner appropriate to the current situation.`;
    }
  }

  el.playerInput.value = '';
  appendMessage('player', displayText + (behaviour && text ? ` *(${behaviour})*` : behaviour ? ` *(${behaviour})*` : ''));

  // Clear behaviour selection after sending
  clearBehaviour();

  state.conversationHistory.push({ role: 'user', content: dmContent });
  await fetchDMResponse();
}

// ── Init / Start ─────────────────────────────────────────────────

async function startGame() {
  const key = el.apiKeyInput.value.trim();
  if (!key || !key.startsWith('sk-')) {
    el.apiKeyInput.style.borderColor = 'var(--red)';
    el.apiKeyInput.placeholder = 'Please enter a valid API key (starts with sk-)';
    return;
  }

  state.apiKey = key;
  state.phase = 'character_creation';
  state.conversationHistory = [];
  state.character = null;
  state.deathCount = 0;
  state.campaign = '';

  showScreen('game');
  el.inputArea.style.display = 'none';

  appendMessage('system', 'The darkness stirs. The Dungeon Master awakens...');

  // Initial DM greeting
  state.conversationHistory.push({
    role: 'user',
    content: 'Begin the game. Introduce yourself as the Dungeon Master and ask me about my character, starting with my gender.'
  });

  await fetchDMResponse();
}

function clearBehaviour() {
  state.selectedBehaviour = null;
  document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
  el.behaviourHint.style.display = 'none';
  el.behaviourHint.textContent = '';
}

function restartGame() {
  state.apiKey = state.apiKey; // keep key
  state.phase = 'setup';
  clearBehaviour();
  state.conversationHistory = [];
  state.character = null;
  state.deathCount = 0;
  state.campaign = '';
  state.pendingRoll = null;

  el.storyLog.innerHTML = '';
  el.sceneImageWrap.style.display = 'none';
  el.diceOverlay.style.display = 'none';
  el.charName.textContent = '—';
  el.charSubtitle.textContent = '—';
  el.charPortrait.innerHTML = '<div class="portrait-placeholder">?</div>';
  el.hpBar.style.width = '100%';
  el.hpCurrent.textContent = '—';
  el.hpMax.textContent = '—';
  el.statsSection.style.display = 'none';
  el.deathCounterSection.style.display = 'none';
  el.campaignLabel.textContent = '';

  showScreen('setup');
}

// ── Behaviour Definitions ────────────────────────────────────────

const BEHAVIOUR_DESCS = {
  Passive:     'Avoids conflict, speaks softly, hesitates, defers decisions. Short hesitant replies, lots of "maybe" and qualifiers.',
  Aggressive:  'Confrontational, quick to threaten or escalate, forceful and blunt. Short sharp sentences, demands, physical posturing.',
  Submissive:  'Meek, obedient, self-effacing, easily yields or apologises. "Yes sir", "as you wish", nervous laughter, lowered gaze.',
  Dominant:    'Authoritative, controlling, expects obedience, commands the conversation. Imperative language, direct orders, interruptions.',
  Diplomatic:  'Tactful, seeks compromise, polite negotiation, keeps options open. Measured speech, flattery mixed with reason.',
  Friendly:    'Warm, helpful, open, quick to trust and build rapport. Nicknames, offers of aid, enthusiastic agreement.',
  Hostile:     'Openly unfriendly, suspicious, rude or insulting without immediate violence. Sneers, curt dismissals, veiled threats.',
  Deceptive:   'Sly, evasive, lies or withholds information, hidden agenda. Half-truths, deflections, charming smiles hiding intent.',
  Flirtatious: 'Playful, seductive and complimentary. Flowing speech, compliments, theatrical gestures, magnetic presence.',
  Indifferent: 'Apathetic, bored, minimal effort responses. Shrugs, monosyllabic answers, obvious disengagement.',
  Sarcastic:   'Witty, mocking, ironic, biting and world-weary. Exaggerated sighs, eye-rolls, dry humour that undercuts others.'
};

// ── Event Listeners ──────────────────────────────────────────────

el.beginBtn.addEventListener('click', startGame);

el.apiKeyInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') startGame();
  el.apiKeyInput.style.borderColor = '';
});

el.sendBtn.addEventListener('click', handlePlayerInput);

el.playerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handlePlayerInput();
  }
});

el.diceRollBtn.addEventListener('click', performRoll);

el.restartBtn.addEventListener('click', () => {
  if (confirm('Abandon this run and start over?')) restartGame();
});

// ── Behaviour Chip Wiring ────────────────────────────────────────

el.behaviourChips.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  const behaviour = chip.dataset.behaviour;

  if (state.selectedBehaviour === behaviour) {
    // Deselect
    clearBehaviour();
  } else {
    // Select new
    document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.selectedBehaviour = behaviour;
    el.behaviourHint.textContent = BEHAVIOUR_DESCS[behaviour];
    el.behaviourHint.style.display = 'block';
  }
});
