// =====================================================
// BLACKNET: ZERO DAY — Core Game Engine
// Phase 3: CSS + Settings Application
// =====================================================

'use strict';

// ==================== CONSTANTS ====================
const GAME_VERSION = '0.3.0';
const SAVE_VERSION = 1;

const SKILLS = {
    NETWORK: 'NETWORK',
    SECURITY: 'SECURITY',
    ANALYSIS: 'ANALYSIS',
    SOCIAL: 'SOCIAL',
    CRYPTO: 'CRYPTO',
    REVERSE_ENGINEERING: 'REVERSE_ENGINEERING'
};

const SKILL_NAMES = {
    NETWORK: 'Network',
    SECURITY: 'Security',
    ANALYSIS: 'Analysis',
    SOCIAL: 'Social',
    CRYPTO: 'Cryptography',
    REVERSE_ENGINEERING: 'Reverse Engineering'
};

const SKILL_DESCRIPTIONS = {
    NETWORK: 'Улучшает анализ виртуальных сетей.',
    SECURITY: 'Уменьшает риск обнаружения.',
    ANALYSIS: 'Повышает шанс найти дополнительные доказательства.',
    SOCIAL: 'Открывает дополнительные варианты диалогов.',
    CRYPTO: 'Помогает в криптографических мини-играх.',
    REVERSE_ENGINEERING: 'Открывает сложный анализ игровых бинарных объектов.'
};

const NODE_TYPES = {
    INTERNET: 'Internet',
    ROUTER: 'Router',
    FIREWALL: 'Firewall',
    SERVER: 'Server',
    DATABASE: 'Database',
    WORKSTATION: 'Workstation',
    CLOUD: 'Cloud',
    SECURITY_NODE: 'Security Node'
};

const RARITIES = {
    COMMON: 'COMMON',
    UNCOMMON: 'UNCOMMON',
    RARE: 'RARE',
    EPIC: 'EPIC',
    LEGENDARY: 'LEGENDARY'
};

const RARITY_COLORS = {
    COMMON: '#a0a0a0',
    UNCOMMON: '#00ff88',
    RARE: '#00b0ff',
    EPIC: '#aa66ff',
    LEGENDARY: '#ffaa00'
};

const HEAT_LEVELS = {
    LOW: 'LOW',
    ELEVATED: 'ELEVATED',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

const REPUTATION_TYPES = {
    CYBER: 'CYBER',
    CORPORATE: 'CORPORATE',
    UNDERGROUND: 'UNDERGROUND',
    SECURITY: 'SECURITY'
};

const EVIDENCE_TYPES = {
    LOG: 'LOG',
    DOCUMENT: 'DOCUMENT',
    HASH: 'HASH',
    MESSAGE: 'MESSAGE',
    NETWORK: 'NETWORK',
    FILE: 'FILE',
    TESTIMONY: 'TESTIMONY'
};

const EVIDENCE_RELIABILITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CONFIRMED: 'CONFIRMED'
};

const MISSION_DIFFICULTIES = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
    EXPERT: 'EXPERT'
};

const RISK_LEVELS = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

// ==================== UTILITIES ====================
function generateId(prefix = 'id') {
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
}

function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatTime(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour12: false });
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getSafe(obj, path, fallback = null) {
    try {
        return path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : fallback, obj);
    } catch (e) {
        return fallback;
    }
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ==================== EVENT BUS ====================
class EventBus {
    constructor() {
        this.events = {};
        this.onceEvents = {};
    }
    
    on(eventName, callback) {
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(callback);
        return () => this.off(eventName, callback);
    }
    
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }
    
    once(eventName, callback) {
        if (!this.onceEvents[eventName]) this.onceEvents[eventName] = [];
        this.onceEvents[eventName].push(callback);
    }
    
    emit(eventName, payload = {}) {
        const callbacks = this.events[eventName] || [];
        const onceCallbacks = this.onceEvents[eventName] || [];
        
        callbacks.forEach(callback => {
            try {
                callback(payload);
            } catch (e) {
                console.error(`Error in event handler for ${eventName}:`, e);
            }
        });
        
        onceCallbacks.forEach(callback => {
            try {
                callback(payload);
            } catch (e) {
                console.error(`Error in once event handler for ${eventName}:`, e);
            }
        });
        
        if (this.onceEvents[eventName]) {
            delete this.onceEvents[eventName];
        }
    }
    
    clear() {
        this.events = {};
        this.onceEvents = {};
    }
}

// ==================== GAME STATE ====================
class GameState {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.version = SAVE_VERSION;
        this.createdAt = Date.now();
        this.lastSavedAt = null;
        
        // Player
        this.player = {
            id: generateId('player'),
            name: 'OPERATOR',
            level: 1,
            xp: 0,
            xpToNext: this.calculateXPToNext(1),
            credits: 500,
            skillPoints: 0,
            skills: {
                NETWORK: 0,
                SECURITY: 0,
                ANALYSIS: 0,
                SOCIAL: 0,
                CRYPTO: 0,
                REVERSE_ENGINEERING: 0
            },
            reputation: {
                CYBER: 0,
                CORPORATE: 0,
                UNDERGROUND: 0,
                SECURITY: 0
            },
            heat: 0,
            suspicion: 0,
            playTime: 0,
            lastActive: null
        };
        
