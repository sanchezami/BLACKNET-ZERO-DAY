// =====================================================
// BLACKNET: ZERO DAY — Полная версия со всеми системами
// =====================================================

'use strict';

// ==================== КОНСТАНТЫ ====================
const GAME_VERSION = '2.0.0';
const SAVE_VERSION = 2;

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

// ==================== УТИЛИТЫ ====================
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

function generateFakeHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).slice(0, 64);
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

// ==================== АУДИО СИСТЕМА ====================
class AudioSystem {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.volume = 0.3;
    }
    
    init() {
        if (!this.context) {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
            }
        }
    }
    
    play(type) {
        if (!this.enabled || !this.context) return;
        
        this.init();
        const ctx = this.context;
        
        switch(type) {
            case 'click':
                this.playTone(800, 0.05);
                break;
            case 'success':
                this.playTone(1200, 0.1);
                setTimeout(() => this.playTone(1600, 0.1), 100);
                break;
            case 'error':
                this.playTone(200, 0.2);
                break;
            case 'notification':
                this.playTone(900, 0.08);
                break;
            case 'mission':
                this.playTone(1000, 0.15);
                setTimeout(() => this.playTone(1300, 0.15), 150);
                break;
            case 'achievement':
                this.playTone(1500, 0.12);
                setTimeout(() => this.playTone(1800, 0.12), 120);
                break;
            case 'keypress':
                this.playTone(500, 0.02);
                break;
        }
    }
    
    playTone(freq, duration) {
        if (!this.context) return;
        const ctx = this.context;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
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
        
        this.hardware = {
            cpu: { id: 'cpu_basic', name: 'Basic CPU', level: 1, performance: 10, price: 0 },
            ram: { id: 'ram_basic', name: 'Basic RAM', level: 1, performance: 10, price: 0 },
            ssd: { id: 'ssd_basic', name: 'Basic SSD', level: 1, performance: 10, price: 0 },
            gpu: { id: 'gpu_basic', name: 'Basic GPU', level: 1, performance: 10, price: 0 },
            network: { id: 'net_basic', name: 'Basic Network Card', level: 1, performance: 10, price: 0 },
            security: { id: 'sec_basic', name: 'Basic Security Module', level: 1, performance: 10, price: 0 }
        };
        
        this.inventory = [];
        this.missions = {
            available: [],
            active: [],
            completed: [],
            failed: [],
            dailyContracts: [],
            lastDailyRefresh: null
        };
        this.network = {
            nodes: [],
            connections: [],
            analyzedNodes: [],
            currentNode: null
        };
        this.forensics = {
            currentCase: null,
            timeline: [],
            reports: []
        };
        this.evidence = [];
        this.intelligenceBoard = [];
        this.story = {
            progress: 0,
            flags: {},
            currentChapter: 0,
            endings: []
        };
        this.relationships = {};
        this.achievements = {};
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
            networkNodesAnalyzed: 0,
            dailyContractsCompleted: 0
        };
        this.activeEvents = [];
        this.eventHistory = [];
        this.vms = [];
        this.activityLog = [];
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
        this.market = {
            items: [],
            priceHistory: {}
        };
        this.system = {
            bootSequenceComplete: false,
            tutorialComplete: false,
            currentScreen: 'dashboard',
            debugCommands: []
        };
        this.dailyRefreshTime = 24 * 60 * 60 * 1000; // 24 часа
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
            system: this.system,
            dailyRefreshTime: this.dailyRefreshTime
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

// ==================== ГЛАВНЫЙ КОНТРОЛЛЕР ====================
class Game {
    constructor() {
        this.state = new GameState();
        this.eventBus = new EventBus();
        this.audio = new AudioSystem();
        this.isRunning = false;
        this.initialized = false;
        this.currentMission = null;
        this.terminalHistory = [];
        this.miniGame = null; // текущая мини-игра
    }
    
    init() {
        if (this.initialized) return;
        
        console.log('BLACKNET: ZERO DAY — Initializing...');
        console.log(`Game version: ${GAME_VERSION}`);
        console.log(`Save version: ${SAVE_VERSION}`);
        
        this.initialized = true;
        this.isRunning = true;
        
        this.audio.init();
        this.audio.setEnabled(this.state.settings.sound);
        
        this.setupEventListeners();
        this.checkSaveAvailability();
        this.registerEventHandlers();
        this.applySettings();
        this.initializeWorld();
        
        this.eventBus.emit('GAME_INITIALIZED', { game: this });
        console.log('BLACKNET: ZERO DAY — Initialization complete.');
    }
    
    initializeWorld() {
        this.state.network.nodes = [
            { id: 'node_1', name: 'NODE-01', type: NODE_TYPES.SERVER, risk: 'LOW', status: 'active', security: 10, x: 30, y: 30 },
            { id: 'node_2', name: 'NODE-02', type: NODE_TYPES.ROUTER, risk: 'MEDIUM', status: 'active', security: 20, x: 60, y: 40 },
            { id: 'node_3', name: 'NODE-03', type: NODE_TYPES.DATABASE, risk: 'HIGH', status: 'active', security: 30, x: 50, y: 70 },
            { id: 'node_4', name: 'NODE-04', type: NODE_TYPES.WORKSTATION, risk: 'LOW', status: 'active', security: 15, x: 80, y: 20 },
            { id: 'node_5', name: 'NODE-05', type: NODE_TYPES.CLOUD, risk: 'CRITICAL', status: 'active', security: 40, x: 40, y: 90 },
            { id: 'node_6', name: 'NODE-06', type: NODE_TYPES.FIREWALL, risk: 'MEDIUM', status: 'active', security: 25, x: 70, y: 60 },
            { id: 'node_7', name: 'NODE-07', type: NODE_TYPES.SECURITY_NODE, risk: 'HIGH', status: 'active', security: 35, x: 20, y: 60 }
        ];
        
        this.state.network.connections = [
            { from: 'node_1', to: 'node_2' },
            { from: 'node_2', to: 'node_3' },
            { from: 'node_1', to: 'node_4' },
            { from: 'node_3', to: 'node_5' },
            { from: 'node_4', to: 'node_6' },
            { from: 'node_6', to: 'node_7' },
            { from: 'node_7', to: 'node_1' }
        ];
        
        this.createStoryMissions();
        this.initializeMarket();
        this.initializeNPCs();
        this.initializeAchievements();
        this.refreshDailyContracts();
    }
    
