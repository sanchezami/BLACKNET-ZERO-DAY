// =====================================================
// BLACKNET: ZERO DAY — Core Game Engine
// Phase 1: Architecture, GameState, EventBus, Utilities
// =====================================================

'use strict';
console.log('SCRIPT LOADED OK');
// ==================== CONSTANTS ====================
const GAME_VERSION = '0.1.0';
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
    }
    
    init() {
        if (this.initialized) return;
        
        console.log('BLACKNET: ZERO DAY — Initializing...');
        console.log(`Game version: ${GAME_VERSION}`);
        console.log(`Save version: ${SAVE_VERSION}`);
        
        this.initialized = true;
        this.isRunning = true;
        
        // Initialize systems here (will be added in later phases)
        this.setupEventListeners();
        
        // Check for existing save
        this.checkSaveAvailability();
        
        this.eventBus.emit('GAME_INITIALIZED', { game: this });
        console.log('BLACKNET: ZERO DAY — Initialization complete.');
    }
    
    setupEventListeners() {
        // Start screen buttons
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
                // Will show settings modal in later phase
                console.log('Settings clicked');
            });
        }
        
        // Navigation
        document.querySelectorAll('[data-screen]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = element.getAttribute('data-screen');
                if (screen && screen !== 'menu') {
                    this.navigateToScreen(screen);
                }
            });
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
        this.showBootSequence();
    }
    
    continueGame() {
        console.log('Continuing game...');
        const saveData = this.loadGame();
        if (saveData) {
            this.state.fromJSON(saveData);
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
        
        function showNextLine() {
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
        }
        
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
        
        // Auto-save after entering
        this.saveGame(true);
    }
    
    navigateToScreen(screenName) {
        const validScreens = [
            'dashboard', 'terminal', 'missions', 'network', 'forensics',
            'intelligence', 'market', 'inventory', 'skills', 'statistics', 'settings'
        ];
        
        if (!validScreens.includes(screenName)) return;
        
        this.state.system.currentScreen = screenName;
        
        // Update active screen
        document.querySelectorAll('.game-screen-content').forEach(el => {
            el.classList.remove('active');
        });
        
        const target = document.getElementById(`screen-${screenName}`);
        if (target) {
            target.classList.add('active');
        }
        
        // Update nav active state
        document.querySelectorAll('#main-nav a, #mobile-nav a').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('data-screen') === screenName) {
                el.classList.add('active');
            }
        });
        
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
        
        // Keep log manageable
        if (this.state.activityLog.length > 500) {
            this.state.activityLog.shift();
        }
        
        this.eventBus.emit('ACTIVITY_LOG_UPDATED', { log: this.state.activityLog });
    }
    
    update() {
        // Main game loop update (will be expanded)
        if (!this.isRunning) return;
        
        // Update play time
        if (this.state.system.bootSequenceComplete) {
            this.state.player.playTime += 1;
            this.state.statistics.playTime += 1;
        }
        
        // Request next frame
        requestAnimationFrame(() => this.update());
    }
    
    start() {
        this.init();
        this.update();
    }
}

// ==================== INITIALIZATION ====================
const game = new Game();

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        game.start();
    });
} else {
    game.start();
}

// Expose game for debugging
window.BLACKNET = game;