        // Hardware
        this.hardware = {
            cpu: {
                id: 'cpu_basic',
                name: 'Basic CPU',
                level: 1,
                performance: 10,
                price: 0
            },
            ram: {
                id: 'ram_basic',
                name: 'Basic RAM',
                level: 1,
                performance: 10,
                price: 0
            },
            ssd: {
                id: 'ssd_basic',
                name: 'Basic SSD',
                level: 1,
                performance: 10,
                price: 0
            },
            gpu: {
                id: 'gpu_basic',
                name: 'Basic GPU',
                level: 1,
                performance: 10,
                price: 0
            },
            network: {
                id: 'net_basic',
                name: 'Basic Network Card',
                level: 1,
                performance: 10,
                price: 0
            },
            security: {
                id: 'sec_basic',
                name: 'Basic Security Module',
                level: 1,
                performance: 10,
                price: 0
            }
        };
        
        // Inventory
        this.inventory = [];
        
        // Missions
        this.missions = {
            available: [],
            active: [],
            completed: [],
            failed: [],
            dailyContracts: [],
            lastDailyRefresh: null
        };
        
        // Network
        this.network = {
            nodes: [],
            connections: [],
            analyzedNodes: [],
            currentNode: null
        };
        
        // Forensics
        this.forensics = {
            currentCase: null,
            timeline: [],
            reports: []
        };
        
        // Evidence
        this.evidence = [];
        this.intelligenceBoard = [];
        
        // Story
        this.story = {
            progress: 0,
            flags: {},
            currentChapter: 0,
            endings: []
        };
        
        // Relationships
        this.relationships = {};
        
        // Achievements
        this.achievements = {};
        
        // Statistics
        this.statistics = {
            totalMissions: 0,
            successfulMissions: 0,
            failedMissions: 0,
            moneyEarned: 0,
            moneySpent: 0,
            xpEarned: 0,
            highestHeat: 0,
            highestReputation: 0,
            playTime: 0,
            challengesCompleted: 0,
            evidenceFound: 0,
            reportsCompleted: 0,
            puzzlesSolved: 0,
            puzzlesFailed: 0,
            terminalCommandsUsed: 0,
            networkNodesAnalyzed: 0
        };
        
        // Events
        this.activeEvents = [];
        this.eventHistory = [];
        
        // VMs
        this.vms = [];
        
        // Activity Log
        this.activityLog = [];
        
        // Settings
        this.settings = {
            theme: 'dark',
            sound: true,
            animations: true,
            scanlines: true,
            terminalFontSize: 14,
            notifications: true,
            difficulty: 'NORMAL',
            autosave: true,
            debugMode: false
        };
        
        // Market
        this.market = {
            items: [],
            priceHistory: {}
        };
        
        // System
        this.system = {
            bootSequenceComplete: false,
            tutorialComplete: false,
            currentScreen: 'dashboard',
            debugCommands: []
        };
    }
    
    calculateXPToNext(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    toJSON() {
        return deepClone({
            version: this.version,
            createdAt: this.createdAt,
            lastSavedAt: this.lastSavedAt,
            player: this.player,
            hardware: this.hardware,
            inventory: this.inventory,
            missions: this.missions,
            network: this.network,
            forensics: this.forensics,
            evidence: this.evidence,
            intelligenceBoard: this.intelligenceBoard,
            story: this.story,
            relationships: this.relationships,
            achievements: this.achievements,
            statistics: this.statistics,
            activeEvents: this.activeEvents,
            eventHistory: this.eventHistory,
            vms: this.vms,
            activityLog: this.activityLog,
            settings: this.settings,
            market: this.market,
            system: this.system
        });
    }
    
    fromJSON(data) {
        if (data.version && data.version <= SAVE_VERSION) {
            const allowedKeys = Object.keys(this.toJSON());
            Object.keys(data).forEach(key => {
                if (allowedKeys.includes(key)) {
                    this[key] = data[key];
                }
            });
            return true;
        }
        return false;
    }
}

// ==================== MAIN GAME CONTROLLER ====================
class Game {
    constructor() {
        this.state = new GameState();
        this.eventBus = new EventBus();
        this.isRunning = false;
        this.lastFrameTime = null;
        this.initialized = false;
        this.currentMission = null;
    }
    
    init() {
        if (this.initialized) return;
        
        console.log('BLACKNET: ZERO DAY — Initializing...');
        console.log(`Game version: ${GAME_VERSION}`);
        console.log(`Save version: ${SAVE_VERSION}`);
        
        this.initialized = true;
        this.isRunning = true;
        
        this.setupEventListeners();
        this.checkSaveAvailability();
        this.registerEventHandlers();
        this.applySettings(); // Применяем настройки при старте
        
        this.eventBus.emit('GAME_INITIALIZED', { game: this });
        console.log('BLACKNET: ZERO DAY — Initialization complete.');
    }
    