    createStoryMissions() {
        const missions = [
            {
                id: 'mission_1',
                title: 'THE FIRST TRACE',
                description: 'A simple log analysis on NODE-01. Something unusual in the access logs.',
                difficulty: MISSION_DIFFICULTIES.EASY,
                reward: 150,
                xp: 50,
                risk: RISK_LEVELS.LOW,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Scan network', type: 'scan_network', completed: false },
                    { id: 'obj_2', description: 'Inspect NODE-01', type: 'inspect_node', target: 'node_1', completed: false },
                    { id: 'obj_3', description: 'Analyze logs', type: 'analyze_log', target: 'node_1', completed: false },
                    { id: 'obj_4', description: 'Report findings', type: 'complete_report', completed: false }
                ],
                storyFlag: 'intro_complete'
            },
            {
                id: 'mission_2',
                title: 'GHOST IN THE NETWORK',
                description: 'There is a ghost process running on NODE-02. Find it and trace its origin.',
                difficulty: MISSION_DIFFICULTIES.EASY,
                reward: 200,
                xp: 70,
                risk: RISK_LEVELS.MEDIUM,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Connect to NODE-02', type: 'connect_node', target: 'node_2', completed: false },
                    { id: 'obj_2', description: 'Find ghost process', type: 'solve_puzzle', puzzle: 'log_analysis', completed: false },
                    { id: 'obj_3', description: 'Trace origin', type: 'trace_origin', completed: false }
                ],
                storyFlag: 'ghost_intro'
            },
            {
                id: 'mission_3',
                title: 'DEAD DROP',
                description: 'A dead drop has been discovered. Find the hidden data.',
                difficulty: MISSION_DIFFICULTIES.MEDIUM,
                reward: 300,
                xp: 100,
                risk: RISK_LEVELS.MEDIUM,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Decrypt message', type: 'solve_puzzle', puzzle: 'crypto', completed: false },
                    { id: 'obj_2', description: 'Find evidence', type: 'find_evidence', completed: false }
                ],
                storyFlag: 'dead_drop'
            },
            {
                id: 'mission_4',
                title: 'BLACK SIGNAL',
                description: 'An encrypted signal is being broadcast from NODE-03. Decode it and report.',
                difficulty: MISSION_DIFFICULTIES.MEDIUM,
                reward: 350,
                xp: 120,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Connect to NODE-03', type: 'connect_node', target: 'node_3', completed: false },
                    { id: 'obj_2', description: 'Decode signal', type: 'solve_puzzle', puzzle: 'crypto', completed: false },
                    { id: 'obj_3', description: 'Report threat', type: 'complete_report', completed: false }
                ],
                storyFlag: 'black_signal'
            },
            {
                id: 'mission_5',
                title: 'SILENT SERVER',
                description: 'A server on NODE-04 has gone silent. Investigate the cause.',
                difficulty: MISSION_DIFFICULTIES.MEDIUM,
                reward: 400,
                xp: 150,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Inspect NODE-04', type: 'inspect_node', target: 'node_4', completed: false },
                    { id: 'obj_2', description: 'Analyze server logs', type: 'analyze_log', target: 'node_4', completed: false },
                    { id: 'obj_3', description: 'Find evidence', type: 'find_evidence', completed: false }
                ],
                storyFlag: 'silent_server'
            },
            {
                id: 'mission_6',
                title: 'COLD STORAGE',
                description: 'Data from a cold storage backup has been corrupted. Recover it.',
                difficulty: MISSION_DIFFICULTIES.HARD,
                reward: 500,
                xp: 200,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Decrypt backup', type: 'solve_puzzle', puzzle: 'file_analysis', completed: false },
                    { id: 'obj_2', description: 'Recover data', type: 'complete_report', completed: false }
                ],
                storyFlag: 'cold_storage'
            },
            {
                id: 'mission_7',
                title: 'RED LEDGER',
                description: 'A financial database on NODE-05 shows anomalies. Trace the transactions.',
                difficulty: MISSION_DIFFICULTIES.HARD,
                reward: 600,
                xp: 250,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Connect to NODE-05', type: 'connect_node', target: 'node_5', completed: false },
                    { id: 'obj_2', description: 'Analyze transactions', type: 'analyze_log', target: 'node_5', completed: false },
                    { id: 'obj_3', description: 'Trace funds', type: 'trace_origin', completed: false }
                ],
                storyFlag: 'red_ledger'
            },
            {
                id: 'mission_8',
                title: 'ZERO DAY',
                description: 'A zero-day exploit is being used. Identify the vulnerability and patch it.',
                difficulty: MISSION_DIFFICULTIES.EXPERT,
                reward: 1000,
                xp: 500,
                risk: RISK_LEVELS.CRITICAL,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Analyze exploit signature', type: 'solve_puzzle', puzzle: 'memory_forensics', completed: false },
                    { id: 'obj_2', description: 'Find vulnerability', type: 'find_evidence', completed: false },
                    { id: 'obj_3', description: 'Write report', type: 'complete_report', completed: false }
                ],
                storyFlag: 'zero_day'
            },
            {
                id: 'mission_9',
                title: 'PHANTOM PROCESS',
                description: 'A process that should not exist is running on multiple nodes.',
                difficulty: MISSION_DIFFICULTIES.HARD,
                reward: 700,
                xp: 300,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Scan network', type: 'scan_network', completed: false },
                    { id: 'obj_2', description: 'Find phantom process', type: 'solve_puzzle', puzzle: 'memory_forensics', completed: false },
                    { id: 'obj_3', description: 'Kill process', type: 'trace_origin', completed: false }
                ],
                storyFlag: 'phantom'
            },
            {
                id: 'mission_10',
                title: 'NIGHT SHIFT',
                description: 'Unusual activity during night hours. Find out who is accessing the network.',
                difficulty: MISSION_DIFFICULTIES.MEDIUM,
                reward: 450,
                xp: 180,
                risk: RISK_LEVELS.MEDIUM,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Analyze access logs', type: 'analyze_log', target: 'node_1', completed: false },
                    { id: 'obj_2', description: 'Trace suspicious IP', type: 'trace_origin', completed: false },
                    { id: 'obj_3', description: 'Report findings', type: 'complete_report', completed: false }
                ],
                storyFlag: 'night_shift'
            },
            {
                id: 'mission_11',
                title: 'FALSE POSITIVE',
                description: 'An alert has triggered, but it might be a false positive. Verify.',
                difficulty: MISSION_DIFFICULTIES.EASY,
                reward: 250,
                xp: 80,
                risk: RISK_LEVELS.LOW,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Inspect alert', type: 'inspect_node', target: 'node_2', completed: false },
                    { id: 'obj_2', description: 'Analyze logs', type: 'analyze_log', target: 'node_2', completed: false },
                    { id: 'obj_3', description: 'Write report', type: 'complete_report', completed: false }
                ],
                storyFlag: 'false_positive'
            },
            {
                id: 'mission_12',
                title: 'BROKEN CHAIN',
                description: 'A blockchain transaction is broken. Find the invalid block.',
                difficulty: MISSION_DIFFICULTIES.HARD,
                reward: 800,
                xp: 350,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Analyze block data', type: 'solve_puzzle', puzzle: 'file_analysis', completed: false },
                    { id: 'obj_2', description: 'Find invalid block', type: 'find_evidence', completed: false },
                    { id: 'obj_3', description: 'Report', type: 'complete_report', completed: false }
                ],
                storyFlag: 'broken_chain'
            }
        ];
        
        this.state.missions.available.push(...missions);
    }
    
    initializeMarket() {
        const items = [
            { id: 'cpu_mid', name: 'Mid CPU', category: 'hardware', price: 300, description: 'Mid-range CPU for better analysis', effect: { type: 'cpu', performance: 20 }, rarity: RARITIES.COMMON },
            { id: 'ram_mid', name: 'Mid RAM', category: 'hardware', price: 200, description: 'More memory for parallel tasks', effect: { type: 'ram', performance: 20 }, rarity: RARITIES.COMMON },
            { id: 'ssd_mid', name: 'Mid SSD', category: 'hardware', price: 250, description: 'Faster storage', effect: { type: 'ssd', performance: 20 }, rarity: RARITIES.COMMON },
            { id: 'tool_scanner', name: 'Advanced Scanner', category: 'tools', price: 400, description: 'Better network scanning', effect: { type: 'tool' }, rarity: RARITIES.UNCOMMON },
            { id: 'software_firewall', name: 'Firewall Bypass', category: 'software', price: 500, description: 'Helps bypass firewalls', effect: { type: 'software' }, rarity: RARITIES.UNCOMMON },
            { id: 'intel_report', name: 'Intel Report', category: 'intel', price: 150, description: 'Contains useful information', effect: { type: 'intel' }, rarity: RARITIES.COMMON },
            { id: 'gpu_mid', name: 'Mid GPU', category: 'hardware', price: 350, description: 'Better graphics for visualizations', effect: { type: 'gpu', performance: 20 }, rarity: RARITIES.COMMON },
            { id: 'sec_mid', name: 'Security Upgrade', category: 'hardware', price: 450, description: 'Better security module', effect: { type: 'security', performance: 20 }, rarity: RARITIES.UNCOMMON }
        ];
        this.state.market.items = items;
        items.forEach(item => {
            this.state.market.priceHistory[item.id] = [item.price];
        });
    }
    
    initializeNPCs() {
        this.state.relationships = {
            MAYA: { name: 'MAYA', role: 'Fixer', trust: 20, dialogues: this.getDialogues('MAYA'), flags: {} },
            RAVEN: { name: 'RAVEN', role: 'Hacker', trust: 10, dialogues: this.getDialogues('RAVEN'), flags: {} },
            NEX: { name: 'NEX', role: 'Broker', trust: 15, dialogues: this.getDialogues('NEX'), flags: {} },
            WARDEN: { name: 'WARDEN', role: 'Security', trust: 5, dialogues: this.getDialogues('WARDEN'), flags: {} },
            GHOST: { name: 'GHOST', role: 'Mysterious', trust: 0, dialogues: this.getDialogues('GHOST'), flags: {} }
        };
    }
    
    getDialogues(npcId) {
        // База диалогов для каждого NPC
        switch(npcId) {
            case 'MAYA':
                return [
                    { text: "Welcome, operator. I'm MAYA. I can get you contracts. Need anything?", responses: [
                        { text: "What kind of contracts?", action: (game) => { game.addActivityLog('NPC', 'Asked MAYA about contracts'); game.addNotification('MAYA: I deal in corporate espionage and data retrieval.', 'info'); } },
                        { text: "Who are you exactly?", action: (game) => { game.addActivityLog('NPC', 'Asked MAYA about herself'); game.addNotification('MAYA: I am a fixer. I connect people who need things with people who can get them.', 'info'); } },
                        { text: "Goodbye.", action: null }
                    ]},
                    { text: "You need better equipment. Check the market.", responses: [
                        { text: "Okay.", action: null },
                        { text: "Can you give me a discount?", action: (game) => { game.addNotification('MAYA: Maybe if you prove yourself.', 'info'); } }
                    ]}
                ];
            case 'RAVEN':
                return [
                    { text: "Hey. I'm Raven. I know the dark web. You need something?", responses: [
                        { text: "Tell me about the Ghost.", action: (game) => { game.addNotification('RAVEN: Ghost is a legend. No one knows who they are.', 'info'); } },
                        { text: "Goodbye.", action: null }
                    ]}
                ];
            case 'NEX':
                return [
                    { text: "Greetings. I am NEX, a broker of information. Buy or sell?", responses: [
                        { text: "Buy information.", action: (game) => { game.addNotification('NEX: Come back when you have credits.', 'info'); } },
                        { text: "Sell information.", action: (game) => { game.addNotification('NEX: Bring me evidence.', 'info'); } }
                    ]}
                ];
            case 'WARDEN':
                return [
                    { text: "I am WARDEN. Security specialist. Stay out of trouble.", responses: [
                        { text: "I need help with a case.", action: (game) => { game.addNotification('WARDEN: Provide details.', 'info'); } },
                        { text: "Goodbye.", action: null }
                    ]}
                ];
            case 'GHOST':
                return [
                    { text: "...", responses: [
                        { text: "Who are you?", action: (game) => { game.addNotification('GHOST: ...', 'info'); } },
                        { text: "I found your trace.", action: (game) => { game.addNotification('GHOST: You are getting closer.', 'info'); } }
                    ]}
                ];
            default:
                return [];
        }
    }
    
    initializeAchievements() {
        const achievements = [
            { id: 'ach_first_login', name: 'FIRST LOGIN', description: 'Start the game', condition: () => true, unlocked: false },
            { id: 'ach_first_contract', name: 'FIRST CONTRACT', description: 'Complete first mission', condition: () => this.state.statistics.successfulMissions >= 1, unlocked: false },
            { id: 'ach_network_architect', name: 'NETWORK ARCHITECT', description: 'Analyze 10 nodes', condition: () => this.state.statistics.networkNodesAnalyzed >= 10, unlocked: false },
            { id: 'ach_digital_detective', name: 'DIGITAL DETECTIVE', description: 'Find 20 evidence', condition: () => this.state.statistics.evidenceFound >= 20, unlocked: false },
            { id: 'ach_master_analyst', name: 'MASTER ANALYST', description: 'Complete 5 reports', condition: () => this.state.statistics.reportsCompleted >= 5, unlocked: false },
            { id: 'ach_ghost_protocol', name: 'GHOST PROTOCOL', description: 'Reach trust 50 with GHOST', condition: () => this.state.relationships.GHOST && this.state.relationships.GHOST.trust >= 50, unlocked: false },
            { id: 'ach_no_trace', name: 'NO TRACE', description: 'Complete a mission with low heat', condition: () => this.state.player.heat < 20 && this.state.statistics.successfulMissions >= 1, unlocked: false },
            { id: 'ach_zero_day', name: 'ZERO DAY', description: 'Reach story flag zero_day', condition: () => this.state.story.flags.zero_day, unlocked: false },
            { id: 'ach_perfect_report', name: 'PERFECT REPORT', description: 'Get grade S in a report', condition: () => this.state.forensics.reports.some(r => r.grade === 'S'), unlocked: false },
            { id: 'ach_night_owl', name: 'NIGHT OWL', description: 'Play for 1 hour', condition: () => this.state.statistics.playTime >= 3600, unlocked: false },
            { id: 'ach_puzzle_master', name: 'PUZZLE MASTER', description: 'Solve 10 puzzles', condition: () => this.state.statistics.puzzlesSolved >= 10, unlocked: false },
            { id: 'ach_rich', name: 'RICH', description: 'Earn 10000 credits total', condition: () => this.state.statistics.moneyEarned >= 10000, unlocked: false }
        ];
        
        achievements.forEach(ach => {
            this.state.achievements[ach.id] = ach;
        });
    }
    
    refreshDailyContracts() {
        const now = Date.now();
        const lastRefresh = this.state.missions.lastDailyRefresh;
        if (lastRefresh && (now - lastRefresh) < this.state.dailyRefreshTime) {
            return; // не обновляем, если не прошло 24 часа
        }
        
        this.state.missions.lastDailyRefresh = now;
        this.state.missions.dailyContracts = this.generateDailyContracts();
        this.addNotification('New daily contracts available!', 'system');
    }
    
    generateDailyContracts() {
        const templates = [
            { title: 'Network Anomaly', desc: 'Find anomaly in node', difficulty: MISSION_DIFFICULTIES.EASY, reward: 100, xp: 30, risk: RISK_LEVELS.LOW },
            { title: 'Log Analysis', desc: 'Analyze access logs', difficulty: MISSION_DIFFICULTIES.EASY, reward: 120, xp: 40, risk: RISK_LEVELS.LOW },
            { title: 'Packet Trace', desc: 'Trace suspicious packets', difficulty: MISSION_DIFFICULTIES.MEDIUM, reward: 200, xp: 60, risk: RISK_LEVELS.MEDIUM },
            { title: 'Malware Scan', desc: 'Scan for malware', difficulty: MISSION_DIFFICULTIES.MEDIUM, reward: 250, xp: 80, risk: RISK_LEVELS.MEDIUM },
            { title: 'Cryptography', desc: 'Decrypt a file', difficulty: MISSION_DIFFICULTIES.HARD, reward: 400, xp: 120, risk: RISK_LEVELS.HIGH },
            { title: 'Forensics', desc: 'Examine digital evidence', difficulty: MISSION_DIFFICULTIES.HARD, reward: 450, xp: 150, risk: RISK_LEVELS.HIGH }
        ];
        
        const contracts = [];
        for (let i = 0; i < 3; i++) {
            const template = templates[Math.floor(Math.random() * templates.length)];
            const contract = {
                id: generateId('contract'),
                title: `${template.title} (Daily)`,
                description: template.desc,
                difficulty: template.difficulty,
                reward: template.reward + Math.floor(Math.random() * 50),
                xp: template.xp,
                risk: template.risk,
                status: 'available',
                objectives: [
                    { id: generateId('obj'), description: 'Complete task', type: 'solve_puzzle', puzzle: this.getRandomPuzzleType(), completed: false },
                    { id: generateId('obj'), description: 'Report', type: 'complete_report', completed: false }
                ]
            };
            contracts.push(contract);
        }
        return contracts;
    }
    
    getRandomPuzzleType() {
        const types = ['port_puzzle', 'hash_puzzle', 'log_analysis', 'packet_analysis', 'crypto', 'memory_forensics', 'file_analysis', 'network_topology'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    setupEventListeners() {
        document.getElementById('btn-new-game')?.addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-continue')?.addEventListener('click', () => this.continueGame());
        document.getElementById('btn-settings')?.addEventListener('click', () => this.showSettingsModal());
        
        document.querySelectorAll('[data-screen]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = element.getAttribute('data-screen');
                if (screen && screen !== 'menu') this.navigateToScreen(screen);
            });
        });
        
        document.getElementById('mobile-more')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showMobileMenu();
        });
        
        document.getElementById('terminal-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = e.target.value.trim();
                if (command) {
                    this.audio.play('keypress');
                    this.executeTerminalCommand(command);
                    e.target.value = '';
                }
            }
        });
    }
    
    registerEventHandlers() {
        this.eventBus.on('SCREEN_CHANGED', (payload) => this.renderScreen(payload.screen));
        this.eventBus.on('ACTIVITY_LOG_UPDATED', () => {
            if (this.state.system.currentScreen === 'dashboard') this.renderDashboard();
        });
        this.eventBus.on('EVENT_MISSION_COMPLETE', (payload) => {
            this.audio.play('mission');
            this.addNotification(`MISSION COMPLETE: ${payload.mission.title}\n+${payload.mission.reward} Credits, +${payload.mission.xp} XP`, 'mission');
        });
        this.eventBus.on('EVENT_LEVEL_UP', (payload) => {
            this.audio.play('success');
            this.addNotification(`LEVEL UP! You are now level ${payload.level}`, 'success');
        });
        this.eventBus.on('EVENT_ITEM_PURCHASE', (payload) => {
            this.audio.play('success');
            this.addNotification(`Purchased: ${payload.item.name}`, 'success');
        });
        this.eventBus.on('EVENT_ITEM_SOLD', (payload) => {
            this.audio.play('click');
            this.addNotification(`Sold: ${payload.item.name}`, 'info');
        });
    }
    
    checkSaveAvailability() {
        const btn = document.getElementById('btn-continue');
        if (btn) btn.disabled = !this.hasSaveData();
    }
    
    hasSaveData() {
        try { return localStorage.getItem('blacknet_save') !== null; } catch (e) { return false; }
    }
    
    startNewGame() {
        console.log('Starting new game...');
        this.state.reset();
        this.initializeWorld();
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
                    btnEnter.addEventListener('click', () => this.enterDashboard(), { once: true });
                }
            }
        };
        
        setTimeout(showNextLine, 300);
        this.state.system.bootSequenceComplete = true;
        this.state.system.isContinue = isContinue;
    }
    
    enterDashboard() {
        document.getElementById('boot-screen')?.classList.remove('active');
        document.getElementById('game-screen')?.classList.add('active');
        this.navigateToScreen('dashboard');
        this.eventBus.emit('GAME_STARTED', { game: this });
        this.applySettings();
        this.saveGame(true);
        this.refreshDailyContracts();
        this.audio.play('notification');
    }
    
    navigateToScreen(screenName) {
        const valid = ['dashboard', 'terminal', 'missions', 'network', 'forensics', 'intelligence', 'market', 'inventory', 'skills', 'statistics', 'settings'];
        if (!valid.includes(screenName)) return;
        
        this.state.system.currentScreen = screenName;
        document.querySelectorAll('.game-screen-content').forEach(el => el.classList.remove('active'));
        document.getElementById(`screen-${screenName}`)?.classList.add('active');
        
        document.querySelectorAll('#main-nav a, #mobile-nav a').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('data-screen') === screenName) el.classList.add('active');
        });
        
        if (screenName === 'terminal') {
            setTimeout(() => document.getElementById('terminal-input')?.focus(), 100);
        }
        
        this.eventBus.emit('SCREEN_CHANGED', { screen: screenName });
    }
    
    saveGame(showNotification = false) {
        try {
            this.state.lastSavedAt = Date.now();
            localStorage.setItem('blacknet_save', JSON.stringify(this.state.toJSON()));
            if (showNotification) this.addNotification('SAVE COMPLETE', 'success');
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
            const data = localStorage.getItem('blacknet_save');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    }
    
    addNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notification-container');
        if (!container || !this.state.settings.notifications) return;
        
        const el = document.createElement('div');
        el.className = `notification ${type}`;
        el.textContent = message;
        container.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.3s';
            setTimeout(() => el.remove(), 300);
        }, duration);
        this.audio.play('notification');
    }
    
    addActivityLog(type, message) {
        this.state.activityLog.push({ timestamp: Date.now(), type, message });
        if (this.state.activityLog.length > 500) this.state.activityLog.shift();
        this.eventBus.emit('ACTIVITY_LOG_UPDATED', { log: this.state.activityLog });
    }
    
    applySettings() {
        document.body.classList.toggle('no-scanlines', !this.state.settings.scanlines);
        const terminalWindow = document.querySelector('.terminal-window');
        if (terminalWindow) terminalWindow.style.fontSize = this.state.settings.terminalFontSize + 'px';
        const input = document.getElementById('terminal-input');
        if (input) input.style.fontSize = this.state.settings.terminalFontSize + 'px';
        this.audio.setEnabled(this.state.settings.sound);
    }
    
    // ==================== РЕНДЕРИНГ ====================
    renderScreen(screen) {
        switch (screen) {
            case 'dashboard': this.renderDashboard(); break;
            case 'terminal': this.renderTerminal(); break;
            case 'missions': this.renderMissions('available'); break;
            case 'network': this.renderNetwork(); break;
            case 'forensics': this.renderForensics(); break;
            case 'intelligence': this.renderIntelligence(); break;
            case 'market': this.renderMarket('hardware'); break;
            case 'inventory': this.renderInventory(); break;
            case 'skills': this.renderSkills(); break;
            case 'statistics': this.renderStatistics(); break;
            case 'settings': this.renderSettings(); break;
        }
    }
    
    renderDashboard() {
        const p = this.state.player;
        document.getElementById('player-info').innerHTML = `
            <div class="stat-row"><span class="stat-label">Name</span><span class="stat-value">${p.name}</span></div>
            <div class="stat-row"><span class="stat-label">Level</span><span class="stat-value">${p.level}</span></div>
            <div class="stat-row"><span class="stat-label">XP</span><span class="stat-value">${p.xp} / ${p.xpToNext}</span></div>
            <div class="stat-row"><span class="stat-label">Credits</span><span class="stat-value">${formatNumber(p.credits)}</span></div>
            <div class="stat-row"><span class="stat-label">Heat</span><span class="stat-value">${p.heat}</span></div>
            <div class="stat-row"><span class="stat-label">Suspicion</span><span class="stat-value">${p.suspicion}</span></div>
        `;
        
        const hw = this.state.hardware;
        const cpuLoad = Math.floor(Math.random() * 30) + 20;
        document.getElementById('system-info').innerHTML = `
            <div class="stat-row"><span class="stat-label">CPU</span><span class="stat-value">${cpuLoad}% (${hw.cpu.name})</span></div>
            <div class="stat-row"><span class="stat-label">RAM</span><span class="stat-value">${hw.ram.performance * 4} MB</span></div>
            <div class="stat-row"><span class="stat-label">Storage</span><span class="stat-value">${hw.ssd.performance} GB</span></div>
            <div class="stat-row"><span class="stat-label">Network</span><span class="stat-value">${hw.network.name}</span></div>
            <div class="stat-row"><span class="stat-label">Security</span><span class="stat-value">${hw.security.name}</span></div>
        `;
        
        const active = this.state.missions.active[0];
        document.getElementById('current-contract').innerHTML = active ? `
            <div class="stat-row"><span class="stat-label">Title</span><span class="stat-value">${active.title}</span></div>
            <div class="stat-row"><span class="stat-label">Difficulty</span><span class="stat-value">${active.difficulty}</span></div>
            <div class="stat-row"><span class="stat-label">Reward</span><span class="stat-value">${active.reward} Cr</span></div>
            <div class="stat-row"><span class="stat-label">Risk</span><span class="stat-value">${active.risk}</span></div>
        ` : '<p>No active mission</p>';
        
        const net = this.state.network;
        document.getElementById('network-stats').innerHTML = `
            <div class="stat-row"><span class="stat-label">Nodes</span><span class="stat-value">${net.nodes.length}</span></div>
            <div class="stat-row"><span class="stat-label">Connections</span><span class="stat-value">${net.connections.length}</span></div>
            <div class="stat-row"><span class="stat-label">Analyzed</span><span class="stat-value">${net.analyzedNodes.length}</span></div>
        `;
        
        document.getElementById('intelligence-stats').innerHTML = `
            <div class="stat-row"><span class="stat-label">Evidence</span><span class="stat-value">${this.state.evidence.length}</span></div>
            <div class="stat-row"><span class="stat-label">Board Items</span><span class="stat-value">${this.state.intelligenceBoard.length}</span></div>
        `;
        
        const logs = this.state.activityLog.slice(-10).reverse();
        document.getElementById('activity-log').innerHTML = logs.length > 0 ? 
            logs.map(log => `<div>[${formatTime(log.timestamp)}] ${log.message}</div>`).join('') : 
            '<div>No activity yet</div>';
    }
    
    renderTerminal() {
        const output = document.getElementById('terminal-output');
        if (output && !output.dataset.initialized) {
            output.innerHTML = 'Type "help" to see available commands.\n';
            output.dataset.initialized = 'true';
        }
    }
    
    renderMissions(tab = 'available') {
        const container = document.getElementById('missions-container');
        if (!container) return;
        
        let list = [];
        if (tab === 'available') {
            list = [...this.state.missions.available, ...this.state.missions.dailyContracts];
        } else {
            list = this.state.missions[tab] || [];
        }
        
        if (list.length === 0) {
            container.innerHTML = '<p>No missions in this category.</p>';
            return;
        }
        
        container.innerHTML = list.map(mission => `
            <div class="mission-card" data-id="${mission.id}">
                <h4>${mission.title}</h4>
                <div class="mission-desc">${mission.description}</div>
                <div class="mission-meta">
                    <span>Difficulty: ${mission.difficulty}</span>
                    <span>Reward: ${mission.reward} Cr</span>
                    <span>Risk: ${mission.risk}</span>
                    ${tab === 'available' && this.state.missions.dailyContracts.includes(mission) ? '<span style="color:var(--yellow)">DAILY</span>' : ''}
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.mission-card').forEach(card => {
            card.addEventListener('click', () => this.showMissionDetails(card.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.missions-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.missions-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderMissions(btn.getAttribute('data-tab'));
            });
        });
    }
    
    renderNetwork() {
        const map = document.getElementById('network-map');
        if (!map) return;
        
        if (this.state.network.nodes.length === 0) {
            map.innerHTML = '<div style="padding:20px;text-align:center;">No network data. Use terminal to scan.</div>';
            return;
        }
        
        let html = '';
        this.state.network.connections.forEach(conn => {
            const from = this.state.network.nodes.find(n => n.id === conn.from);
            const to = this.state.network.nodes.find(n => n.id === conn.to);
            if (from && to) {
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const length = Math.sqrt(dx*dx + dy*dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                html += `<div class="network-line" style="position:absolute; left:${from.x}%; top:${from.y}%; width:${length}%; height:1px; background:var(--border); transform-origin: left center; transform: rotate(${angle}deg);"></div>`;
            }
        });
        
        this.state.network.nodes.forEach(node => {
            const analyzed = this.state.network.analyzedNodes.includes(node.id);
            const color = analyzed ? 'var(--green)' : 'var(--cyan)';
            html += `<div class="network-node" style="position:absolute; left:${node.x}%; top:${node.y}%; width:14px; height:14px; background:${color}; border-radius:50%; cursor:pointer; transform: translate(-50%, -50%); box-shadow: 0 0 10px ${color}; animation: pulse 2s infinite;" title="${node.name} (${node.type})" data-node-id="${node.id}"></div>`;
        });
        
        map.innerHTML = html;
        
        map.querySelectorAll('[data-node-id]').forEach(el => {
            el.addEventListener('click', () => {
                const node = this.state.network.nodes.find(n => n.id === el.getAttribute('data-node-id'));
                if (node) this.showNodeInfo(node);
            });
        });
    }
    
    showNodeInfo(node) {
        const info = document.getElementById('network-info');
        if (info) {
            info.innerHTML = `
                <h3>${node.name}</h3>
                <p>Type: ${node.type}</p>
                <p>Security: ${node.security}</p>
                <p>Risk: ${node.risk}</p>
                <p>Status: ${node.status}</p>
                <button id="btn-inspect-node" class="btn-primary">INSPECT</button>
                <button id="btn-connect-node" class="btn-secondary">CONNECT</button>
            `;
            document.getElementById('btn-inspect-node').addEventListener('click', () => this.inspectNode(node.id));
            document.getElementById('btn-connect-node').addEventListener('click', () => this.terminalConnect([node.id]));
        }
    }
    
    inspectNode(nodeId) {
        const node = this.state.network.nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        if (!this.state.network.analyzedNodes.includes(nodeId)) {
            this.state.network.analyzedNodes.push(nodeId);
            this.state.statistics.networkNodesAnalyzed++;
            this.addActivityLog('NETWORK', `Inspected ${node.name}`);
            this.addNotification(`Node ${node.name} analyzed`, 'success');
            this.checkMissionObjective('inspect_node', nodeId);
        }
    }
    
    renderForensics() {
        const caseContainer = document.getElementById('forensics-case');
        if (caseContainer) {
            if (!this.state.forensics.currentCase) {
                caseContainer.innerHTML = '<p>No active case. Accept a mission first.</p>';
            } else {
                caseContainer.innerHTML = `<h3>${this.state.forensics.currentCase.title}</h3><p>${this.state.forensics.currentCase.description}</p>`;
            }
        }
        
        const timelineContainer = document.getElementById('forensics-timeline');
        if (timelineContainer) {
            if (this.state.forensics.timeline.length === 0) {
                timelineContainer.innerHTML = '<p>Timeline is empty.</p>';
            } else {
                timelineContainer.innerHTML = this.state.forensics.timeline.map(event => 
                    `<div>[${formatTime(event.timestamp)}] ${event.description}</div>`
                ).join('');
            }
        }
        
        const reportContainer = document.getElementById('forensics-report');
        if (reportContainer) {
            if (this.state.forensics.reports.length === 0) {
                reportContainer.innerHTML = '<p>No reports yet.</p>';
            } else {
                const lastReport = this.state.forensics.reports[this.state.forensics.reports.length - 1];
                reportContainer.innerHTML = `<h3>Last Report: ${lastReport.title}</h3><p>Grade: ${lastReport.grade}</p>`;
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
        
        const items = this.state.market.items.filter(item => item.category === category);
        if (items.length === 0) {
            container.innerHTML = '<p>No items in this category.</p>';
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="item-card" data-item-id="${item.id}">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.description}</div>
                <div class="item-price">${formatNumber(item.price)} Cr</div>
                <div class="item-meta">Rarity: ${item.rarity}</div>
                <button class="btn-buy-item" data-item-id="${item.id}">BUY</button>
            </div>
        `).join('');
        
        container.querySelectorAll('.btn-buy-item').forEach(btn => {
            btn.addEventListener('click', () => this.buyItem(btn.getAttribute('data-item-id')));
        });
        
        document.querySelectorAll('.market-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.market-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderMarket(btn.getAttribute('data-category'));
            });
        });
    }
    
    buyItem(itemId) {
        const item = this.state.market.items.find(i => i.id === itemId);
        if (!item) return;
        
        if (this.state.player.credits < item.price) {
            this.audio.play('error');
            this.addNotification('Not enough credits', 'error');
            return;
        }
        
        this.state.player.credits -= item.price;
        this.state.statistics.moneySpent += item.price;
        
        if (item.effect && item.effect.type && this.state.hardware[item.effect.type]) {
            this.state.hardware[item.effect.type] = {
                id: item.id,
                name: item.name,
                level: this.state.hardware[item.effect.type].level + 1,
                performance: item.effect.performance,
                price: item.price
            };
        } else {
            const existing = this.state.inventory.find(i => i.id === item.id);
            if (existing) existing.quantity++;
            else this.state.inventory.push({ ...item, quantity: 1 });
        }
        
        this.eventBus.emit('EVENT_ITEM_PURCHASE', { item });
        this.addActivityLog('MARKET', `Purchased ${item.name} for ${item.price} Cr`);
        this.saveGame();
        this.renderMarket(this.state.system.currentCategory || 'hardware');
        this.renderDashboard();
    }
    
    renderInventory() {
        const container = document.getElementById('inventory-list');
        if (container) {
            if (this.state.inventory.length === 0) {
                container.innerHTML = '<p>Your inventory is empty.</p>';
            } else {
                container.innerHTML = this.state.inventory.map(item => `
                    <div class="item-card" data-item-id="${item.id}">
                        <div class="item-name">${item.name}</div>
                        <div class="item-desc">${item.description}</div>
                        <div class="item-meta">Qty: ${item.quantity} | Rarity: ${item.rarity}</div>
                        <button class="btn-sell-item" data-item-id="${item.id}">SELL</button>
                    </div>
                `).join('');
                
                container.querySelectorAll('.btn-sell-item').forEach(btn => {
                    btn.addEventListener('click', () => this.sellItem(btn.getAttribute('data-item-id')));
                });
            }
        }
    }
    
    sellItem(itemId) {
        const item = this.state.inventory.find(i => i.id === itemId);
        if (!item) return;
        
        const sellPrice = Math.floor(item.price * 0.6);
        this.state.player.credits += sellPrice;
        this.state.statistics.moneyEarned += sellPrice;
        item.quantity--;
        if (item.quantity <= 0) {
            this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);
        }
        
        this.eventBus.emit('EVENT_ITEM_SOLD', { item });
        this.addActivityLog('MARKET', `Sold ${item.name} for ${sellPrice} Cr`);
        this.saveGame();
        this.renderInventory();
        this.renderDashboard();
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
                        <div class="progress-bar"><div class="progress-fill" style="width:${value}%"></div></div>
                        ${this.state.player.skillPoints > 0 ? `<button class="btn-upgrade-skill" data-skill="${key}">Upgrade</button>` : ''}
                    </div>
                `;
            }).join('');
            
            container.querySelectorAll('.btn-upgrade-skill').forEach(btn => {
                btn.addEventListener('click', () => this.upgradeSkill(btn.getAttribute('data-skill')));
            });
        }
    }
    
    upgradeSkill(skillKey) {
        if (this.state.player.skillPoints <= 0 || this.state.player.skills[skillKey] >= 100) return;
        this.state.player.skillPoints--;
        this.state.player.skills[skillKey]++;
        this.addActivityLog('SKILL', `Upgraded ${SKILL_NAMES[skillKey]} to ${this.state.player.skills[skillKey]}`);
        this.renderSkills();
        this.saveGame();
    }
    
    renderStatistics() {
        const container = document.getElementById('statistics-container');
        if (container) {
            const s = this.state.statistics;
            const items = [
                { label: 'Total Missions', value: s.totalMissions },
                { label: 'Successful', value: s.successfulMissions },
                { label: 'Failed', value: s.failedMissions },
                { label: 'Money Earned', value: s.moneyEarned },
                { label: 'Money Spent', value: s.moneySpent },
                { label: 'XP Earned', value: s.xpEarned },
                { label: 'Highest Heat', value: s.highestHeat },
                { label: 'Play Time (s)', value: s.playTime },
                { label: 'Challenges', value: s.challengesCompleted },
                { label: 'Evidence Found', value: s.evidenceFound },
                { label: 'Reports', value: s.reportsCompleted },
                { label: 'Puzzles Solved', value: s.puzzlesSolved },
                { label: 'Daily Contracts', value: s.dailyContractsCompleted }
            ];
            container.innerHTML = items.map(item => `
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
                <div class="setting-row"><label>Sound</label><input type="checkbox" ${this.state.settings.sound ? 'checked' : ''} id="setting-sound"></div>
                <div class="setting-row"><label>Animations</label><input type="checkbox" ${this.state.settings.animations ? 'checked' : ''} id="setting-animations"></div>
                <div class="setting-row"><label>Scanlines</label><input type="checkbox" ${this.state.settings.scanlines ? 'checked' : ''} id="setting-scanlines"></div>
                <div class="setting-row"><label>Terminal Font Size</label>
                    <select id="setting-fontsize">
                        <option value="12" ${this.state.settings.terminalFontSize == 12 ? 'selected' : ''}>12px</option>
                        <option value="14" ${this.state.settings.terminalFontSize == 14 ? 'selected' : ''}>14px</option>
                        <option value="16" ${this.state.settings.terminalFontSize == 16 ? 'selected' : ''}>16px</option>
                        <option value="18" ${this.state.settings.terminalFontSize == 18 ? 'selected' : ''}>18px</option>
                    </select>
                </div>
                <div class="setting-row"><label>Notifications</label><input type="checkbox" ${this.state.settings.notifications ? 'checked' : ''} id="setting-notifications"></div>
                <div class="setting-row"><label>Difficulty</label>
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
                this.applySettings();
                this.saveGame(true);
                this.addNotification('Settings saved', 'success');
            });
            
            document.getElementById('btn-reset-game').addEventListener('click', () => this.showResetConfirm());
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
                    ${buttons.map(btn => `<button class="${btn.class || 'btn-primary'}" id="${btn.id}">${btn.label}</button>`).join('')}
                </div>
            </div>
        `;
        container.classList.remove('hidden');
        
        buttons.forEach(btn => {
            const el = document.getElementById(btn.id);
            if (el && btn.onClick) el.addEventListener('click', btn.onClick);
        });
    }
    
    hideModal() {
        document.getElementById('modal-container')?.classList.add('hidden');
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
            `<a href="#" data-screen="${s.id}" style="display:block;padding:10px;color:var(--cyan);text-decoration:none;">${s.label}</a>`
        ).join('');
        
        this.showModal('Menu', content, [
            { id: 'btn-close-menu', label: 'CLOSE', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
    }
    
    showMissionDetails(missionId) {
        const allMissions = [...this.state.missions.available, ...this.state.missions.active, ...this.state.missions.completed, ...this.state.missions.failed, ...this.state.missions.dailyContracts];
        const mission = allMissions.find(m => m.id === missionId);
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
        const isAvailable = this.state.missions.available.includes(mission) || this.state.missions.dailyContracts.includes(mission);
        if (isAvailable) {
            buttons.push({
                id: 'btn-accept-mission',
                label: 'ACCEPT MISSION',
                class: 'btn-primary',
                onClick: () => { this.acceptMission(missionId); this.hideModal(); }
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
    
    acceptMission(missionId) {
        let mission = this.state.missions.available.find(m => m.id === missionId);
        if (!mission) mission = this.state.missions.dailyContracts.find(m => m.id === missionId);
        if (!mission) return;
        
        // Удаляем из соответствующего массива
        this.state.missions.available = this.state.missions.available.filter(m => m.id !== missionId);
        this.state.missions.dailyContracts = this.state.missions.dailyContracts.filter(m => m.id !== missionId);
        
        mission.status = 'active';
        this.state.missions.active.push(mission);
        this.currentMission = mission;
        
        this.state.statistics.totalMissions++;
        this.addActivityLog('MISSION', `Mission started: ${mission.title}`);
        this.eventBus.emit('EVENT_MISSION_ACCEPT', { mission });
        this.addNotification(`Mission accepted: ${mission.title}`, 'mission');
        this.saveGame();
        this.renderMissions('active');
        this.renderDashboard();
    }
    
    showResetConfirm() {
        this.showModal('Confirm Reset', '<p>Are you sure you want to reset all progress? This cannot be undone.</p>', [
            { id: 'btn-confirm-reset', label: 'YES, RESET', class: 'btn-primary', onClick: () => {
                this.state.reset();
                this.initializeWorld();
                this.applySettings();
                this.saveGame(true);
                this.hideModal();
                this.addNotification('Game has been reset', 'warning');
            }},
            { id: 'btn-cancel-reset', label: 'CANCEL', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
    }
    
    // ==================== СИСТЕМА МИССИЙ ====================
    checkMissionObjective(type, target) {
        const activeMission = this.state.missions.active[0];
        if (!activeMission) return;
        
        activeMission.objectives.forEach(obj => {
            if (obj.completed) return;
            if (obj.type === type) {
                if (!target || obj.target === target) {
                    obj.completed = true;
                    this.addNotification(`Objective complete: ${obj.description}`, 'success');
                    this.addActivityLog('MISSION', `Objective complete: ${obj.description}`);
                    this.checkMissionCompletion(activeMission);
                }
            }
        });
    }
    
    checkMissionCompletion(mission) {
        if (mission.objectives.every(o => o.completed)) {
            this.completeMission(mission);
        }
    }
    
    completeMission(mission) {
        this.state.missions.active = this.state.missions.active.filter(m => m.id !== mission.id);
        mission.status = 'completed';
        this.state.missions.completed.push(mission);
        
        this.state.player.credits += mission.reward;
        this.state.player.xp += mission.xp;
        this.state.statistics.successfulMissions++;
        this.state.statistics.moneyEarned += mission.reward;
        this.state.statistics.xpEarned += mission.xp;
        
        if (mission.storyFlag) {
            this.state.story.flags[mission.storyFlag] = true;
            this.state.story.progress++;
        }
        
        // Если это ежедневный контракт, увеличиваем счётчик
        if (mission.title.includes('Daily')) {
            this.state.statistics.dailyContractsCompleted++;
        }
        
        this.eventBus.emit('EVENT_MISSION_COMPLETE', { mission });
        this.checkLevelUp();
        this.checkAchievements();
        this.saveGame();
        this.renderDashboard();
        this.renderMissions('completed');
    }
    
    checkLevelUp() {
        const p = this.state.player;
        while (p.xp >= p.xpToNext) {
            p.xp -= p.xpToNext;
            p.level++;
            p.skillPoints++;
            p.xpToNext = this.state.calculateXPToNext(p.level);
            this.eventBus.emit('EVENT_LEVEL_UP', { level: p.level });
        }
    }
    
    checkAchievements() {
        Object.values(this.state.achievements).forEach(ach => {
            if (!ach.unlocked && ach.condition()) {
                ach.unlocked = true;
                this.audio.play('achievement');
                this.addNotification(`ACHIEVEMENT UNLOCKED: ${ach.name}`, 'achievement');
                this.addActivityLog('ACHIEVEMENT', `Unlocked: ${ach.name}`);
            }
        });
    }
    
    // ==================== МИНИ-ИГРЫ ====================
    startMiniGame(puzzleType) {
        this.audio.play('click');
        switch (puzzleType) {
            case 'port_puzzle': this.startPortPuzzle(); break;
            case 'hash_puzzle': this.startHashPuzzle(); break;
            case 'log_analysis': this.startLogAnalysis(); break;
            case 'packet_analysis': this.startPacketAnalysis(); break;
            case 'crypto': this.startCryptoPuzzle(); break;
            case 'memory_forensics': this.startMemoryForensics(); break;
            case 'file_analysis': this.startFileAnalysis(); break;
            case 'network_topology': this.startNetworkTopology(); break;
            default: this.addNotification('Unknown puzzle type', 'error');
        }
    }
    
    startPortPuzzle() {
        const ports = [80, 443, 22, 21, 8080, 3306];
        const targetPort = ports[Math.floor(Math.random() * ports.length)];
        const content = `
            <p>Find the open port. Scan the target system.</p>
            <p>Target: 192.168.1.100</p>
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;">
                ${ports.map(p => `<button class="port-btn btn-secondary" data-port="${p}">Port ${p}</button>`).join('')}
            </div>
        `;
        this.showModal('PORT PUZZLE', content, [
            { id: 'btn-cancel', label: 'Cancel', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
        
        document.querySelectorAll('.port-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedPort = parseInt(btn.getAttribute('data-port'));
                if (selectedPort === targetPort) {
                    this.audio.play('success');
                    this.addNotification('Puzzle solved!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'port_puzzle');
                    this.hideModal();
                } else {
                    this.audio.play('error');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            });
        });
    }
    
    startHashPuzzle() {
        const words = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
        const targetWord = words[Math.floor(Math.random() * words.length)];
        const targetHash = generateFakeHash(targetWord).substring(0, 8);
        const content = `
            <p>Match the hash: <strong>${targetHash}</strong></p>
            <p>Which word produces this hash?</p>
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;">
                ${words.map(w => `<button class="hash-btn btn-secondary" data-word="${w}">${w}</button>`).join('')}
            </div>
        `;
        this.showModal('HASH PUZZLE', content, [
            { id: 'btn-cancel', label: 'Cancel', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
        
        document.querySelectorAll('.hash-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedWord = btn.getAttribute('data-word');
                if (selectedWord === targetWord) {
                    this.audio.play('success');
                    this.addNotification('Puzzle solved!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'hash_puzzle');
                    this.hideModal();
                } else {
                    this.audio.play('error');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            });
        });
    }
    
    startLogAnalysis() {
        // Простая игра: найти аномальную запись среди списка
        const logs = [
            { text: 'Login successful from 192.168.1.5', normal: true },
            { text: 'Login failed from 10.0.0.3', normal: true },
            { text: 'Access granted to file.txt', normal: true },
            { text: 'Unusual process started: "ghost.exe"', normal: false },
            { text: 'Logout from 192.168.1.7', normal: true }
        ];
        const shuffled = [...logs].sort(() => Math.random() - 0.5);
        const content = `
            <p>Find the anomalous log entry.</p>
            <div style="margin-top:10px;">
                ${shuffled.map((log, index) => `<button class="log-btn btn-secondary" data-index="${index}">${log.text}</button>`).join('')}
            </div>
        `;
        this.showModal('LOG ANALYSIS', content, [
            { id: 'btn-cancel', label: 'Cancel', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
        
        document.querySelectorAll('.log-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                if (!shuffled[index].normal) {
                    this.audio.play('success');
                    this.addNotification('Anomaly found!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'log_analysis');
                    this.hideModal();
                } else {
                    this.audio.play('error');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            });
        });
    }
    
    startPacketAnalysis() {
        const packets = [
            { src: '192.168.1.2', dst: '8.8.8.8', proto: 'TCP', suspicious: false },
            { src: '192.168.1.3', dst: '10.0.0.1', proto: 'UDP', suspicious: false },
            { src: '10.0.0.99', dst: '192.168.1.100', proto: 'ICMP', suspicious: true },
            { src: '192.168.1.4', dst: '172.16.0.5', proto: 'TCP', suspicious: false }
        ];
        const shuffled = [...packets].sort(() => Math.random() - 0.5);
        const content = `
            <p>Which packet is suspicious?</p>
            <div style="margin-top:10px;">
                ${shuffled.map((p, index) => `<button class="packet-btn btn-secondary" data-index="${index}">${p.src} -> ${p.dst} [${p.proto}]</button>`).join('')}
            </div>
        `;
        this.showModal('PACKET ANALYSIS', content, [
            { id: 'btn-cancel', label: 'Cancel', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
        
        document.querySelectorAll('.packet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                if (shuffled[index].suspicious) {
                    this.audio.play('success');
                    this.addNotification('Suspicious packet found!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'packet_analysis');
                    this.hideModal();
                } else {
                    this.audio.play('error');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            });
        });
    }
    
    startCryptoPuzzle() {
        // Простой сдвиг Цезаря
        const plain = 'BLACKNET';
        const shift = 3;
        const cipher = plain.split('').map(ch => {
            if (ch >= 'A' && ch <= 'Z') return String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65);
            return ch;
        }).join('');
        const content = `
            <p>Decrypt the following Caesar cipher (shift unknown):</p>
            <p><strong>${cipher}</strong></p>
            <p>Enter the plaintext:</p>
            <input type="text" id="crypto-input" style="width:100%; padding:5px; background:var(--bg-glass); border:1px solid var(--border); color:var(--text-primary); font-family:var(--font-mono);" />
        `;
        this.showModal('CRYPTO PUZZLE', content, [
            { id: 'btn-check', label: 'Check', class: 'btn-primary', onClick: () => {
                const input = document.getElementById('crypto-input').value.trim().toUpperCase();
                if (input === plain) {
                    this.audio.play('success');
                    this.addNotification('Decrypted!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'crypto');
                    this.hideModal();
                } else {
                    this.audio.play('error');
                    this.addNotification('Wrong answer', 'error');
                }
            }},
            { id: 'btn-cancel', label: 'Cancel', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
    }
    
    startMemoryForensics() {
        const processes = [
            { name: 'chrome.exe', normal: true },
            { name: 'explorer.exe', normal: true },
            { name: 'system.exe', normal: true },
            { name: 'malware.bin', normal: false },
            { name: 'svchost.exe', normal: true }
        ];
        const shuffled = [...processes].sort(() => Math.random() - 0.5);
        const content = `
            <p>Find the malicious process in memory dump.</p>
            <div style="margin-top:10px;">
                ${shuffled.map((p, index) => `<button class="proc-btn btn-secondary" data-index="${index}">${p.name}</button>`).join('')}
            </div>
        `;
        this.showModal('MEMORY FORENSICS', content, [
            { id: 'btn-cancel', label: 'Cancel', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
        
        document.querySelectorAll('.proc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                if (!shuffled[index].normal) {
                    this.audio.play('success');
                    this.addNotification('Malicious process found!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'memory_forensics');
                    this.hideModal();
                } else {
                    this.audio.play('error');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            });
        });
    }
    
    startFileAnalysis() {
        const files = [
            { name: 'report.doc', normal: true },
            { name: 'image.jpg', normal: true },
            { name: 'data.exe', normal: false },
            { name: 'notes.txt', normal: true },
            { name: 'archive.zip', normal: true }
        ];
        const shuffled = [...files].sort(() => Math.random() - 0.5);
        const content = `
            <p>Which file is suspicious?</p>
            <div style="margin-top:10px;">
                ${shuffled.map((f, index) => `<button class="file-btn btn-secondary" data-index="${index}">${f.name}</button>`).join('')}
            </div>
        `;
        this.showModal('FILE ANALYSIS', content, [
            { id: 'btn-cancel', label: 'Cancel', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
        
        document.querySelectorAll('.file-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                if (!shuffled[index].normal) {
                    this.audio.play('success');
                    this.addNotification('Suspicious file found!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'file_analysis');
                    this.hideModal();
                } else {
                    this.audio.play('error');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            });
        });
    }
    
    startNetworkTopology() {
        // Просто выбор правильного пути
        const paths = [
            { from: 'A', to: 'B', valid: true },
            { from: 'A', to: 'C', valid: false },
            { from: 'B', to: 'D', valid: true },
            { from: 'C', to: 'D', valid: false }
        ];
        const content = `
            <p>Find the valid path from A to D.</p>
            <div style="margin-top:10px;">
                <button class="path-btn btn-secondary" data-path="AB">A -> B</button>
                <button class="path-btn btn-secondary" data-path="AC">A -> C</button>
                <button class="path-btn btn-secondary" data-path="BD">B -> D</button>
                <button class="path-btn btn-secondary" data-path="CD">C -> D</button>
            </div>
        `;
        this.showModal('NETWORK TOPOLOGY', content, [
            { id: 'btn-cancel', label: 'Cancel', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
        
        document.querySelectorAll('.path-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const path = btn.getAttribute('data-path');
                if (path === 'AB' || path === 'BD') {
                    this.audio.play('success');
                    this.addNotification('Correct path!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'network_topology');
                    this.hideModal();
                } else {
                    this.audio.play('error');
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            });
        });
    }
    
    // ==================== ТЕРМИНАЛЬНЫЕ КОМАНДЫ ====================
    executeTerminalCommand(command) {
        const output = document.getElementById('terminal-output');
        if (!output) return;
        
        this.terminalHistory.push(command);
        
        const promptLine = document.createElement('div');
        promptLine.innerHTML = `<span style="color:var(--cyan)">root@blacknet:~$</span> ${command}`;
        output.appendChild(promptLine);
        
        const parts = command.toLowerCase().split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        let response = '';
        
        switch (cmd) {
            case 'help': response = this.terminalHelp(); break;
            case 'clear': output.innerHTML = ''; return;
            case 'status': response = this.terminalStatus(); break;
            case 'whoami': response = this.terminalWhoami(); break;
            case 'inventory': response = this.terminalInventory(); break;
            case 'missions': response = this.terminalMissions(); break;
            case 'scan': response = this.terminalScan(args); break;
            case 'connect': response = this.terminalConnect(args); break;
            case 'disconnect': response = this.terminalDisconnect(); break;
            case 'nodes': response = this.terminalNodes(); break;
            case 'inspect': response = this.terminalInspect(args); break;
            case 'analyze': response = this.terminalAnalyze(args); break;
            case 'decrypt': response = this.terminalDecrypt(args); break;
            case 'hash': response = this.terminalHash(args); break;
            case 'logs': response = this.terminalLogs(); break;
            case 'trace': response = this.terminalTrace(args); break;
            case 'contacts': response = this.terminalContacts(); break;
            case 'market': response = this.terminalMarket(); break;
            case 'skills': response = this.terminalSkills(); break;
            case 'system': response = this.terminalSystem(); break;
            case 'history': response = this.terminalHistoryCmd(); break;
            case 'vm': response = this.terminalVM(args); break;
            case 'evidence': response = this.terminalEvidence(); break;
            case 'report': response = this.terminalReport(); break;
            case 'puzzle': response = this.terminalPuzzle(args); break;
            case 'npc': response = this.terminalNPC(args); break;
            case 'debug': response = this.state.settings.debugMode ? this.terminalDebug(args) : 'Debug mode is disabled.'; break;
            case 'sudo':
            case 'su':
                response = 'Nice try. This is a virtual environment.';
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
  missions    - Show active missions
  scan        - Scan network (usage: scan network)
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
  vm          - Manage virtual machines (vm list)
  evidence    - Show evidence
  report      - Generate report
  puzzle      - Start a mini-game (usage: puzzle <type>)
  npc         - Talk to NPC (usage: npc <name>)
  debug       - Debug commands (if enabled)`;
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
        return this.state.inventory.map(item => `${item.name} (x${item.quantity}) — ${item.rarity}`).join('\n');
    }
    
    terminalMissions() {
        const active = this.state.missions.active;
        if (active.length === 0) return 'No active missions.';
        return active.map(m => `${m.title} [${m.difficulty}]`).join('\n');
    }
    
    terminalScan(args) {
        if (args.length === 0 || args[0] !== 'network') return 'Usage: scan network';
        this.addNotification('Network scan complete', 'success');
        this.state.statistics.networkNodesAnalyzed++;
        this.checkMissionObjective('scan_network');
        return 'Scanning network... complete.';
    }
    
    terminalConnect(args) {
        if (args.length === 0) return 'Usage: connect <node_id>';
        const node = this.state.network.nodes.find(n => n.id === args[0]);
        if (!node) return `Node ${args[0]} not found.`;
        this.state.network.currentNode = node.id;
        this.checkMissionObjective('connect_node', node.id);
        return `Connected to ${node.name}.`;
    }
    
    terminalDisconnect() {
        this.state.network.currentNode = null;
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
        this.inspectNode(node.id);
        return `Node: ${node.name}
Type: ${node.type}
Security: ${node.security || 'unknown'}
Status: ${node.status || 'unknown'}`;
    }
    
    terminalAnalyze(args) {
        if (args.length === 0) return 'Usage: analyze <object>';
        this.checkMissionObjective('analyze_log', args[0]);
        return `Analyzing ${args[0]}... done. No anomalies found.`;
    }
    
    terminalDecrypt(args) {
        if (args.length === 0) return 'Usage: decrypt <file>';
        return `Decrypting ${args[0]}... (use "puzzle crypto" for decryption mini-game)`;
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
        this.checkMissionObjective('trace_origin');
        return `Tracing route to ${args[0]}... complete.`;
    }
    
    terminalContacts() {
        const contacts = Object.keys(this.state.relationships);
        if (contacts.length === 0) return 'No contacts yet.';
        return contacts.map(name => {
            const rel = this.state.relationships[name];
            return `${name} — Trust: ${rel.trust}`;
        }).join('\n');
    }
    
    terminalMarket() {
        return 'Market: ' + this.state.market.items.map(i => `${i.name} (${i.price} Cr)`).join(', ');
    }
    
    terminalSkills() {
        const skills = this.state.player.skills;
        return Object.keys(skills).map(key => `${SKILL_NAMES[key]}: ${skills[key]}/100`).join('\n');
    }
    
    terminalSystem() {
        return `BLACKNET: ZERO DAY v${GAME_VERSION}
OS: BLACKNET OS
Uptime: ${Math.floor(this.state.player.playTime / 60)} min`;
    }
    
    terminalHistoryCmd() {
        if (this.terminalHistory.length === 0) return 'No command history.';
        return this.terminalHistory.slice(-20).join('\n');
    }
    
    terminalVM(args) {
        if (args.length === 0) return 'Usage: vm list | vm create <os>';
        if (args[0] === 'list') {
            if (this.state.vms.length === 0) return 'No virtual machines.';
            return this.state.vms.map(vm => `${vm.id} — ${vm.os} (${vm.status})`).join('\n');
        }
        if (args[0] === 'create' && args[1]) {
            const vm = { id: generateId('vm'), os: args[1].toUpperCase(), status: 'running', cpu: 1, ram: 1024, storage: 10 };
            this.state.vms.push(vm);
            this.addActivityLog('VM', `Created VM: ${vm.os}`);
            return `VM created: ${vm.os}`;
        }
        return 'Unknown VM command.';
    }
    
    terminalEvidence() {
        if (this.state.evidence.length === 0) return 'No evidence found.';
        return this.state.evidence.map(ev => `${ev.title} [${ev.type}] — ${ev.reliability}`).join('\n');
    }
    
    terminalReport() {
        if (!this.state.forensics.currentCase) return 'No active case to report.';
        const report = {
            id: generateId('report'),
            title: this.state.forensics.currentCase.title,
            grade: 'A',
            date: Date.now()
        };
        this.state.forensics.reports.push(report);
        this.state.statistics.reportsCompleted++;
        this.checkMissionObjective('complete_report');
        return `Report generated: ${report.title} — Grade ${report.grade}`;
    }
    
    terminalPuzzle(args) {
        if (args.length === 0) return 'Usage: puzzle <type> (types: port_puzzle, hash_puzzle, log_analysis, packet_analysis, crypto, memory_forensics, file_analysis, network_topology)';
        const type = args[0];
        this.startMiniGame(type);
        return `Starting ${type}...`;
    }
    
    terminalNPC(args) {
        if (args.length === 0) return 'Usage: npc <name> (MAYA, RAVEN, NEX, WARDEN, GHOST)';
        const npcName = args[0].toUpperCase();
        const npc = this.state.relationships[npcName];
        if (!npc) return `NPC ${npcName} not found.`;
        // Показываем диалог
        const dialogue = npc.dialogues[0]; // первая реплика
        if (dialogue) {
            const responses = dialogue.responses.map((r, i) => 
                `<button class="npc-response btn-secondary" data-response="${i}" style="display:block; margin:5px 0; width:100%;">${r.text}</button>`
            ).join('');
            this.showModal(`${npc.name} (${npc.role})`, `<p>${dialogue.text}</p><div>${responses}</div>`, [
                { id: 'btn-close-npc', label: 'Close', class: 'btn-secondary', onClick: () => this.hideModal() }
            ]);
            document.querySelectorAll('.npc-response').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-response'));
                    const resp = dialogue.responses[idx];
                    if (resp.action) resp.action(this);
                    this.hideModal();
                });
            });
            return 'Opening dialogue...';
        }
        return 'No dialogues available.';
    }
    
    terminalDebug(args) {
        if (args.length === 0) return 'Usage: debug add-xp <amount> | add-money <amount> | reset-save';
        switch (args[0]) {
            case 'add-xp': {
                const xp = parseInt(args[1]) || 10;
                this.state.player.xp += xp;
                this.checkLevelUp();
                return `Added ${xp} XP.`;
            }
            case 'add-money': {
                const money = parseInt(args[1]) || 100;
                this.state.player.credits += money;
                return `Added ${money} credits.`;
            }
            case 'reset-save':
                this.state.reset();
                this.initializeWorld();
                this.saveGame(true);
                return 'Save reset.';
            default:
                return 'Unknown debug command.';
        }
    }
    
    update() {
        if (!this.isRunning) return;
        
        if (this.state.system.bootSequenceComplete) {
            this.state.player.playTime += 1;
            this.state.statistics.playTime += 1;
            if (this.state.player.heat > this.state.statistics.highestHeat) {
                this.state.statistics.highestHeat = this.state.player.heat;
            }
        }
        
        // Проверяем ежедневные контракты раз в минуту (приблизительно)
        if (this.state.system.bootSequenceComplete && Math.random() < 0.001) {
            this.refreshDailyContracts();
        }
        
        requestAnimationFrame(() => this.update());
    }
    
    start() {
        this.init();
        this.update();
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
const game = new Game();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => game.start());
} else {
    game.start();
}

window.BLACKNET = game;