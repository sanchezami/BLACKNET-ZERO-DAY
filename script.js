// =====================================================
// BLACKNET: ZERO DAY — Полный игровой движок с новым UI
// =====================================================

'use strict';

// ==================== КОНСТАНТЫ ====================
const GAME_VERSION = '3.0.0';
const SAVE_VERSION = 3;

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
    COMMON: '#9ca3af',
    UNCOMMON: '#10b981',
    RARE: '#06b6d4',
    EPIC: '#aa66ff',
    LEGENDARY: '#f59e0b'
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
            try { callback(payload); } catch (e) { console.error(e); }
        });
        onceCallbacks.forEach(callback => {
            try { callback(payload); } catch (e) { console.error(e); }
        });
        if (this.onceEvents[eventName]) delete this.onceEvents[eventName];
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
        this.volume = 0.2;
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
        const freqs = {
            click: 800,
            success: 1200,
            error: 200,
            notification: 900,
            mission: 1000,
            achievement: 1500,
            keypress: 500
        };
        const freq = freqs[type] || 800;
        const duration = 0.1;
        this.playTone(freq, duration);
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
            lastActive: null,
            tutorialComplete: false
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
            debugMode: false,
            reducedMotion: false,
            uiScale: 1
        };
        this.market = {
            items: [],
            priceHistory: {}
        };
        this.system = {
            bootSequenceComplete: false,
            tutorialComplete: false,
            currentScreen: 'dashboard',
            debugCommands: [],
            unlockedScreens: ['dashboard', 'terminal', 'missions'] // начальные экраны
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
        this.miniGame = null;
        this.tutorialStep = 0;
        this.helpVisible = false;
    }
    
    init() {
        if (this.initialized) return;
        console.log('BLACKNET: ZERO DAY — Initializing...');
        console.log(`Version: ${GAME_VERSION}`);
        
        this.initialized = true;
        this.isRunning = true;
        
        this.audio.init();
        this.audio.setEnabled(this.state.settings.sound);
        
        this.setupEventListeners();
        this.checkSaveAvailability();
        this.registerEventHandlers();
        this.applySettings();
        this.initializeWorld();
        this.checkUnlockedScreens();
        
        this.eventBus.emit('GAME_INITIALIZED', { game: this });
        console.log('Initialization complete.');
    }
    
    initializeWorld() {
        this.state.network.nodes = [
            { id: 'node_1', name: 'ROUTER-01', type: NODE_TYPES.ROUTER, risk: 'LOW', status: 'active', security: 10, x: 20, y: 20, description: 'Основной маршрутизатор' },
            { id: 'node_2', name: 'SERVER-02', type: NODE_TYPES.SERVER, risk: 'MEDIUM', status: 'active', security: 20, x: 50, y: 30, description: 'Корпоративный сервер' },
            { id: 'node_3', name: 'DB-03', type: NODE_TYPES.DATABASE, risk: 'HIGH', status: 'active', security: 30, x: 70, y: 60, description: 'База данных' },
            { id: 'node_4', name: 'WORKSTATION-04', type: NODE_TYPES.WORKSTATION, risk: 'LOW', status: 'active', security: 15, x: 30, y: 70, description: 'Рабочая станция' },
            { id: 'node_5', name: 'CLOUD-05', type: NODE_TYPES.CLOUD, risk: 'CRITICAL', status: 'active', security: 40, x: 60, y: 85, description: 'Облачное хранилище' },
            { id: 'node_6', name: 'FIREWALL-06', type: NODE_TYPES.FIREWALL, risk: 'MEDIUM', status: 'active', security: 25, x: 40, y: 10, description: 'Сетевой экран' },
            { id: 'node_7', name: 'SEC-07', type: NODE_TYPES.SECURITY_NODE, risk: 'HIGH', status: 'active', security: 35, x: 80, y: 40, description: 'Узел безопасности' }
        ];
        
        this.state.network.connections = [
            { from: 'node_6', to: 'node_1' },
            { from: 'node_1', to: 'node_2' },
            { from: 'node_2', to: 'node_3' },
            { from: 'node_2', to: 'node_4' },
            { from: 'node_3', to: 'node_5' },
            { from: 'node_2', to: 'node_7' },
            { from: 'node_7', to: 'node_5' }
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
                description: 'Система безопасности обнаружила неизвестное соединение. Найди источник.',
                difficulty: MISSION_DIFFICULTIES.EASY,
                reward: 250,
                xp: 50,
                risk: RISK_LEVELS.LOW,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Проверить сеть', type: 'scan_network', completed: false },
                    { id: 'obj_2', description: 'Исследовать ROUTER-01', type: 'inspect_node', target: 'node_1', completed: false },
                    { id: 'obj_3', description: 'Проанализировать логи', type: 'analyze_log', target: 'node_1', completed: false },
                    { id: 'obj_4', description: 'Подготовить отчёт', type: 'complete_report', completed: false }
                ],
                storyFlag: 'intro_complete',
                tutorial: true
            },
            {
                id: 'mission_2',
                title: 'GHOST IN THE NETWORK',
                description: 'Неизвестная активность на SERVER-02. Найди процесс и проследи его происхождение.',
                difficulty: MISSION_DIFFICULTIES.EASY,
                reward: 200,
                xp: 70,
                risk: RISK_LEVELS.MEDIUM,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Подключиться к SERVER-02', type: 'connect_node', target: 'node_2', completed: false },
                    { id: 'obj_2', description: 'Найти подозрительный процесс', type: 'solve_puzzle', puzzle: 'log_analysis', completed: false },
                    { id: 'obj_3', description: 'Проследить источник', type: 'trace_origin', completed: false }
                ],
                storyFlag: 'ghost_intro'
            },
            {
                id: 'mission_3',
                title: 'DEAD DROP',
                description: 'Найдено скрытое сообщение. Расшифруй его и найди данные.',
                difficulty: MISSION_DIFFICULTIES.MEDIUM,
                reward: 300,
                xp: 100,
                risk: RISK_LEVELS.MEDIUM,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Расшифровать сообщение', type: 'solve_puzzle', puzzle: 'crypto', completed: false },
                    { id: 'obj_2', description: 'Найти доказательство', type: 'find_evidence', completed: false }
                ],
                storyFlag: 'dead_drop'
            },
            {
                id: 'mission_4',
                title: 'BLACK SIGNAL',
                description: 'Зашифрованный сигнал из DB-03. Декодируй и сообщи.',
                difficulty: MISSION_DIFFICULTIES.MEDIUM,
                reward: 350,
                xp: 120,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Подключиться к DB-03', type: 'connect_node', target: 'node_3', completed: false },
                    { id: 'obj_2', description: 'Декодировать сигнал', type: 'solve_puzzle', puzzle: 'crypto', completed: false },
                    { id: 'obj_3', description: 'Доложить об угрозе', type: 'complete_report', completed: false }
                ],
                storyFlag: 'black_signal'
            },
            {
                id: 'mission_5',
                title: 'SILENT SERVER',
                description: 'Сервер WORKSTATION-04 замолчал. Выясни причину.',
                difficulty: MISSION_DIFFICULTIES.MEDIUM,
                reward: 400,
                xp: 150,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Исследовать WORKSTATION-04', type: 'inspect_node', target: 'node_4', completed: false },
                    { id: 'obj_2', description: 'Проанализировать журналы', type: 'analyze_log', target: 'node_4', completed: false },
                    { id: 'obj_3', description: 'Найти доказательство', type: 'find_evidence', completed: false }
                ],
                storyFlag: 'silent_server'
            },
            {
                id: 'mission_6',
                title: 'COLD STORAGE',
                description: 'Данные из холодного хранилища повреждены. Восстанови.',
                difficulty: MISSION_DIFFICULTIES.HARD,
                reward: 500,
                xp: 200,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Расшифровать резервную копию', type: 'solve_puzzle', puzzle: 'file_analysis', completed: false },
                    { id: 'obj_2', description: 'Восстановить данные', type: 'complete_report', completed: false }
                ],
                storyFlag: 'cold_storage'
            },
            {
                id: 'mission_7',
                title: 'RED LEDGER',
                description: 'Аномалии в финансовой базе на CLOUD-05. Проследи транзакции.',
                difficulty: MISSION_DIFFICULTIES.HARD,
                reward: 600,
                xp: 250,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Подключиться к CLOUD-05', type: 'connect_node', target: 'node_5', completed: false },
                    { id: 'obj_2', description: 'Проанализировать транзакции', type: 'analyze_log', target: 'node_5', completed: false },
                    { id: 'obj_3', description: 'Проследить средства', type: 'trace_origin', completed: false }
                ],
                storyFlag: 'red_ledger'
            },
            {
                id: 'mission_8',
                title: 'ZERO DAY',
                description: 'Используется zero-day эксплойт. Найди уязвимость и устрани.',
                difficulty: MISSION_DIFFICULTIES.EXPERT,
                reward: 1000,
                xp: 500,
                risk: RISK_LEVELS.CRITICAL,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Проанализировать сигнатуру', type: 'solve_puzzle', puzzle: 'memory_forensics', completed: false },
                    { id: 'obj_2', description: 'Найти уязвимость', type: 'find_evidence', completed: false },
                    { id: 'obj_3', description: 'Написать отчёт', type: 'complete_report', completed: false }
                ],
                storyFlag: 'zero_day'
            },
            {
                id: 'mission_9',
                title: 'PHANTOM PROCESS',
                description: 'Процесс-призрак на нескольких узлах. Найди и уничтожь.',
                difficulty: MISSION_DIFFICULTIES.HARD,
                reward: 700,
                xp: 300,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Сканировать сеть', type: 'scan_network', completed: false },
                    { id: 'obj_2', description: 'Найти процесс-призрак', type: 'solve_puzzle', puzzle: 'memory_forensics', completed: false },
                    { id: 'obj_3', description: 'Уничтожить процесс', type: 'trace_origin', completed: false }
                ],
                storyFlag: 'phantom'
            },
            {
                id: 'mission_10',
                title: 'NIGHT SHIFT',
                description: 'Ночная активность. Кто-то получает доступ к сети.',
                difficulty: MISSION_DIFFICULTIES.MEDIUM,
                reward: 450,
                xp: 180,
                risk: RISK_LEVELS.MEDIUM,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Проанализировать журналы доступа', type: 'analyze_log', target: 'node_1', completed: false },
                    { id: 'obj_2', description: 'Проследить подозрительный IP', type: 'trace_origin', completed: false },
                    { id: 'obj_3', description: 'Подготовить отчёт', type: 'complete_report', completed: false }
                ],
                storyFlag: 'night_shift'
            },
            {
                id: 'mission_11',
                title: 'FALSE POSITIVE',
                description: 'Сработала тревога, возможно ложная. Проверь.',
                difficulty: MISSION_DIFFICULTIES.EASY,
                reward: 250,
                xp: 80,
                risk: RISK_LEVELS.LOW,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Исследовать FIREWALL-06', type: 'inspect_node', target: 'node_6', completed: false },
                    { id: 'obj_2', description: 'Проанализировать логи', type: 'analyze_log', target: 'node_6', completed: false },
                    { id: 'obj_3', description: 'Написать отчёт', type: 'complete_report', completed: false }
                ],
                storyFlag: 'false_positive'
            },
            {
                id: 'mission_12',
                title: 'BROKEN CHAIN',
                description: 'Блокчейн транзакция сломана. Найди недействительный блок.',
                difficulty: MISSION_DIFFICULTIES.HARD,
                reward: 800,
                xp: 350,
                risk: RISK_LEVELS.HIGH,
                status: 'available',
                objectives: [
                    { id: 'obj_1', description: 'Проанализировать данные блока', type: 'solve_puzzle', puzzle: 'file_analysis', completed: false },
                    { id: 'obj_2', description: 'Найти недействительный блок', type: 'find_evidence', completed: false },
                    { id: 'obj_3', description: 'Сообщить', type: 'complete_report', completed: false }
                ],
                storyFlag: 'broken_chain'
            }
        ];
        
        this.state.missions.available.push(...missions);
    }
    
    initializeMarket() {
        const items = [
            { id: 'cpu_mid', name: 'Mid CPU', category: 'hardware', price: 300, description: 'Улучшенный процессор для анализа', effect: { type: 'cpu', performance: 20 }, rarity: RARITIES.COMMON },
            { id: 'ram_mid', name: 'Mid RAM', category: 'hardware', price: 200, description: 'Больше памяти для параллельных задач', effect: { type: 'ram', performance: 20 }, rarity: RARITIES.COMMON },
            { id: 'ssd_mid', name: 'Mid SSD', category: 'hardware', price: 250, description: 'Быстрое хранилище', effect: { type: 'ssd', performance: 20 }, rarity: RARITIES.COMMON },
            { id: 'tool_scanner', name: 'Advanced Scanner', category: 'tools', price: 400, description: 'Лучшее сканирование сети', effect: { type: 'tool' }, rarity: RARITIES.UNCOMMON },
            { id: 'software_firewall', name: 'Firewall Bypass', category: 'software', price: 500, description: 'Обход брандмауэров', effect: { type: 'software' }, rarity: RARITIES.UNCOMMON },
            { id: 'intel_report', name: 'Intel Report', category: 'intel', price: 150, description: 'Полезная информация', effect: { type: 'intel' }, rarity: RARITIES.COMMON },
            { id: 'gpu_mid', name: 'Mid GPU', category: 'hardware', price: 350, description: 'Для визуализации', effect: { type: 'gpu', performance: 20 }, rarity: RARITIES.COMMON },
            { id: 'sec_mid', name: 'Security Upgrade', category: 'hardware', price: 450, description: 'Улучшенный модуль безопасности', effect: { type: 'security', performance: 20 }, rarity: RARITIES.UNCOMMON }
        ];
        this.state.market.items = items;
        items.forEach(item => {
            this.state.market.priceHistory[item.id] = [item.price];
        });
    }
    
    initializeNPCs() {
        const dialogues = {
            MAYA: [
                { text: "Привет, оператор. Я MAYA. Могу дать контракты.", responses: [
                    { text: "Что за контракты?", action: (game) => { game.addNotification('MAYA: Корпоративный шпионаж и извлечение данных.', 'info'); } },
                    { text: "Кто ты?", action: (game) => { game.addNotification('MAYA: Я посредник.', 'info'); } },
                    { text: "Пока.", action: null }
                ]},
                { text: "Тебе нужно лучше оборудование.", responses: [
                    { text: "Где купить?", action: (game) => { game.navigateToScreen('market'); } },
                    { text: "Дай скидку.", action: (game) => { game.addNotification('MAYA: Докажи себя сначала.', 'info'); } }
                ]}
            ],
            RAVEN: [
                { text: "Я Raven. Тёмная сеть моя стихия.", responses: [
                    { text: "Что знаешь о GHOST?", action: (game) => { game.addNotification('RAVEN: Легенда, никто не знает.', 'info'); } },
                    { text: "Пока.", action: null }
                ]}
            ],
            NEX: [
                { text: "Я NEX, брокер информации.", responses: [
                    { text: "Купить информацию.", action: (game) => { game.addNotification('NEX: Приходи с кредитами.', 'info'); } },
                    { text: "Продать информацию.", action: (game) => { game.addNotification('NEX: Принеси доказательства.', 'info'); } }
                ]}
            ],
            WARDEN: [
                { text: "Я WARDEN. Безопасность.", responses: [
                    { text: "Нужна помощь.", action: (game) => { game.addNotification('WARDEN: Детали?', 'info'); } },
                    { text: "Пока.", action: null }
                ]}
            ],
            GHOST: [
                { text: "...", responses: [
                    { text: "Кто ты?", action: (game) => { game.addNotification('GHOST: ...', 'info'); } },
                    { text: "Я нашёл твой след.", action: (game) => { game.addNotification('GHOST: Ты близко.', 'info'); } }
                ]}
            ]
        };
        
        this.state.relationships = {};
        for (const [name, data] of Object.entries({
            MAYA: { role: 'Fixer', trust: 20 },
            RAVEN: { role: 'Hacker', trust: 10 },
            NEX: { role: 'Broker', trust: 15 },
            WARDEN: { role: 'Security', trust: 5 },
            GHOST: { role: 'Mysterious', trust: 0 }
        })) {
            this.state.relationships[name] = { name, ...data, dialogues: dialogues[name] || [] };
        }
    }
    
    initializeAchievements() {
        const achievements = [
            { id: 'ach_first_login', name: 'FIRST LOGIN', description: 'Запустить игру', condition: () => true, unlocked: false },
            { id: 'ach_first_contract', name: 'FIRST CONTRACT', description: 'Завершить первую миссию', condition: () => this.state.statistics.successfulMissions >= 1, unlocked: false },
            { id: 'ach_network_architect', name: 'NETWORK ARCHITECT', description: 'Исследовать 10 узлов', condition: () => this.state.statistics.networkNodesAnalyzed >= 10, unlocked: false },
            { id: 'ach_digital_detective', name: 'DIGITAL DETECTIVE', description: 'Найти 20 доказательств', condition: () => this.state.statistics.evidenceFound >= 20, unlocked: false },
            { id: 'ach_master_analyst', name: 'MASTER ANALYST', description: 'Завершить 5 отчётов', condition: () => this.state.statistics.reportsCompleted >= 5, unlocked: false },
            { id: 'ach_ghost_protocol', name: 'GHOST PROTOCOL', description: 'Достичь доверия 50 с GHOST', condition: () => this.state.relationships.GHOST && this.state.relationships.GHOST.trust >= 50, unlocked: false },
            { id: 'ach_no_trace', name: 'NO TRACE', description: 'Завершить миссию с низким Heat', condition: () => this.state.player.heat < 20 && this.state.statistics.successfulMissions >= 1, unlocked: false },
            { id: 'ach_zero_day', name: 'ZERO DAY', description: 'Раскрыть флаг zero_day', condition: () => this.state.story.flags.zero_day, unlocked: false },
            { id: 'ach_perfect_report', name: 'PERFECT REPORT', description: 'Получить оценку S за отчёт', condition: () => this.state.forensics.reports.some(r => r.grade === 'S'), unlocked: false },
            { id: 'ach_night_owl', name: 'NIGHT OWL', description: 'Сыграть 1 час', condition: () => this.state.statistics.playTime >= 3600, unlocked: false },
            { id: 'ach_puzzle_master', name: 'PUZZLE MASTER', description: 'Решить 10 головоломок', condition: () => this.state.statistics.puzzlesSolved >= 10, unlocked: false },
            { id: 'ach_rich', name: 'RICH', description: 'Заработать 10000 кредитов', condition: () => this.state.statistics.moneyEarned >= 10000, unlocked: false }
        ];
        
        achievements.forEach(ach => this.state.achievements[ach.id] = ach);
    }
    
    refreshDailyContracts() {
        const now = Date.now();
        if (this.state.missions.lastDailyRefresh && (now - this.state.missions.lastDailyRefresh) < 24*60*60*1000) return;
        this.state.missions.lastDailyRefresh = now;
        this.state.missions.dailyContracts = this.generateDailyContracts();
        this.addNotification('Новые ежедневные контракты!', 'system');
    }
    
    generateDailyContracts() {
        const templates = [
            { title: 'Network Anomaly', desc: 'Найти аномалию в узле', difficulty: 'EASY', reward: 100, xp: 30, risk: 'LOW' },
            { title: 'Log Analysis', desc: 'Проанализировать журналы', difficulty: 'EASY', reward: 120, xp: 40, risk: 'LOW' },
            { title: 'Packet Trace', desc: 'Отследить подозрительные пакеты', difficulty: 'MEDIUM', reward: 200, xp: 60, risk: 'MEDIUM' },
            { title: 'Malware Scan', desc: 'Сканировать на вирусы', difficulty: 'MEDIUM', reward: 250, xp: 80, risk: 'MEDIUM' },
            { title: 'Cryptography', desc: 'Расшифровать файл', difficulty: 'HARD', reward: 400, xp: 120, risk: 'HIGH' },
            { title: 'Forensics', desc: 'Изучить цифровые улики', difficulty: 'HARD', reward: 450, xp: 150, risk: 'HIGH' }
        ];
        
        return Array.from({length: 3}, () => {
            const t = templates[Math.floor(Math.random() * templates.length)];
            return {
                id: generateId('contract'),
                title: `${t.title} (Daily)`,
                description: t.desc,
                difficulty: t.difficulty,
                reward: t.reward + Math.floor(Math.random() * 50),
                xp: t.xp,
                risk: t.risk,
                status: 'available',
                objectives: [
                    { id: generateId('obj'), description: 'Выполнить задачу', type: 'solve_puzzle', puzzle: this.getRandomPuzzleType(), completed: false },
                    { id: generateId('obj'), description: 'Отчитаться', type: 'complete_report', completed: false }
                ]
            };
        });
    }
    
    getRandomPuzzleType() {
        return ['port_puzzle','hash_puzzle','log_analysis','packet_analysis','crypto','memory_forensics','file_analysis','network_topology'][Math.floor(Math.random()*8)];
    }
    
    checkUnlockedScreens() {
        const unlocked = this.state.system.unlockedScreens;
        // Разблокировка по мере прогресса сюжета
        if (this.state.story.flags.intro_complete && !unlocked.includes('network')) unlocked.push('network');
        if (this.state.story.flags.ghost_intro && !unlocked.includes('forensics')) unlocked.push('forensics');
        if (this.state.story.flags.dead_drop && !unlocked.includes('intelligence')) unlocked.push('intelligence');
        if (this.state.story.flags.black_signal && !unlocked.includes('market')) unlocked.push('market');
        if (this.state.story.flags.cold_storage && !unlocked.includes('skills')) unlocked.push('skills');
        // Остальные по мере завершения
        if (this.state.statistics.successfulMissions >= 2) {
            for (const s of ['evidence','profile','inventory','statistics','contacts','achievements','settings']) {
                if (!unlocked.includes(s)) unlocked.push(s);
            }
        }
    }
    
    setupEventListeners() {
        document.getElementById('btn-new-game')?.addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-continue')?.addEventListener('click', () => this.continueGame());
        document.getElementById('btn-settings')?.addEventListener('click', () => this.showSettingsModal());
        
        document.querySelectorAll('[data-screen]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = el.getAttribute('data-screen');
                if (screen && screen !== 'menu') this.navigateToScreen(screen);
            });
        });
        
        document.getElementById('mobile-more')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showMobileMenu();
        });
        
        document.getElementById('btn-help')?.addEventListener('click', () => this.toggleHelp());
        
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
        this.eventBus.on('SCREEN_CHANGED', payload => this.renderScreen(payload.screen));
        this.eventBus.on('ACTIVITY_LOG_UPDATED', () => {
            if (this.state.system.currentScreen === 'dashboard') this.renderDashboard();
        });
        this.eventBus.on('EVENT_MISSION_COMPLETE', payload => {
            this.audio.play('mission');
            this.addNotification(`Миссия завершена: ${payload.mission.title}\n+${payload.mission.reward} кредитов, +${payload.mission.xp} XP`, 'mission');
            this.checkUnlockedScreens();
            this.updateNavigation();
        });
        this.eventBus.on('EVENT_LEVEL_UP', payload => {
            this.audio.play('success');
            this.addNotification(`Уровень повышен! Теперь ${payload.level}`, 'success');
        });
        this.eventBus.on('EVENT_ITEM_PURCHASE', payload => {
            this.audio.play('success');
            this.addNotification(`Куплено: ${payload.item.name}`, 'success');
        });
        this.eventBus.on('EVENT_ITEM_SOLD', payload => {
            this.audio.play('click');
            this.addNotification(`Продано: ${payload.item.name}`, 'info');
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
        this.state.reset();
        this.initializeWorld();
        this.applySettings();
        this.showBootSequence();
    }
    
    continueGame() {
        const saveData = this.loadGame();
        if (saveData) {
            this.state.fromJSON(saveData);
            this.applySettings();
            this.showBootSequence(true);
        }
    }
    
    showBootSequence(isContinue = false) {
        document.getElementById('start-screen')?.classList.remove('active');
        const bootScreen = document.getElementById('boot-screen');
        bootScreen?.classList.add('active');
        const bootLog = document.getElementById('boot-log');
        const btnEnter = document.getElementById('btn-enter-dashboard');
        if (bootLog) bootLog.innerHTML = '';
        if (btnEnter) btnEnter.classList.add('hidden');
        
        const lines = [
            '[OK] Загрузка ядра',
            '[OK] Инициализация криптографического движка',
            '[OK] Монтирование зашифрованного хранилища',
            '[OK] Загрузка threat intelligence',
            '[OK] Проверка целостности системы',
            '[OK] Инициализация сетевого симулятора',
            '[OK] Загрузка базы миссий',
            '[OK] Подключение к BLACKNET',
            '[OK] Пользователь аутентифицирован'
        ];
        
        let i = 0;
        const showNext = () => {
            if (i < lines.length) {
                const div = document.createElement('div');
                div.className = 'boot-line';
                div.textContent = lines[i++];
                bootLog.appendChild(div);
                setTimeout(showNext, 200 + Math.random()*150);
            } else {
                btnEnter?.classList.remove('hidden');
                btnEnter?.addEventListener('click', () => this.enterDashboard(), { once: true });
            }
        };
        setTimeout(showNext, 300);
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
        this.checkUnlockedScreens();
        this.updateNavigation();
        
        // Если это новая игра и обучение не завершено, запускаем туториал
        if (!this.state.player.tutorialComplete && !this.state.system.isContinue) {
            this.startTutorial();
        }
        this.audio.play('notification');
    }
    
    navigateToScreen(screenName) {
        const valid = ['dashboard','terminal','missions','network','forensics','intelligence','evidence','profile','skills','inventory','statistics','contacts','market','achievements','settings'];
        if (!valid.includes(screenName)) return;
        
        // Проверяем разблокирован ли экран
        if (!this.state.system.unlockedScreens.includes(screenName) && screenName !== 'settings') {
            this.addNotification('Этот раздел ещё не открыт. Продолжай расследование.', 'warning');
            return;
        }
        
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
    
    updateNavigation() {
        // Обновляем меню в соответствии с разблокированными экранами
        const unlocked = this.state.system.unlockedScreens;
        document.querySelectorAll('#main-nav a').forEach(a => {
            const screen = a.getAttribute('data-screen');
            if (screen && !unlocked.includes(screen) && screen !== 'settings') {
                a.style.opacity = '0.4';
                a.style.pointerEvents = 'none';
            } else {
                a.style.opacity = '1';
                a.style.pointerEvents = 'auto';
            }
        });
    }
    
    saveGame(showNotification = false) {
        try {
            this.state.lastSavedAt = Date.now();
            localStorage.setItem('blacknet_save', JSON.stringify(this.state.toJSON()));
            if (showNotification) this.addNotification('Сохранено ✓', 'success');
            this.eventBus.emit('GAME_SAVED', { timestamp: this.state.lastSavedAt });
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            this.addNotification('Ошибка сохранения', 'error');
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
        document.documentElement.style.fontSize = (16 * this.state.settings.uiScale) + 'px';
    }
    
    // ==================== ОБУЧЕНИЕ ====================
    startTutorial() {
        this.tutorialStep = 0;
        this.showTutorialStep();
    }
    
    showTutorialStep() {
        const overlay = document.getElementById('tutorial-overlay');
        if (!overlay) return;
        
        const steps = [
            {
                title: 'Добро пожаловать',
                text: 'Ты начинающий аналитик цифровых расследований. Твоя задача — находить следы атак.',
                button: 'ДАЛЕЕ'
            },
            {
                title: 'Терминал',
                text: 'Это твой рабочий терминал. Не переживай, тебе не нужно знать настоящие команды.',
                button: 'ПОНЯТНО',
                action: () => this.navigateToScreen('terminal')
            },
            {
                title: 'Команда help',
                text: 'Введи команду help, чтобы увидеть доступные действия.',
                button: 'ВЫПОЛНИТЬ HELP',
                action: () => {
                    this.navigateToScreen('terminal');
                    this.executeTerminalCommand('help');
                }
            },
            {
                title: 'Сеть',
                text: 'Ты можешь исследовать виртуальные компьютеры внутри игры. Это НЕ настоящий интернет.',
                button: 'ОТКРЫТЬ СЕТЬ',
                action: () => this.navigateToScreen('network')
            },
            {
                title: 'Первая миссия',
                text: 'Твоё первое расследование: найди подозрительное устройство в сети.',
                button: 'К МИССИИ',
                action: () => {
                    this.navigateToScreen('missions');
                    // Подсветить первую миссию
                    const card = document.querySelector('.mission-card');
                    if (card) card.style.border = '2px solid var(--cyan)';
                }
            },
            {
                title: 'Готово!',
                text: 'Теперь ты знаешь основы. Удачи в расследованиях!',
                button: 'ЗАВЕРШИТЬ',
                action: () => {
                    this.state.player.tutorialComplete = true;
                    this.saveGame();
                }
            }
        ];
        
        const step = steps[this.tutorialStep];
        if (!step) {
            overlay.classList.add('hidden');
            return;
        }
        
        overlay.innerHTML = `
            <div class="tutorial-content">
                <h3>${step.title}</h3>
                <p>${step.text}</p>
            </div>
            <button class="btn btn-primary" id="tutorial-next">${step.button}</button>
        `;
        overlay.classList.remove('hidden');
        
        document.getElementById('tutorial-next').addEventListener('click', () => {
            if (step.action) step.action();
            this.tutorialStep++;
            if (this.tutorialStep >= steps.length) {
                overlay.classList.add('hidden');
                this.state.player.tutorialComplete = true;
                this.saveGame();
            } else {
                this.showTutorialStep();
            }
        });
    }
    
    // ==================== СПРАВКА ====================
    toggleHelp() {
        const panel = document.getElementById('help-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) this.renderHelp();
        }
    }
    
    renderHelp() {
        const panel = document.getElementById('help-panel');
        if (!panel) return;
        
        const categories = {
            'Основы': {
                'Игровой мир': 'BLACKNET — это виртуальная среда для расследования цифровых инцидентов.',
                'Кредиты': 'Игровая валюта. Зарабатываются за выполнение миссий.',
                'XP': 'Опыт. Повышает уровень и даёт очки навыков.'
            },
            'Терминал': {
                'help': 'Показывает список команд.',
                'scan': 'Сканирует сеть или узел.',
                'inspect': 'Исследует узел, получает информацию.',
                'analyze': 'Анализирует объект, например логи.',
                'logs': 'Показывает журнал действий.'
            },
            'Сеть': {
                'Узел': 'Виртуальное устройство в игровой сети.',
                'Подключение': 'Соединение между узлами.',
                'Анализ узла': 'Действие, позволяющее получить информацию о узле.'
            },
            'Расследования': {
                'Улика': 'Цифровое доказательство, найденное в игре.',
                'Отчёт': 'Итоговый документ, который ты составляешь после расследования.',
                'Timeline': 'Хронология событий.'
            },
            'Прочее': {
                'Heat': 'Насколько активно системы реагируют на твои действия.',
                'Suspicion': 'Насколько NPC подозревают тебя.',
                'Репутация': 'Твоя известность среди разных групп.'
            }
        };
        
        let html = '<h3>Справка</h3>';
        for (const [cat, items] of Object.entries(categories)) {
            html += `<div class="help-category"><h4>${cat}</h4>`;
            for (const [term, desc] of Object.entries(items)) {
                html += `<div class="help-item"><span class="term">${term}</span>: ${desc}</div>`;
            }
            html += '</div>';
        }
        panel.innerHTML = html + '<button class="btn btn-secondary" id="btn-close-help">Закрыть</button>';
        document.getElementById('btn-close-help')?.addEventListener('click', () => this.toggleHelp());
    }
    
    // ==================== РЕНДЕРИНГ ЭКРАНОВ ====================
    renderScreen(screenName) {
        switch(screenName) {
            case 'dashboard': this.renderDashboard(); break;
            case 'terminal': this.renderTerminal(); break;
            case 'missions': this.renderMissions('available'); break;
            case 'network': this.renderNetwork(); break;
            case 'forensics': this.renderForensics(); break;
            case 'intelligence': this.renderIntelligence(); break;
            case 'evidence': this.renderEvidence(); break;
            case 'profile': this.renderProfile(); break;
            case 'skills': this.renderSkills(); break;
            case 'inventory': this.renderInventory(); break;
            case 'statistics': this.renderStatistics(); break;
            case 'contacts': this.renderContacts(); break;
            case 'market': this.renderMarket('hardware'); break;
            case 'achievements': this.renderAchievements(); break;
            case 'settings': this.renderSettings(); break;
        }
    }
    
    renderDashboard() {
        const p = this.state.player;
        const activeMission = this.state.missions.active[0];
        
        let html = `
            <h2 class="screen-title">ОПЕРАЦИОННЫЙ ЦЕНТР</h2>
            <div class="dashboard-grid">
                <div class="panel">
                    <h3>ИГРОК</h3>
                    <div class="stat-row"><span class="stat-label">Уровень</span><span class="stat-value">${p.level}</span></div>
                    <div class="stat-row"><span class="stat-label">XP</span><span class="stat-value">${p.xp} / ${p.xpToNext}</span></div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${(p.xp/p.xpToNext)*100}%"></div></div>
                    <div class="stat-row"><span class="stat-label">Кредиты</span><span class="stat-value">${formatNumber(p.credits)}</span></div>
                    <div class="stat-row"><span class="stat-label">Heat</span><span class="stat-value">${p.heat}</span></div>
                </div>
                <div class="panel">
                    <h3>ТЕКУЩАЯ МИССИЯ</h3>
                    ${activeMission ? `
                        <h4>${activeMission.title}</h4>
                        <p>${activeMission.description}</p>
                        <div class="progress-bar"><div class="progress-fill" style="width:${this.getMissionProgress(activeMission)}%"></div></div>
                        <p>Прогресс: ${this.getCompletedObjectives(activeMission)} / ${activeMission.objectives.length}</p>
                        <button class="btn btn-primary" onclick="BLACKNET.navigateToScreen('missions')">ПРОДОЛЖИТЬ</button>
                    ` : '<p>Нет активной миссии.</p>'}
                </div>
                <div class="panel">
                    <h3>СЛЕДУЮЩИЙ ШАГ</h3>
                    <div id="next-step">${this.getNextStep()}</div>
                </div>
                <div class="panel">
                    <h3>СОСТОЯНИЕ СЕТИ</h3>
                    <div class="stat-row"><span class="stat-label">Узлов</span><span class="stat-value">${this.state.network.nodes.length}</span></div>
                    <div class="stat-row"><span class="stat-label">Исследовано</span><span class="stat-value">${this.state.network.analyzedNodes.length}</span></div>
                </div>
                <div class="panel">
                    <h3>АКТИВНОСТЬ</h3>
                    <div class="activity-log">${this.renderActivityLog(5)}</div>
                </div>
            </div>
        `;
        document.getElementById('screen-dashboard').innerHTML = html;
    }
    
    getMissionProgress(mission) {
        if (!mission) return 0;
        const completed = mission.objectives.filter(o => o.completed).length;
        return (completed / mission.objectives.length) * 100;
    }
    
    getCompletedObjectives(mission) {
        return mission ? mission.objectives.filter(o => o.completed).length : 0;
    }
    
    getNextStep() {
        const activeMission = this.state.missions.active[0];
        if (activeMission) {
            const nextObj = activeMission.objectives.find(o => !o.completed);
            if (nextObj) {
                return `<p>${nextObj.description}</p><button class="btn btn-secondary" onclick="BLACKNET.focusObjective('${nextObj.id}')">ПЕРЕЙТИ</button>`;
            } else {
                return '<p>Все цели выполнены! Подготовь отчёт.</p>';
            }
        }
        return '<p>Прими миссию в разделе Миссии.</p>';
    }
    
    focusObjective(objectiveId) {
        // Определяем тип цели и ведём игрока к нужному экрану
        const mission = this.state.missions.active[0];
        if (!mission) return;
        const obj = mission.objectives.find(o => o.id === objectiveId);
        if (!obj) return;
        switch (obj.type) {
            case 'scan_network': this.navigateToScreen('network'); break;
            case 'inspect_node': this.navigateToScreen('network'); break;
            case 'connect_node': this.navigateToScreen('network'); break;
            case 'analyze_log': this.navigateToScreen('forensics'); break;
            case 'solve_puzzle': this.startMiniGame(obj.puzzle); break;
            case 'find_evidence': this.navigateToScreen('evidence'); break;
            case 'complete_report': this.navigateToScreen('forensics'); break;
            case 'trace_origin': this.navigateToScreen('network'); break;
        }
    }
    
    renderActivityLog(count = 10) {
        const logs = this.state.activityLog.slice(-count).reverse();
        return logs.map(log => `<div>[${formatTime(log.timestamp)}] ${log.message}</div>`).join('');
    }
    
    renderTerminal() {
        const output = document.getElementById('terminal-output');
        if (output && !output.dataset.initialized) {
            output.innerHTML = 'Добро пожаловать в BLACKNET TERMINAL.\nВведи "help" для списка команд.\n';
            output.dataset.initialized = 'true';
        }
        // Добавляем кнопки быстрых команд
        const container = document.getElementById('screen-terminal');
        if (container && !container.querySelector('.terminal-buttons')) {
            const btnPanel = document.createElement('div');
            btnPanel.className = 'terminal-buttons';
            btnPanel.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;';
            ['help','scan network','nodes','status','missions','inventory','logs'].forEach(cmd => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary';
                btn.textContent = cmd.toUpperCase();
                btn.onclick = () => this.executeTerminalCommand(cmd);
                btnPanel.appendChild(btn);
            });
            container.insertBefore(btnPanel, container.querySelector('.terminal-window'));
        }
    }
    
    renderMissions(tab = 'available') {
        const container = document.getElementById('screen-missions');
        if (!container) return;
        
        let list = [];
        if (tab === 'available') {
            list = [...this.state.missions.available, ...this.state.missions.dailyContracts];
        } else {
            list = this.state.missions[tab] || [];
        }
        
        let html = `
            <h2 class="screen-title">МИССИИ</h2>
            <div class="missions-tabs">
                <button class="tab-btn ${tab==='available'?'active':''}" data-tab="available">Доступные</button>
                <button class="tab-btn ${tab==='active'?'active':''}" data-tab="active">Активные</button>
                <button class="tab-btn ${tab==='completed'?'active':''}" data-tab="completed">Завершённые</button>
                <button class="tab-btn ${tab==='failed'?'active':''}" data-tab="failed">Проваленные</button>
            </div>
            <div class="missions-container">
        `;
        
        if (list.length === 0) {
            html += '<p>Нет миссий в этой категории.</p>';
        } else {
            list.forEach(mission => {
                const progress = mission.objectives ? Math.round((mission.objectives.filter(o=>o.completed).length / mission.objectives.length)*100) : 0;
                html += `
                    <div class="mission-card" data-id="${mission.id}">
                        <h4>${mission.title}</h4>
                        <div class="mission-desc">${mission.description}</div>
                        <div class="mission-meta">
                            <span>Сложность: ${mission.difficulty}</span>
                            <span>Награда: ${mission.reward} Cr</span>
                            <span>Риск: ${mission.risk}</span>
                        </div>
                        ${tab === 'active' ? `<div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div><small>${mission.objectives.filter(o=>o.completed).length}/${mission.objectives.length} целей</small>` : ''}
                        ${tab === 'available' ? `<button class="btn btn-primary accept-mission-btn" data-id="${mission.id}">НАЧАТЬ</button>` : ''}
                    </div>
                `;
            });
        }
        html += '</div>';
        container.innerHTML = html;
        
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => this.renderMissions(btn.dataset.tab);
        });
        container.querySelectorAll('.accept-mission-btn').forEach(btn => {
            btn.onclick = () => this.acceptMission(btn.dataset.id);
        });
        container.querySelectorAll('.mission-card:not(:has(button))').forEach(card => {
            card.onclick = () => this.showMissionDetails(card.dataset.id);
        });
    }
    
    showMissionDetails(missionId) {
        const all = [...this.state.missions.available, ...this.state.missions.active, ...this.state.missions.completed, ...this.state.missions.failed, ...this.state.missions.dailyContracts];
        const mission = all.find(m => m.id === missionId);
        if (!mission) return;
        
        let html = `
            <h2>${mission.title}</h2>
            <p>${mission.description}</p>
            <p><strong>Сложность:</strong> ${mission.difficulty}</p>
            <p><strong>Награда:</strong> ${mission.reward} Cr, ${mission.xp} XP</p>
            <p><strong>Риск:</strong> ${mission.risk}</p>
            <h4>Цели:</h4>
            <ul>
        `;
        mission.objectives.forEach(o => {
            html += `<li>${o.completed ? '✅' : '⬜'} ${o.description}</li>`;
        });
        html += '</ul>';
        if (this.state.missions.available.includes(mission) || this.state.missions.dailyContracts.includes(mission)) {
            html += `<button class="btn btn-primary" onclick="BLACKNET.acceptMission('${mission.id}')">ПРИНЯТЬ МИССИЮ</button>`;
        }
        html += `<button class="btn btn-secondary" onclick="BLACKNET.hideModal()">ЗАКРЫТЬ</button>`;
        this.showModal('Детали миссии', html, []);
    }
    
    acceptMission(missionId) {
        let mission = this.state.missions.available.find(m => m.id === missionId);
        if (!mission) mission = this.state.missions.dailyContracts.find(m => m.id === missionId);
        if (!mission) return;
        
        this.state.missions.available = this.state.missions.available.filter(m => m.id !== missionId);
        this.state.missions.dailyContracts = this.state.missions.dailyContracts.filter(m => m.id !== missionId);
        mission.status = 'active';
        this.state.missions.active.push(mission);
        this.currentMission = mission;
        this.state.statistics.totalMissions++;
        this.addActivityLog('MISSION', `Миссия начата: ${mission.title}`);
        this.addNotification(`Миссия принята: ${mission.title}`, 'mission');
        this.saveGame();
        this.renderMissions('active');
        this.renderDashboard();
    }
    
    renderNetwork() {
        const container = document.getElementById('screen-network');
        if (!container) return;
        
        let html = `
            <h2 class="screen-title">СЕТЕВАЯ КАРТА</h2>
            <div class="network-map" id="network-map">
        `;
        // Рисуем линии
        this.state.network.connections.forEach(conn => {
            const from = this.state.network.nodes.find(n => n.id === conn.from);
            const to = this.state.network.nodes.find(n => n.id === conn.to);
            if (from && to) {
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const length = Math.sqrt(dx*dx + dy*dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                html += `<div class="network-line" style="left:${from.x}%; top:${from.y}%; width:${length}%; transform: rotate(${angle}deg);"></div>`;
            }
        });
        // Узлы
        this.state.network.nodes.forEach(node => {
            const analyzed = this.state.network.analyzedNodes.includes(node.id);
            html += `<div class="network-node ${analyzed?'analyzed':''}" style="left:${node.x}%; top:${node.y}%;" data-id="${node.id}">${node.name}</div>`;
        });
        html += '</div>';
        html += `<div class="network-info"><p>Выберите узел для исследования.</p></div>`;
        container.innerHTML = html;
        
        container.querySelectorAll('.network-node').forEach(el => {
            el.onclick = () => this.showNodeInfo(el.dataset.id);
        });
    }
    
    showNodeInfo(nodeId) {
        const node = this.state.network.nodes.find(n => n.id === nodeId);
        if (!node) return;
        const info = document.querySelector('.network-info');
        if (info) {
            info.innerHTML = `
                <h3>${node.name}</h3>
                <p>${node.description || 'Нет описания'}</p>
                <p>Тип: ${node.type}</p>
                <p>Безопасность: ${node.security}</p>
                <p>Риск: ${node.risk}</p>
                <p>Статус: ${node.status}</p>
                <button class="btn btn-primary" onclick="BLACKNET.inspectNode('${node.id}')">ИССЛЕДОВАТЬ</button>
                <button class="btn btn-secondary" onclick="BLACKNET.terminalConnect(['${node.id}'])">ПОДКЛЮЧИТЬСЯ</button>
            `;
        }
    }
    
    inspectNode(nodeId) {
        const node = this.state.network.nodes.find(n => n.id === nodeId);
        if (!node) return;
        if (!this.state.network.analyzedNodes.includes(nodeId)) {
            this.state.network.analyzedNodes.push(nodeId);
            this.state.statistics.networkNodesAnalyzed++;
            this.addActivityLog('NETWORK', `Исследован ${node.name}`);
            this.addNotification(`Узел ${node.name} исследован`, 'success');
            this.checkMissionObjective('inspect_node', nodeId);
        }
        this.renderNetwork();
    }
    
    renderForensics() {
        const container = document.getElementById('screen-forensics');
        if (!container) return;
        const fc = this.state.forensics;
        let html = `
            <h2 class="screen-title">ЦИФРОВАЯ КРИМИНАЛИСТИКА</h2>
            <div class="forensics-case">
                ${fc.currentCase ? `<h3>${fc.currentCase.title}</h3><p>${fc.currentCase.description}</p>` : '<p>Нет активного дела.</p>'}
            </div>
            <div class="forensics-timeline">
                <h3>Хронология</h3>
                ${fc.timeline.length > 0 ? fc.timeline.map(e => `<div>[${formatTime(e.timestamp)}] ${e.description}</div>`).join('') : '<p>Пусто</p>'}
            </div>
            <div class="forensics-report">
                <h3>Отчёты</h3>
                ${fc.reports.length > 0 ? fc.reports.map(r => `<p>${r.title} — оценка ${r.grade}</p>`).join('') : '<p>Нет отчётов</p>'}
            </div>
            <button class="btn btn-primary" onclick="BLACKNET.terminalReport()">СОЗДАТЬ ОТЧЁТ</button>
        `;
        container.innerHTML = html;
    }
    
    renderIntelligence() {
        const container = document.getElementById('screen-intelligence');
        if (!container) return;
        let html = `<h2 class="screen-title">РАЗВЕДЫВАТЕЛЬНЫЙ ЦЕНТР</h2><div class="intelligence-board">`;
        if (this.state.intelligenceBoard.length === 0) {
            html += '<p>Нет данных.</p>';
        } else {
            this.state.intelligenceBoard.forEach(item => {
                html += `<div class="card">${item.name}: ${item.info}</div>`;
            });
        }
        html += '</div>';
        container.innerHTML = html;
    }
    
    renderEvidence() {
        const container = document.getElementById('screen-evidence');
        if (!container) return;
        let html = `<h2 class="screen-title">ДОКАЗАТЕЛЬСТВА</h2>`;
        if (this.state.evidence.length === 0) {
            html += '<p>Пока нет доказательств. Исследуй узлы.</p>';
        } else {
            html += '<div class="inventory-list">';
            this.state.evidence.forEach(ev => {
                html += `<div class="item-card"><strong>${ev.title}</strong><br>${ev.description}<br><small>Тип: ${ev.type}, Надёжность: ${ev.reliability}</small></div>`;
            });
            html += '</div>';
        }
        container.innerHTML = html;
    }
    
    renderProfile() {
        const container = document.getElementById('screen-profile');
        if (!container) return;
        const p = this.state.player;
        const hw = this.state.hardware;
        let html = `
            <h2 class="screen-title">ПРОФИЛЬ ОПЕРАТОРА</h2>
            <div class="profile-header">
                <div class="avatar">🕵️</div>
                <div><h3>${p.name}</h3><p>Уровень ${p.level}</p></div>
            </div>
            <div class="panel">
                <h3>СИСТЕМА</h3>
                <div class="stat-row"><span>CPU</span><span>${hw.cpu.name} (${hw.cpu.performance})</span></div>
                <div class="stat-row"><span>RAM</span><span>${hw.ram.name} (${hw.ram.performance} MB)</span></div>
                <div class="stat-row"><span>SSD</span><span>${hw.ssd.name} (${hw.ssd.performance} GB)</span></div>
                <div class="stat-row"><span>GPU</span><span>${hw.gpu.name}</span></div>
                <div class="stat-row"><span>Сеть</span><span>${hw.network.name}</span></div>
                <div class="stat-row"><span>Безопасность</span><span>${hw.security.name}</span></div>
            </div>
            <div class="panel">
                <h3>РЕПУТАЦИЯ</h3>
                <div class="stat-row"><span>Cyber</span><span>${p.reputation.CYBER}</span></div>
                <div class="stat-row"><span>Corporate</span><span>${p.reputation.CORPORATE}</span></div>
                <div class="stat-row"><span>Underground</span><span>${p.reputation.UNDERGROUND}</span></div>
                <div class="stat-row"><span>Security</span><span>${p.reputation.SECURITY}</span></div>
            </div>
        `;
        container.innerHTML = html;
    }
    
    renderSkills() {
        const container = document.getElementById('screen-skills');
        if (!container) return;
        const skills = this.state.player.skills;
        let html = `<h2 class="screen-title">НАВЫКИ</h2><div class="skills-container">`;
        for (const key of Object.keys(SKILLS)) {
            const value = skills[key] || 0;
            html += `
                <div class="skill-card">
                    <h3>${SKILL_NAMES[key]} (${value}/100)</h3>
                    <div class="skill-desc">${SKILL_DESCRIPTIONS[key]}</div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${value}%"></div></div>
                    ${this.state.player.skillPoints > 0 ? `<button class="btn btn-primary btn-upgrade-skill" data-skill="${key}">УЛУЧШИТЬ</button>` : ''}
                </div>
            `;
        }
        html += '</div>';
        html += `<p>Очки навыков: ${this.state.player.skillPoints}</p>`;
        container.innerHTML = html;
        
        container.querySelectorAll('.btn-upgrade-skill').forEach(btn => {
            btn.onclick = () => this.upgradeSkill(btn.dataset.skill);
        });
    }
    
    upgradeSkill(skillKey) {
        if (this.state.player.skillPoints <= 0 || this.state.player.skills[skillKey] >= 100) return;
        this.state.player.skillPoints--;
        this.state.player.skills[skillKey]++;
        this.addActivityLog('SKILL', `Улучшен навык ${SKILL_NAMES[skillKey]}`);
        this.renderSkills();
        this.saveGame();
    }
    
    renderInventory() {
        const container = document.getElementById('screen-inventory');
        if (!container) return;
        let html = `<h2 class="screen-title">ИНВЕНТАРЬ</h2>`;
        if (this.state.inventory.length === 0) {
            html += '<p>Инвентарь пуст.</p>';
        } else {
            html += '<div class="inventory-list">';
            this.state.inventory.forEach(item => {
                html += `<div class="item-card"><strong>${item.name}</strong><br>${item.description}<br><small>Кол-во: ${item.quantity}, Редкость: ${item.rarity}</small><br><button class="btn btn-secondary btn-sell-item" data-id="${item.id}">ПРОДАТЬ</button></div>`;
            });
            html += '</div>';
        }
        container.innerHTML = html;
        container.querySelectorAll('.btn-sell-item').forEach(btn => {
            btn.onclick = () => this.sellItem(btn.dataset.id);
        });
    }
    
    sellItem(itemId) {
        const item = this.state.inventory.find(i => i.id === itemId);
        if (!item) return;
        const sellPrice = Math.floor(item.price * 0.6);
        this.state.player.credits += sellPrice;
        this.state.statistics.moneyEarned += sellPrice;
        item.quantity--;
        if (item.quantity <= 0) this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);
        this.addNotification(`Продано: ${item.name} за ${sellPrice} Cr`, 'success');
        this.saveGame();
        this.renderInventory();
    }
    
    renderStatistics() {
        const container = document.getElementById('screen-statistics');
        if (!container) return;
        const s = this.state.statistics;
        const items = [
            ['Всего миссий', s.totalMissions],
            ['Успешных', s.successfulMissions],
            ['Провалено', s.failedMissions],
            ['Заработано', s.moneyEarned],
            ['Потрачено', s.moneySpent],
            ['XP', s.xpEarned],
            ['Макс Heat', s.highestHeat],
            ['Время игры (сек)', s.playTime],
            ['Головоломок решено', s.puzzlesSolved],
            ['Доказательств найдено', s.evidenceFound],
            ['Отчётов', s.reportsCompleted]
        ];
        let html = `<h2 class="screen-title">СТАТИСТИКА</h2><div class="statistics-container">`;
        items.forEach(([label, value]) => {
            html += `<div class="stat-box"><div class="stat-num">${value}</div><div class="stat-label">${label}</div></div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }
    
    renderContacts() {
        const container = document.getElementById('screen-contacts');
        if (!container) return;
        let html = `<h2 class="screen-title">КОНТАКТЫ</h2>`;
        for (const name in this.state.relationships) {
            const rel = this.state.relationships[name];
            html += `<div class="card"><strong>${name}</strong> (${rel.role}) — Доверие: ${rel.trust}</div>`;
        }
        container.innerHTML = html;
    }
    
    renderMarket(category = 'hardware') {
        const container = document.getElementById('screen-market');
        if (!container) return;
        let html = `
            <h2 class="screen-title">РЫНОК</h2>
            <div class="market-tabs">
                <button class="tab-btn ${category==='hardware'?'active':''}" data-cat="hardware">Оборудование</button>
                <button class="tab-btn ${category==='software'?'active':''}" data-cat="software">Софт</button>
                <button class="tab-btn ${category==='tools'?'active':''}" data-cat="tools">Инструменты</button>
                <button class="tab-btn ${category==='intel'?'active':''}" data-cat="intel">Разведданные</button>
            </div>
            <div class="market-items">
        `;
        const items = this.state.market.items.filter(i => i.category === category);
        if (items.length === 0) {
            html += '<p>Нет товаров.</p>';
        } else {
            items.forEach(item => {
                html += `
                    <div class="item-card">
                        <strong>${item.name}</strong><br>
                        ${item.description}<br>
                        Цена: ${item.price} Cr<br>
                        Редкость: ${item.rarity}<br>
                        <button class="btn btn-primary btn-buy-item" data-id="${item.id}">КУПИТЬ</button>
                    </div>
                `;
            });
        }
        html += '</div>';
        container.innerHTML = html;
        container.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => this.renderMarket(btn.dataset.cat));
        container.querySelectorAll('.btn-buy-item').forEach(btn => btn.onclick = () => this.buyItem(btn.dataset.id));
    }
    
    buyItem(itemId) {
        const item = this.state.market.items.find(i => i.id === itemId);
        if (!item) return;
        if (this.state.player.credits < item.price) {
            this.addNotification('Недостаточно кредитов', 'error');
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
            else this.state.inventory.push({...item, quantity:1});
        }
        this.addNotification(`Куплено: ${item.name}`, 'success');
        this.saveGame();
        this.renderMarket('hardware');
    }
    
    renderAchievements() {
        const container = document.getElementById('screen-achievements');
        if (!container) return;
        let html = `<h2 class="screen-title">ДОСТИЖЕНИЯ</h2><div class="inventory-list">`;
        for (const ach of Object.values(this.state.achievements)) {
            html += `<div class="card" style="${ach.unlocked ? 'border-color: var(--yellow);' : 'opacity:0.6;'}">
                <strong>${ach.name}</strong> ${ach.unlocked ? '🏆' : '🔒'}<br>
                <small>${ach.description}</small>
            </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
    }
    
    renderSettings() {
        const container = document.getElementById('screen-settings');
        if (!container) return;
        const s = this.state.settings;
        let html = `
            <h2 class="screen-title">НАСТРОЙКИ</h2>
            <div class="settings-container">
                <div class="setting-row"><label>Звук</label><input type="checkbox" ${s.sound?'checked':''} id="set-sound"></div>
                <div class="setting-row"><label>Анимации</label><input type="checkbox" ${s.animations?'checked':''} id="set-animations"></div>
                <div class="setting-row"><label>Скан-линии</label><input type="checkbox" ${s.scanlines?'checked':''} id="set-scanlines"></div>
                <div class="setting-row"><label>Уведомления</label><input type="checkbox" ${s.notifications?'checked':''} id="set-notifications"></div>
                <div class="setting-row"><label>Размер шрифта терминала</label>
                    <select id="set-fontsize">
                        <option value="12" ${s.terminalFontSize==12?'selected':''}>12px</option>
                        <option value="14" ${s.terminalFontSize==14?'selected':''}>14px</option>
                        <option value="16" ${s.terminalFontSize==16?'selected':''}>16px</option>
                        <option value="18" ${s.terminalFontSize==18?'selected':''}>18px</option>
                    </select>
                </div>
                <div class="setting-row"><label>Сложность</label>
                    <select id="set-difficulty">
                        <option value="EASY" ${s.difficulty==='EASY'?'selected':''}>EASY</option>
                        <option value="NORMAL" ${s.difficulty==='NORMAL'?'selected':''}>NORMAL</option>
                        <option value="HARD" ${s.difficulty==='HARD'?'selected':''}>HARD</option>
                        <option value="NIGHTMARE" ${s.difficulty==='NIGHTMARE'?'selected':''}>NIGHTMARE</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="btn-save-settings">СОХРАНИТЬ</button>
                <button class="btn btn-danger" id="btn-reset-game">СБРОСИТЬ ИГРУ</button>
            </div>
        `;
        container.innerHTML = html;
        document.getElementById('btn-save-settings').onclick = () => {
            this.state.settings.sound = document.getElementById('set-sound').checked;
            this.state.settings.animations = document.getElementById('set-animations').checked;
            this.state.settings.scanlines = document.getElementById('set-scanlines').checked;
            this.state.settings.notifications = document.getElementById('set-notifications').checked;
            this.state.settings.terminalFontSize = parseInt(document.getElementById('set-fontsize').value);
            this.state.settings.difficulty = document.getElementById('set-difficulty').value;
            this.applySettings();
            this.saveGame(true);
            this.addNotification('Настройки сохранены', 'success');
        };
        document.getElementById('btn-reset-game').onclick = () => this.showResetConfirm();
    }
    
    showResetConfirm() {
        this.showModal('Подтверждение', '<p>Сбросить весь прогресс? Это действие необратимо.</p>', [
            { id: 'btn-reset-yes', label: 'ДА', class: 'btn-danger', onClick: () => {
                this.state.reset();
                this.initializeWorld();
                this.applySettings();
                this.saveGame(true);
                this.hideModal();
                this.addNotification('Игра сброшена', 'warning');
            }},
            { id: 'btn-reset-no', label: 'ОТМЕНА', class: 'btn-secondary', onClick: () => this.hideModal() }
        ]);
    }
    
    // ==================== МОДАЛЬНЫЕ ОКНА ====================
    showModal(title, content, buttons = []) {
        const container = document.getElementById('modal-container');
        if (!container) return;
        let btnHtml = buttons.map(btn => `<button class="btn ${btn.class||'btn-primary'}" id="${btn.id}">${btn.label}</button>`).join('');
        container.innerHTML = `<div class="modal-box"><h2>${title}</h2>${content}<div class="modal-buttons">${btnHtml}</div></div>`;
        container.classList.remove('hidden');
        buttons.forEach(btn => {
            const el = document.getElementById(btn.id);
            if (el && btn.onClick) el.onclick = btn.onClick;
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
            ['intelligence','INTEL'], ['evidence','EVID'], ['profile','PROFILE'], ['skills','SKILLS'],
            ['inventory','INV'], ['statistics','STATS'], ['contacts','CONTACTS'], ['market','MARKET'],
            ['achievements','ACH'], ['settings','SETTINGS']
        ];
        let html = screens.map(([id,label]) => `<a href="#" data-screen="${id}" class="mobile-menu-link">${label}</a>`).join('');
        this.showModal('Меню', html, [{ id:'btn-close-mobile', label:'Закрыть', class:'btn-secondary', onClick:()=>this.hideModal() }]);
        document.querySelectorAll('.mobile-menu-link').forEach(a => {
            a.onclick = (e) => { e.preventDefault(); this.hideModal(); this.navigateToScreen(a.dataset.screen); };
        });
    }
    
    // ==================== СИСТЕМА МИССИЙ ====================
    checkMissionObjective(type, target) {
        const activeMission = this.state.missions.active[0];
        if (!activeMission) return;
        activeMission.objectives.forEach(obj => {
            if (!obj.completed && obj.type === type) {
                if (!target || obj.target === target) {
                    obj.completed = true;
                    this.addNotification(`Цель выполнена: ${obj.description}`, 'success');
                    this.addActivityLog('MISSION', `Цель: ${obj.description}`);
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
        if (mission.title.includes('Daily')) this.state.statistics.dailyContractsCompleted++;
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
                this.addNotification(`Достижение: ${ach.name}`, 'achievement');
                this.addActivityLog('ACHIEVEMENT', `Открыто: ${ach.name}`);
            }
        });
    }
    
    // ==================== МИНИ-ИГРЫ ====================
    startMiniGame(puzzleType) {
        this.audio.play('click');
        switch(puzzleType) {
            case 'port_puzzle': this.startPortPuzzle(); break;
            case 'hash_puzzle': this.startHashPuzzle(); break;
            case 'log_analysis': this.startLogAnalysis(); break;
            case 'packet_analysis': this.startPacketAnalysis(); break;
            case 'crypto': this.startCryptoPuzzle(); break;
            case 'memory_forensics': this.startMemoryForensics(); break;
            case 'file_analysis': this.startFileAnalysis(); break;
            case 'network_topology': this.startNetworkTopology(); break;
            default: this.addNotification('Неизвестная головоломка', 'error');
        }
    }
    
    // Реализация мини-игр остаётся из предыдущей версии (полный код ниже)
    startPortPuzzle() {
        const ports = [80, 443, 22, 21, 8080, 3306];
        const targetPort = ports[Math.floor(Math.random()*ports.length)];
        let html = `<p>Найди открытый порт.</p>`;
        ports.forEach(p => {
            html += `<button class="btn port-btn" data-port="${p}">Порт ${p}</button> `;
        });
        this.showModal('ПОРТ-ГОЛОВОЛОМКА', html, [{id:'btn-cancel-port', label:'Отмена', class:'btn-secondary', onClick:()=>this.hideModal()}]);
        document.querySelectorAll('.port-btn').forEach(btn => {
            btn.onclick = () => {
                if (parseInt(btn.dataset.port) === targetPort) {
                    this.addNotification('Головоломка решена!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'port_puzzle');
                    this.hideModal();
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    this.audio.play('error');
                }
            };
        });
    }
    
    startHashPuzzle() {
        const words = ['apple','banana','cherry','date','elderberry'];
        const target = words[Math.floor(Math.random()*words.length)];
        const hash = generateFakeHash(target).substring(0,8);
        let html = `<p>Хэш: <strong>${hash}</strong>. Какое слово?</p>`;
        words.forEach(w => {
            html += `<button class="btn hash-btn" data-word="${w}">${w}</button> `;
        });
        this.showModal('ХЭШ-ГОЛОВОЛОМКА', html, [{id:'btn-cancel-hash', label:'Отмена', class:'btn-secondary', onClick:()=>this.hideModal()}]);
        document.querySelectorAll('.hash-btn').forEach(btn => {
            btn.onclick = () => {
                if (btn.dataset.word === target) {
                    this.addNotification('Головоломка решена!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'hash_puzzle');
                    this.hideModal();
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    this.audio.play('error');
                }
            };
        });
    }
    
    startLogAnalysis() {
        const logs = [
            { text: 'Login successful from 192.168.1.5', normal: true },
            { text: 'Login failed from 10.0.0.3', normal: true },
            { text: 'Access granted to file.txt', normal: true },
            { text: 'Unusual process started: "ghost.exe"', normal: false },
            { text: 'Logout from 192.168.1.7', normal: true }
        ];
        const shuffled = [...logs].sort(()=>Math.random()-0.5);
        let html = '<p>Найди аномальную запись.</p>';
        shuffled.forEach((log, i) => {
            html += `<button class="btn log-btn" data-idx="${i}">${log.text}</button> `;
        });
        this.showModal('АНАЛИЗ ЛОГОВ', html, [{id:'btn-cancel-log', label:'Отмена', class:'btn-secondary', onClick:()=>this.hideModal()}]);
        document.querySelectorAll('.log-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                if (!shuffled[idx].normal) {
                    this.addNotification('Аномалия найдена!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'log_analysis');
                    this.hideModal();
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    this.audio.play('error');
                }
            };
        });
    }
    
    startPacketAnalysis() {
        const packets = [
            { src:'192.168.1.2', dst:'8.8.8.8', proto:'TCP', suspicious:false },
            { src:'192.168.1.3', dst:'10.0.0.1', proto:'UDP', suspicious:false },
            { src:'10.0.0.99', dst:'192.168.1.100', proto:'ICMP', suspicious:true },
            { src:'192.168.1.4', dst:'172.16.0.5', proto:'TCP', suspicious:false }
        ];
        const shuffled = [...packets].sort(()=>Math.random()-0.5);
        let html = '<p>Какой пакет подозрительный?</p>';
        shuffled.forEach((p, i) => {
            html += `<button class="btn packet-btn" data-idx="${i}">${p.src} → ${p.dst} [${p.proto}]</button> `;
        });
        this.showModal('АНАЛИЗ ПАКЕТОВ', html, [{id:'btn-cancel-packet', label:'Отмена', class:'btn-secondary', onClick:()=>this.hideModal()}]);
        document.querySelectorAll('.packet-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                if (shuffled[idx].suspicious) {
                    this.addNotification('Пакет найден!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'packet_analysis');
                    this.hideModal();
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    this.audio.play('error');
                }
            };
        });
    }
    
    startCryptoPuzzle() {
        const plain = 'BLACKNET';
        const shift = 3;
        const cipher = plain.split('').map(ch => ch >= 'A' && ch <= 'Z' ? String.fromCharCode(((ch.charCodeAt(0)-65+shift)%26)+65) : ch).join('');
        const html = `<p>Расшифруй сообщение (шифр Цезаря):</p><p><strong>${cipher}</strong></p><input type="text" id="crypto-input" style="width:100%; padding:5px; background:var(--bg-glass); border:1px solid var(--border); color:var(--text-primary);" placeholder="Введи текст">`;
        this.showModal('КРИПТОГРАФИЯ', html, [
            {id:'btn-check-crypto', label:'Проверить', class:'btn-primary', onClick:()=>{
                const val = document.getElementById('crypto-input').value.trim().toUpperCase();
                if (val === plain) {
                    this.addNotification('Расшифровано!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'crypto');
                    this.hideModal();
                } else {
                    this.addNotification('Неверно', 'error');
                }
            }},
            {id:'btn-cancel-crypto', label:'Отмена', class:'btn-secondary', onClick:()=>this.hideModal()}
        ]);
    }
    
    startMemoryForensics() {
        const procs = [
            { name:'chrome.exe', normal:true },
            { name:'explorer.exe', normal:true },
            { name:'system.exe', normal:true },
            { name:'malware.bin', normal:false },
            { name:'svchost.exe', normal:true }
        ];
        const shuffled = [...procs].sort(()=>Math.random()-0.5);
        let html = '<p>Найди вредоносный процесс.</p>';
        shuffled.forEach((p, i) => {
            html += `<button class="btn proc-btn" data-idx="${i}">${p.name}</button> `;
        });
        this.showModal('ПАМЯТЬ', html, [{id:'btn-cancel-proc', label:'Отмена', class:'btn-secondary', onClick:()=>this.hideModal()}]);
        document.querySelectorAll('.proc-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                if (!shuffled[idx].normal) {
                    this.addNotification('Процесс найден!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'memory_forensics');
                    this.hideModal();
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    this.audio.play('error');
                }
            };
        });
    }
    
    startFileAnalysis() {
        const files = [
            { name:'report.doc', normal:true },
            { name:'image.jpg', normal:true },
            { name:'data.exe', normal:false },
            { name:'notes.txt', normal:true },
            { name:'archive.zip', normal:true }
        ];
        const shuffled = [...files].sort(()=>Math.random()-0.5);
        let html = '<p>Какой файл подозрительный?</p>';
        shuffled.forEach((f, i) => {
            html += `<button class="btn file-btn" data-idx="${i}">${f.name}</button> `;
        });
        this.showModal('АНАЛИЗ ФАЙЛОВ', html, [{id:'btn-cancel-file', label:'Отмена', class:'btn-secondary', onClick:()=>this.hideModal()}]);
        document.querySelectorAll('.file-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                if (!shuffled[idx].normal) {
                    this.addNotification('Файл найден!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'file_analysis');
                    this.hideModal();
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    this.audio.play('error');
                }
            };
        });
    }
    
    startNetworkTopology() {
        const paths = [
            { from:'A', to:'B', valid:true },
            { from:'A', to:'C', valid:false },
            { from:'B', to:'D', valid:true },
            { from:'C', to:'D', valid:false }
        ];
        let html = '<p>Найди путь от A до D.</p>';
        html += `<button class="btn path-btn" data-path="AB">A → B</button> <button class="btn path-btn" data-path="AC">A → C</button> <button class="btn path-btn" data-path="BD">B → D</button> <button class="btn path-btn" data-path="CD">C → D</button>`;
        this.showModal('СЕТЕВАЯ ТОПОЛОГИЯ', html, [{id:'btn-cancel-topo', label:'Отмена', class:'btn-secondary', onClick:()=>this.hideModal()}]);
        document.querySelectorAll('.path-btn').forEach(btn => {
            btn.onclick = () => {
                const path = btn.dataset.path;
                if (path === 'AB' || path === 'BD') {
                    this.addNotification('Правильный путь!', 'success');
                    this.state.statistics.puzzlesSolved++;
                    this.checkMissionObjective('solve_puzzle', 'network_topology');
                    this.hideModal();
                } else {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    this.audio.play('error');
                }
            };
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
        
        switch(cmd) {
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
            case 'debug': response = this.state.settings.debugMode ? this.terminalDebug(args) : 'Debug mode отключен.'; break;
            default: response = `Неизвестная команда: ${command}. Введи "help".`;
        }
        
        if (response) {
            const respLine = document.createElement('div');
            respLine.textContent = response;
            output.appendChild(respLine);
        }
        output.scrollTop = output.scrollHeight;
        this.state.statistics.terminalCommandsUsed++;
        this.addActivityLog('TERMINAL', `Команда: ${command}`);
    }
    
    terminalHelp() {
        return `Доступные команды:
  help        - показать справку
  clear       - очистить терминал
  status      - статус системы
  whoami      - информация о игроке
  inventory   - инвентарь
  missions    - активные миссии
  scan        - сканировать сеть (scan network)
  connect     - подключиться к узлу (connect <id>)
  disconnect  - отключиться
  nodes       - список узлов
  inspect     - исследовать узел (inspect <id>)
  analyze     - анализировать объект (analyze <объект>)
  logs        - журнал действий
  trace       - проследить (trace <цель>)
  contacts    - контакты
  market      - рынок
  skills      - навыки
  system      - информация о системе
  history     - история команд
  vm          - виртуальные машины (vm list)
  evidence    - доказательства
  report      - создать отчёт
  puzzle      - запустить головоломку (puzzle <тип>)
  npc         - поговорить с NPC (npc <имя>)`;
    }
    
    terminalStatus() {
        const p = this.state.player;
        const hw = this.state.hardware;
        return `CPU: ${hw.cpu.performance}% | RAM: ${hw.ram.performance*4} MB
Сеть: СТАБИЛЬНА
Безопасность: АКТИВНА
Кредиты: ${p.credits}
Heat: ${p.heat}
Suspicion: ${p.suspicion}`;
    }
    
    terminalWhoami() {
        return `Игрок: ${this.state.player.name}
Уровень: ${this.state.player.level}
ID: ${this.state.player.id}`;
    }
    
    terminalInventory() {
        if (this.state.inventory.length === 0) return 'Инвента