    setupEventListeners() {
        const btnNewGame = document.getElementById('btn-new-game');
        const btnContinue = document.getElementById('btn-continue');
        const btnSettings = document.getElementById('btn-settings');
        
        if (btnNewGame) {
            btnNewGame.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                this.continueGame();
            });
        }
        
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
        
        document.querySelectorAll('[data-screen]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = element.getAttribute('data-screen');
                if (screen && screen !== 'menu') {
                    this.navigateToScreen(screen);
                }
            });
        });
        
        const mobileMore = document.getElementById('mobile-more');
        if (mobileMore) {
            mobileMore.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMobileMenu();
            });
        }
        
        const terminalInput = document.getElementById('terminal-input');
        if (terminalInput) {
            terminalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = terminalInput.value.trim();
                    if (command) {
                        this.executeTerminalCommand(command);
                        terminalInput.value = '';
                    }
                }
            });
        }
    }
    
    registerEventHandlers() {
        this.eventBus.on('SCREEN_CHANGED', (payload) => {
            const screen = payload.screen;
            this.renderScreen(screen);
        });
        
        this.eventBus.on('ACTIVITY_LOG_UPDATED', () => {
            if (this.state.system.currentScreen === 'dashboard') {
                this.renderDashboard();
            }
        });
    }
    
    checkSaveAvailability() {
        const btnContinue = document.getElementById('btn-continue');
        if (btnContinue) {
            const hasSave = this.hasSaveData();
            btnContinue.disabled = !hasSave;
        }
    }
    
    hasSaveData() {
        try {
            return localStorage.getItem('blacknet_save') !== null;
        } catch (e) {
            return false;
        }
    }
    
    startNewGame() {
        console.log('Starting new game...');
        this.state.reset();
        this.applySettings();
        this.showBootSequence();
    }
    
    continueGame() {
        console.log('Continuing game...');
        const saveData = this.loadGame();
        if (saveData) {
            this.state.fromJSON(saveData);
            this.applySettings();
            this.showBootSequence(true);
        }
    }
    
    showBootSequence(isContinue = false) {
        const startScreen = document.getElementById('start-screen');
        const bootScreen = document.getElementById('boot-screen');
        const bootLog = document.getElementById('boot-log');
        const btnEnter = document.getElementById('btn-enter-dashboard');
        
        if (startScreen) startScreen.classList.remove('active');
        if (bootScreen) bootScreen.classList.add('active');
        if (bootLog) bootLog.innerHTML = '';
        if (btnEnter) btnEnter.classList.add('hidden');
        
        const bootLines = [
            '[OK] Loading kernel',
            '[OK] Initializing cryptographic engine',
            '[OK] Mounting encrypted storage',
            '[OK] Loading threat intelligence',
            '[OK] Checking system integrity',
            '[OK] Initializing network simulator',
            '[OK] Loading mission database',
            '[OK] Connecting to BLACKNET',
            '[OK] User authenticated'
        ];
        
        let lineIndex = 0;
        
        const showNextLine = () => {
            if (lineIndex < bootLines.length) {
                const line = document.createElement('div');
                line.className = 'boot-line';
                line.textContent = bootLines[lineIndex];
                bootLog.appendChild(line);
                lineIndex++;
                setTimeout(showNextLine, 200 + Math.random() * 150);
            } else {
                if (btnEnter) {
                    btnEnter.classList.remove('hidden');
                    btnEnter.addEventListener('click', () => {
                        this.enterDashboard();
                    }, { once: true });
                }
            }
        };
        
        setTimeout(showNextLine, 300);
        this.state.system.bootSequenceComplete = true;
        this.state.system.isContinue = isContinue;
    }
    
    enterDashboard() {
        const bootScreen = document.getElementById('boot-screen');
        const gameScreen = document.getElementById('game-screen');
        
        if (bootScreen) bootScreen.classList.remove('active');
        if (gameScreen) gameScreen.classList.add('active');
        
        this.navigateToScreen('dashboard');
        this.eventBus.emit('GAME_STARTED', { game: this });
        
        this.applySettings(); // Применяем настройки после входа
        this.saveGame(true);
    }
    
    navigateToScreen(screenName) {
        const validScreens = [
            'dashboard', 'terminal', 'missions', 'network', 'forensics',
            'intelligence', 'market', 'inventory', 'skills', 'statistics', 'settings'
        ];
        
        if (!validScreens.includes(screenName)) return;
        
        this.state.system.currentScreen = screenName;
        
        document.querySelectorAll('.game-screen-content').forEach(el => {
            el.classList.remove('active');
        });
        
        const target = document.getElementById(`screen-${screenName}`);
        if (target) {
            target.classList.add('active');
        }
        
        document.querySelectorAll('#main-nav a, #mobile-nav a').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('data-screen') === screenName) {
                el.classList.add('active');
            }
        });
        
        if (screenName === 'terminal') {
            setTimeout(() => {
                const input = document.getElementById('terminal-input');
                if (input) input.focus();
            }, 100);
        }
        
        this.eventBus.emit('SCREEN_CHANGED', { screen: screenName });
    }
    
    saveGame(showNotification = false) {
        try {
            this.state.lastSavedAt = Date.now();
            const saveData = JSON.stringify(this.state.toJSON());
            localStorage.setItem('blacknet_save', saveData);
            
            if (showNotification) {
                this.addNotification('SAVE COMPLETE', 'success');
            }
            
            this.eventBus.emit('GAME_SAVED', { timestamp: this.state.lastSavedAt });
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            this.addNotification('SAVE FAILED', 'error');
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem('blacknet_save');
            if (saveData) {
                return JSON.parse(saveData);
            }
        } catch (e) {
            console.error('Load failed:', e);
        }
        return null;
    }
    
    addNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    addActivityLog(type, message) {
        this.state.activityLog.push({
            timestamp: Date.now(),
            type: type,
            message: message
        });
        
        if (this.state.activityLog.length > 500) {
            this.state.activityLog.shift();
        }
        
        this.eventBus.emit('ACTIVITY_LOG_UPDATED', { log: this.state.activityLog });
    }
    
    // ==================== НАСТРОЙКИ ====================
    applySettings() {
        // Применяем scanlines
        if (!this.state.settings.scanlines) {
            document.body.classList.add('no-scanlines');
        } else {
            document.body.classList.remove('no-scanlines');
        }
        
        // Применяем размер шрифта терминала
        const terminalWindow = document.querySelector('.terminal-window');
        const terminalInput = document.getElementById('terminal-input');
        if (terminalWindow) {
            terminalWindow.style.fontSize = this.state.settings.terminalFontSize + 'px';
        }
        if (terminalInput) {
            terminalInput.style.fontSize = this.state.settings.terminalFontSize + 'px';
        }
        
        // Другие настройки можно добавить позже
    }
    
    // ==================== РЕНДЕРИНГ ====================
    renderScreen(screenName) {
        switch (screenName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'terminal':
                this.renderTerminal();
                break;
            case 'missions':
                this.renderMissions('available');
                break;
            case 'network':
                this.renderNetwork();
                break;
            case 'forensics':
                this.renderForensics();
                break;
            case 'intelligence':
                this.renderIntelligence();
                break;
            case 'market':
                this.renderMarket('hardware');
                break;
            case 'inventory':
                this.renderInventory();
                break;
            case 'skills':
                this.renderSkills();
                break;
            case 'statistics':
                this.renderStatistics();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }
    
    renderDashboard() {
        const playerInfo = document.getElementById('player-info');
        if (playerInfo) {
            const p = this.state.player;
            playerInfo.innerHTML = `
                <div class="stat-row"><span class="stat-label">Name</span><span class="stat-value">${p.name}</span></div>
                <div class="stat-row"><span class="stat-label">Level</span><span class="stat-value">${p.level}</span></div>
                <div class="stat-row"><span class="stat-label">XP</span><span class="stat-value">${p.xp} / ${p.xpToNext}</span></div>
                <div class="stat-row"><span class="stat-label">Credits</span><span class="stat-value">${formatNumber(p.credits)}</span></div>
                <div class="stat-row"><span class="stat-label">Heat</span><span class="stat-value">${p.heat}</span></div>
                <div class="stat-row"><span class="stat-label">Suspicion</span><span class="stat-value">${p.suspicion}</span></div>
            `;
        }
        
        const systemInfo = document.getElementById('system-info');
        if (systemInfo) {
            const hw = this.state.hardware;
            const cpuLoad = Math.floor(Math.random() * 30) + 20;
            systemInfo.innerHTML = `
                <div class="stat-row"><span class="stat-label">CPU</span><span class="stat-value">${cpuLoad}% (${hw.cpu.name})</span></div>
                <div class="stat-row"><span class="stat-label">RAM</span><span class="stat-value">${hw.ram.performance * 4} MB</span></div>
                <div class="stat-row"><span class="stat-label">Storage</span><span class="stat-value">${hw.ssd.performance} GB</span></div>
                <div class="stat-row"><span class="stat-label">Network</span><span class="stat-value">${hw.network.name}</span></div>
                <div class="stat-row"><span class="stat-label">Security</span><span class="stat-value">${hw.security.name}</span></div>
            `;
        }
        
        const currentContract = document.getElementById('current-contract');
        if (currentContract) {
            const activeMission = this.state.missions.active[0];
            if (activeMission) {
                currentContract.innerHTML = `
                    <div class="stat-row"><span class="stat-label">Title</span><span class="stat-value">${activeMission.title}</span></div>
                    <div class="stat-row"><span class="stat-label">Difficulty</span><span class="stat-value">${activeMission.difficulty}</span></div>
                    <div class="stat-row"><span class="stat-label">Reward</span><span class="stat-value">${activeMission.reward} Cr</span></div>
                    <div class="stat-row"><span class="stat-label">Risk</span><span class="stat-value">${activeMission.risk}</span></div>
                `;
            } else {
                currentContract.innerHTML = '<p>No active mission</p>';
            }
        }
        
        const networkStats = document.getElementById('network-stats');
        if (networkStats) {
            const net = this.state.network;
            networkStats.innerHTML = `
                <div class="stat-row"><span class="stat-label">Nodes</span><span class="stat-value">${net.nodes.length}</span></div>
                <div class="stat-row"><span class="stat-label">Connections</span><span class="stat-value">${net.connections.length}</span></div>
                <div class="stat-row"><span class="stat-label">Analyzed</span><span class="stat-value">${net.analyzedNodes.length}</span></div>
                <div class="stat-row"><span class="stat-label">Threats</span><span class="stat-value">0</span></div>
            `;
        }
        
        const intelligenceStats = document.getElementById('intelligence-stats');
        if (intelligenceStats) {
            intelligenceStats.innerHTML = `
                <div class="stat-row"><span class="stat-label">Evidence</span><span class="stat-value">${this.state.evidence.length}</span></div>
                <div class="stat-row"><span class="stat-label">Board Items</span><span class="stat-value">${this.state.intelligenceBoard.length}</span></div>
            `;
        }
        
        const activityLog = document.getElementById('activity-log');
        if (activityLog) {
            const logs = this.state.activityLog.slice(-10).reverse();
            if (logs.length > 0) {
                activityLog.innerHTML = logs.map(log => 
                    `<div>[${formatTime(log.timestamp)}] ${log.message}</div>`
                ).join('');
            } else {
                activityLog.innerHTML = '<div>No activity yet</div>';
            }
        }
    }
    
    renderTerminal() {
        const output = document.getElementById('terminal-output');
        if (output) {
            if (!output.dataset.initialized) {
                output.innerHTML = 'Type "help" to see available commands.\n';
                output.dataset.initialized = 'true';
            }
        }
    }
    
    renderMissions(tab = 'available') {
        const container = document.getElementById('missions-container');
        if (!container) return;
        
        const missionList = this.state.missions[tab] || [];
        if (missionList.length === 0) {
            container.innerHTML = '<p>No missions in this category.</p>';
            return;
        }
        
        container.innerHTML = missionList.map(mission => `
            <div class="mission-card" data-id="${mission.id}">
                <h4>${mission.title}</h4>
                <div class="mission-desc">${mission.description}</div>
                <div class="mission-meta">
                    <span>Difficulty: ${mission.difficulty}</span>
                    <span>Reward: ${mission.reward} Cr</span>
                    <span>Risk: ${mission.risk}</span>
                    <span>Status: ${mission.status || 'Unknown'}</span>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.mission-card').forEach(card => {
            card.addEventListener('click', () => {
                const missionId = card.getAttribute('data-id');
                this.showMissionDetails(missionId);
            });
        });
    }
    
    renderNetwork() {
        const map = document.getElementById('network-map');
        if (map) {
            if (this.state.network.nodes.length === 0) {
                map.innerHTML = '<div style="padding:20px; text-align:center;">No network data. Use terminal to scan.</div>';
            } else {
                map.innerHTML = this.state.network.nodes.map(node => 
                    `<div style="position:absolute; left:${node.x || 50}%; top:${node.y || 50}%; 
                          width:10px; height:10px; background:var(--cyan); border-radius:50%; 
                          cursor:pointer;" title="${node.name}"></div>`
                ).join('');
            }
        }
    }
    
    renderForensics() {
        const caseContainer = document.getElementById('forensics-case');
        if (caseContainer) {
            if (!this.state.forensics.currentCase) {
                caseContainer.innerHTML = '<p>No active case. Accept a mission first.</p>';
            } else {
                caseContainer.innerHTML = `<h3>${this.state.forensics.currentCase.title}</h3>
                    <p>${this.state.forensics.currentCase.description}</p>`;
            }
        }
    }
    
    renderIntelligence() {
        const board = document.getElementById('intelligence-board');
        if (board) {
            if (this.state.evidence.length === 0) {
                board.innerHTML = '<p>No evidence collected yet.</p>';
            } else {
                board.innerHTML = this.state.evidence.map(ev => 
                    `<div class="item-card">
                        <div class="item-name">${ev.title}</div>
                        <div class="item-desc">${ev.description}</div>
                        <div class="item-meta">Type: ${ev.type} | Reliability: ${ev.reliability}</div>
                    </div>`
                ).join('');
            }
        }
    }
    
    renderMarket(category = 'hardware') {
        const container = document.getElementById('market-items');
        if (!container) return;
        
        container.innerHTML = '<p>Market is empty. Check back later.</p>';
    }
    
    renderInventory() {
        const container = document.getElementById('inventory-list');
        if (container) {
            if (this.state.inventory.length === 0) {
                container.innerHTML = '<p>Your inventory is empty.</p>';
            } else {
                container.innerHTML = this.state.inventory.map(item => 
                    `<div class="item-card">
                        <div class="item-name">${item.name}</div>
                        <div class="item-desc">${item.description}</div>
                        <div class="item-meta">Qty: ${item.quantity} | Rarity: ${item.rarity}</div>
                    </div>`
                ).join('');
            }
        }
    }
    
    renderSkills() {
        const container = document.getElementById('skills-container');
        if (container) {
            const skills = this.state.player.skills;
            container.innerHTML = Object.keys(SKILLS).map(key => {
                const value = skills[key] || 0;
                return `
                    <div class="skill-card">
                        <h3>${SKILL_NAMES[key]} <span style="float:right;">${value}/100</span></h3>
                        <div class="skill-desc">${SKILL_DESCRIPTIONS[key]}</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width:${value}%"></div>
                        </div>
                        ${this.state.player.skillPoints > 0 ? '<button class="btn-upgrade-skill" data-skill="'+key+'">Upgrade</button>' : ''}
                    </div>
                `;
            }).join('');
            
            container.querySelectorAll('.btn-upgrade-skill').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const skillKey = btn.getAttribute('data-skill');
                    this.upgradeSkill(skillKey);
                });
            });
        }
    }
    
    renderStatistics() {
        const container = document.getElementById('statistics-container');
        if (container) {
            const stats = this.state.statistics;
            const statItems = [
                { label: 'Total Missions', value: stats.totalMissions },
                { label: 'Successful', value: stats.successfulMissions },
                { label: 'Failed', value: stats.failedMissions },
                { label: 'Money Earned', value: stats.moneyEarned },
                { label: 'Money Spent', value: stats.moneySpent },
                { label: 'XP Earned', value: stats.xpEarned },
                { label: 'Highest Heat', value: stats.highestHeat },
                { label: 'Play Time (s)', value: stats.playTime },
                { label: 'Challenges', value: stats.challengesCompleted },
                { label: 'Evidence Found', value: stats.evidenceFound },
                { label: 'Reports', value: stats.reportsCompleted }
            ];
            
            container.innerHTML = statItems.map(item => `
                <div class="stat-box">
                    <div class="stat-num">${formatNumber(item.value)}</div>
                    <div class="stat-label">${item.label}</div>
                </div>
            `).join('');
        }
    }
    
    renderSettings() {
        const container = document.getElementById('settings-container');
        if (container) {
            container.innerHTML = `
                <div class="setting-row">
                    <label>Sound</label>
                    <input type="checkbox" ${this.state.settings.sound ? 'checked' : ''} id="setting-sound">
                </div>
                <div class="setting-row">
                    <label>Animations</label>
                    <input type="checkbox" ${this.state.settings.animations ? 'checked' : ''} id="setting-animations">
                </div>
                <div class="setting-row">
                    <label>Scanlines</label>
                    <input type="checkbox" ${this.state.settings.scanlines ? 'checked' : ''} id="setting-scanlines">
                </div>
                <div class="setting-row">
                    <label>Terminal Font Size</label>
                    <select id="setting-fontsize">
                        <option value="12" ${this.state.settings.terminalFontSize == 12 ? 'selected' : ''}>12px</option>
                        <option value="14" ${this.state.settings.terminalFontSize == 14 ? 'selected' : ''}>14px</option>
                        <option value="16" ${this.state.settings.terminalFontSize == 16 ? 'selected' : ''}>16px</option>
                        <option value="18" ${this.state.settings.terminalFontSize == 18 ? 'selected' : ''}>18px</option>
                    </select>
                </div>
                <div class="setting-row">
                    <label>Notifications</label>
                    <input type="checkbox" ${this.state.settings.notifications ? 'checked' : ''} id="setting-notifications">
                </div>
                <div class="setting-row">
                    <label>Difficulty</label>
                    <select id="setting-difficulty">
                        <option value="EASY" ${this.state.settings.difficulty === 'EASY' ? 'selected' : ''}>EASY</option>
                        <option value="NORMAL" ${this.state.settings.difficulty === 'NORMAL' ? 'selected' : ''}>NORMAL</option>
                        <option value="HARD" ${this.state.settings.difficulty === 'HARD' ? 'selected' : ''}>HARD</option>
                        <option value="NIGHTMARE" ${this.state.settings.difficulty === 'NIGHTMARE' ? 'selected' : ''}>NIGHTMARE</option>
                    </select>
                </div>
                <button id="btn-save-settings" class="btn-primary" style="margin-top:20px;">SAVE SETTINGS</button>
                <button id="btn-reset-game" class="btn-secondary" style="margin-top:10px;">RESET GAME</button>
            `;
            
            document.getElementById('btn-save-settings').addEventListener('click', () => {
                this.state.settings.sound = document.getElementById('setting-sound').checked;
                this.state.settings.animations = document.getElementById('setting-animations').checked;
                this.state.settings.scanlines = document.getElementById('setting-scanlines').checked;
                this.state.settings.terminalFontSize = parseInt(document.getElementById('setting-fontsize').value);
                this.state.settings.notifications = document.getElementById('setting-notifications').checked;
                this.state.settings.difficulty = document.getElementById('setting-difficulty').value;
                this.applySettings(); // Применяем настройки сразу
                this.saveGame(true);
                this.addNotification('Settings saved', 'success');
            });
            
            document.getElementById('btn-reset-game').addEventListener('click', () => {
                this.showResetConfirm();
            });
        }
    }
    
    // ==================== МОДАЛЬНЫЕ ОКНА ====================
    showModal(title, content, buttons = []) {
        const container = document.getElementById('modal-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="modal-box">
                <h2>${title}</h2>
                <div class="modal-content">${content}</div>
                <div class="modal-buttons">
                    ${buttons.map(btn => 
                        `<button class="${btn.class || 'btn-primary'}" id="${btn.id}">${btn.label}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        container.classList.remove('hidden');
        
        buttons.forEach(btn => {
            const el = document.getElementById(btn.id);
            if (el && btn.onClick) {
                el.addEventListener('click', btn.onClick);
            }
        });
    }
    
    hideModal() {
        const container = document.getElementById('modal-container');
        if (container) container.classList.add('hidden');
    }
    
    showSettingsModal() {
        this.navigateToScreen('settings');
    }
    
    showMobileMenu() {
        const screens = [
            { id: 'intelligence', label: 'INTEL' },
            { id: 'market', label: 'MARKET' },
            { id: 'inventory', label: 'INV' },
            { id: 'skills', label: 'SKILLS' },
            { id: 'statistics', label: 'STATS' },
            { id: 'settings', label: 'SETTINGS' }
        ];
        
        const content = screens.map(s => 
            `<a href="#" data-screen="${s.id}" style="display:block; padding:10px; color:var(--cyan); text-decoration:none;">${s.label}</a>`
        ).join('');
        
        this.showModal('Menu', content, [
            { id: 'btn-close-menu', label: 'CLOSE', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
    }
    
    showMissionDetails(missionId) {
        const mission = [...this.state.missions.available, ...this.state.missions.active, ...this.state.missions.completed, ...this.state.missions.failed].find(m => m.id === missionId);
        if (!mission) return;
        
        const content = `
            <p><strong>${mission.title}</strong></p>
            <p>${mission.description}</p>
            <p>Difficulty: ${mission.difficulty}</p>
            <p>Reward: ${mission.reward} Cr</p>
            <p>Risk: ${mission.risk}</p>
            <p>XP: ${mission.xp}</p>
            <p>Objectives: ${mission.objectives.map(o => o.description).join(', ')}</p>
        `;
        
        const buttons = [];
        if (this.state.missions.available.includes(mission)) {
            buttons.push({
                id: 'btn-accept-mission',
                label: 'ACCEPT MISSION',
                class: 'btn-primary',
                onClick: () => {
                    this.acceptMission(missionId);
                    this.hideModal();
                }
            });
        }
        buttons.push({
            id: 'btn-close-modal',
            label: 'CLOSE',
            class: 'btn-secondary',
            onClick: () => this.hideModal()
        });
        
        this.showModal('Mission Details', content, buttons);
    }
    
    showResetConfirm() {
        this.showModal('Confirm Reset', '<p>Are you sure you want to reset all progress? This cannot be undone.</p>', [
            { id: 'btn-confirm-reset', label: 'YES, RESET', class: 'btn-primary', onClick: () => {
                this.state.reset();
                this.applySettings();
                this.saveGame(true);
                this.hideModal();
                this.addNotification('Game has been reset', 'warning');
            }},
            { id: 'btn-cancel-reset', label: 'CANCEL', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
    }
    
    // ==================== ТЕРМИНАЛЬНЫЕ КОМАНДЫ ====================
    executeTerminalCommand(command) {
        const output = document.getElementById('terminal-output');
        if (!output) return;
        
        const promptLine = document.createElement('div');
        promptLine.innerHTML = `<span style="color:var(--cyan)">root@blacknet:~$</span> ${command}`;
        output.appendChild(promptLine);
        
        const parts = command.toLowerCase().split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        let response = '';
        
        switch (cmd) {
            case 'help':
                response = this.terminalHelp();
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case 'status':
                response = this.terminalStatus();
                break;
            case 'whoami':
                response = this.terminalWhoami();
                break;
            case 'inventory':
                response = this.terminalInventory();
                break;
            case 'missions':
                response = this.terminalMissions();
                break;
            case 'scan':
                response = this.terminalScan(args);
                break;
            case 'connect':
                response = this.terminalConnect(args);
                break;
            case 'disconnect':
                response = this.terminalDisconnect();
                break;
            case 'nodes':
                response = this.terminalNodes();
                break;
            case 'inspect':
                response = this.terminalInspect(args);
                break;
            case 'analyze':
                response = this.terminalAnalyze(args);
                break;
            case 'decrypt':
                response = this.terminalDecrypt(args);
                break;
            case 'hash':
                response = this.terminalHash(args);
                break;
            case 'logs':
                response = this.terminalLogs();
                break;
            case 'trace':
                response = this.terminalTrace(args);
                break;
            case 'contacts':
                response = this.terminalContacts();
                break;
            case 'market':
                response = this.terminalMarket();
                break;
            case 'skills':
                response = this.terminalSkills();
                break;
            case 'system':
                response = this.terminalSystem();
                break;
            case 'history':
                response = this.terminalHistory();
                break;
            case 'vm':
                response = this.terminalVM(args);
                break;
            case 'evidence':
                response = this.terminalEvidence();
                break;
            case 'report':
                response = this.terminalReport();
                break;
            case 'debug':
                if (this.state.settings.debugMode) {
                    response = this.terminalDebug(args);
                } else {
                    response = 'Debug mode is disabled.';
                }
                break;
            default:
                response = `Command not found: ${command}. Type "help" for available commands.`;
        }
        
        if (response) {
            const respLine = document.createElement('div');
            respLine.textContent = response;
            output.appendChild(respLine);
        }
        
        output.scrollTop = output.scrollHeight;
        
        this.state.statistics.terminalCommandsUsed++;
        this.addActivityLog('TERMINAL', `Command: ${command}`);
    }
    
    terminalHelp() {
        return `Available commands:
  help        - Show this help
  clear       - Clear terminal
  status      - Show system status
  whoami      - Show current user
  inventory   - Show inventory
  missions    - Show missions
  scan        - Scan network (usage: scan [target])
  connect     - Connect to node (usage: connect <node_id>)
  disconnect  - Disconnect from current node
  nodes       - List known nodes
  inspect     - Inspect node (usage: inspect <node_id>)
  analyze     - Analyze object (usage: analyze <object>)
  decrypt     - Decrypt data (usage: decrypt <file>)
  hash        - Calculate hash (usage: hash <data>)
  logs        - Show activity log
  trace       - Trace path (usage: trace <target>)
  contacts    - Show contacts
  market      - Show market
  skills      - Show skills
  system      - Show system info
  history     - Show terminal history
  vm          - Manage virtual machines
  evidence    - Show evidence
  report      - Generate report
  (Type "debug" for debug commands if enabled)`;
    }
    
    terminalStatus() {
        const p = this.state.player;
        const hw = this.state.hardware;
        return `CPU: ${hw.cpu.performance}% | RAM: ${hw.ram.performance * 4} MB
NETWORK: STABLE
SECURITY: ACTIVE
Credits: ${p.credits}
Heat: ${p.heat}
Suspicion: ${p.suspicion}`;
    }
    
    terminalWhoami() {
        return `User: ${this.state.player.name}
Level: ${this.state.player.level}
ID: ${this.state.player.id}`;
    }
    
    terminalInventory() {
        if (this.state.inventory.length === 0) return 'Inventory is empty.';
        return this.state.inventory.map(item => 
            `${item.name} (x${item.quantity}) — ${item.rarity}`
        ).join('\n');
    }
    
    terminalMissions() {
        const active = this.state.missions.active;
        if (active.length === 0) return 'No active missions.';
        return active.map(m => `${m.title} [${m.difficulty}]`).join('\n');
    }
    
    terminalScan(args) {
        if (args.length === 0) {
            return 'Usage: scan <target> — target can be "network" or an IP address.';
        }
        if (args[0] === 'network') {
            setTimeout(() => {
                const output = document.getElementById('terminal-output');
                if (output) {
                    const line = document.createElement('div');
                    line.textContent = 'Scanning network...';
                    output.appendChild(line);
                    output.scrollTop = output.scrollHeight;
                }
            }, 100);
            setTimeout(() => {
                this.addNotification('Network scan complete', 'success');
                this.state.statistics.networkNodesAnalyzed++;
            }, 1000);
            return 'Scanning initiated...';
        }
        return `Scanning ${args[0]}... (not implemented yet)`;
    }
    
    terminalConnect(args) {
        if (args.length === 0) return 'Usage: connect <node_id>';
        return `Connecting to ${args[0]}... (feature coming soon)`;
    }
    
    terminalDisconnect() {
        return 'Disconnected.';
    }
    
    terminalNodes() {
        const nodes = this.state.network.nodes;
        if (nodes.length === 0) return 'No known nodes. Use "scan network" to discover.';
        return nodes.map(n => `${n.id} — ${n.name} (${n.type})`).join('\n');
    }
    
    terminalInspect(args) {
        if (args.length === 0) return 'Usage: inspect <node_id>';
        const node = this.state.network.nodes.find(n => n.id === args[0]);
        if (!node) return `Node ${args[0]} not found.`;
        return `Node: ${node.name}
Type: ${node.type}
Security: ${node.security || 'unknown'}
Status: ${node.status || 'unknown'}`;
    }
    
    terminalAnalyze(args) {
        if (args.length === 0) return 'Usage: analyze <object>';
        return `Analyzing ${args[0]}... (feature coming soon)`;
    }
    
    terminalDecrypt(args) {
        if (args.length === 0) return 'Usage: decrypt <file>';
        return `Decrypting ${args[0]}... (feature coming soon)`;
    }
    
    terminalHash(args) {
        if (args.length === 0) return 'Usage: hash <data>';
        return `SHA256: ${generateFakeHash(args.join(' '))}`;
    }
    
    terminalLogs() {
        const logs = this.state.activityLog.slice(-20).reverse();
        if (logs.length === 0) return 'No activity yet.';
        return logs.map(log => `[${formatTime(log.timestamp)}] ${log.message}`).join('\n');
    }
    
    terminalTrace(args) {
        if (args.length === 0) return 'Usage: trace <target>';
        return `Tracing route to ${args[0]}... (feature coming soon)`;
    }
    
    terminalContacts() {
        const contacts = Object.keys(this.state.relationships);
        if (contacts.length === 0) return 'No contacts yet.';
        return contacts.map(name => {
            const rel = this.state.relationships[name];
            return `${name} — Trust: ${rel.trust || 0}`;
        }).join('\n');
    }
    
    terminalMarket() {
        return 'Market: use "market list" to see items (feature coming soon)';
    }
    
    terminalSkills() {
        const skills = this.state.player.skills;
        return Object.keys(skills).map(key => 
            `${SKILL_NAMES[key]}: ${skills[key]}/100`
        ).join('\n');
    }
    
    terminalSystem() {
        return `BLACKNET: ZERO DAY v${GAME_VERSION}
OS: BLACKNET OS
Kernel: 5.15.0-blacknet
Uptime: ${Math.floor(this.state.player.playTime / 60)} min`;
    }
    
    terminalHistory() {
        return 'Terminal history not available in this version.';
    }
    
    terminalVM(args) {
        if (args.length === 0) return 'Usage: vm list | vm create <os>';
        if (args[0] === 'list') {
            if (this.state.vms.length === 0) return 'No virtual machines.';
            return this.state.vms.map(vm => 
                `${vm.id} — ${vm.os} (${vm.status})`
            ).join('\n');
        }
        return `Creating VM... (feature coming soon)`;
    }
    
    terminalEvidence() {
        if (this.state.evidence.length === 0) return 'No evidence found.';
        return this.state.evidence.map(ev => 
            `${ev.title} [${ev.type}] — ${ev.reliability}`
        ).join('\n');
    }
    
    terminalReport() {
        return 'Report generation not available yet.';
    }
    
    terminalDebug(args) {
        if (args.length === 0) return 'Usage: debug add-xp <amount> | add-money <amount> | reset-save';
        switch (args[0]) {
            case 'add-xp':
                const xp = parseInt(args[1]) || 10;
                this.state.player.xp += xp;
                this.checkLevelUp();
                return `Added ${xp} XP.`;
            case 'add-money':
                const money = parseInt(args[1]) || 100;
                this.state.player.credits += money;
                return `Added ${money} credits.`;
            case 'reset-save':
                this.state.reset();
                this.saveGame(true);
                return 'Save reset.';
            default:
                return 'Unknown debug command.';
        }
    }
    
    // Вспомогательные функции
    checkLevelUp() {
        const p = this.state.player;
        while (p.xp >= p.xpToNext) {
            p.xp -= p.xpToNext;
            p.level++;
            p.skillPoints++;
            p.xpToNext = this.state.calculateXPToNext(p.level);
            this.addNotification(`LEVEL UP! You are now level ${p.level}`, 'success');
            this.eventBus.emit('EVENT_LEVEL_UP', { level: p.level });
        }
    }
    
    upgradeSkill(skillKey) {
        if (this.state.player.skillPoints <= 0) return;
        if (this.state.player.skills[skillKey] >= 100) return;
        
        this.state.player.skillPoints--;
        this.state.player.skills[skillKey]++;
        this.addActivityLog('SKILL', `Upgraded ${SKILL_NAMES[skillKey]} to ${this.state.player.skills[skillKey]}`);
        this.renderSkills();
        this.saveGame();
    }
    
    update() {
        if (!this.isRunning) return;
        
        if (this.state.system.bootSequenceComplete) {
            this.state.player.playTime += 1;
            this.state.statistics.playTime += 1;
        }
        
        requestAnimationFrame(() => this.update());
    }
    
    start() {
        this.init();
        this.update();
    }
}

// Вспомогательная функция для генерации фиктивного хеша
function generateFakeHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).slice(0, 64);
}

// ==================== INITIALIZATION ====================
const game = new Game();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        game.start();
    });
} else {
    game.start();
}

window.BLACKNET = game;