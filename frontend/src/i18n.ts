import { create } from 'zustand';

// ─── Translation Data ───────────────────────────────────────────────
const translations = {
    vi: {
        // Main Menu
        'menu.title': 'CỜ THÚ',
        'menu.subtitle': 'Dark Fantasy Jungle Chess',
        'menu.local': 'Chơi 2 Người',
        'menu.localDesc': 'Trên cùng thiết bị',
        'menu.ai': 'Chơi với AI',
        'menu.aiDesc': 'Thử sức với máy tính',
        'menu.createRoom': 'Tạo Phòng Online',
        'menu.createRoomDesc': 'Mời bạn bè vào chơi',
        'menu.joinRoom': 'Vào Phòng',
        'menu.joinPlaceholder': 'Nhập mã phòng...',
        'menu.connecting': 'Đang kết nối...',
        'menu.error': 'Không thể kết nối. Kiểm tra server đã chạy chưa!',
        'menu.footer': 'Cờ Thú 3D v3.0 • Dark Fantasy Edition • Made with ❤️',
        'menu.rulesTitle': '📜 Chiến binh rừng xanh',
        'menu.rule1': '🐘 Voi đại chiến > 🦁 Sư tử vương > 🐯 Hổ hỏa diệm > 🐆 Báo ám sát',
        'menu.rule2': '🐺 Sói cuồng chiến > 🐶 Chó hộ vệ > 🐱 Mèo thích khách > 🐭 Chuột dũng sĩ',
        'menu.rule3': '🐀 Chuột dũng sĩ hạ được Voi đại chiến!',
        'menu.rule4': '🏊 Chỉ Chuột mới bơi qua sông huyền bí',
        'menu.rule5': '🦁 Sư tử & Hổ nhảy qua sông',
        'menu.rule6': '🏠 Chiếm hang đối thủ = Chiến thắng!',

        // Difficulty
        'diff.easy': '🛡️ Dễ',
        'diff.easyDesc': 'Cho chiến binh mới',
        'diff.medium': '⚔️ Trung bình',
        'diff.mediumDesc': 'Thử thách đấu trường',
        'diff.hard': '🔥 Khó',
        'diff.hardDesc': 'Dành cho đại chiến binh',

        // HUD
        'hud.menu': '← Menu',
        'hud.room': 'Phòng:',
        'hud.redTurn': '🔴 Đỏ đang đi',
        'hud.blueTurn': '🔵 Xanh đang đi',
        'hud.aiThinking': '🤖 AI đang nghĩ...',
        'hud.playing': '⚔️ Đang chơi',
        'hud.redWins': '🏆 Đỏ thắng!',
        'hud.blueWins': '🏆 Xanh thắng!',
        'hud.muteOn': 'Tắt âm',
        'hud.muteOff': 'Bật âm',
        'hud.redPlayer': 'Người chơi Đỏ',
        'hud.bluePlayer': 'Người chơi Xanh',
        'hud.aiPlayer': 'AI Opponent',
        'hud.pieces': 'quân',
        'hud.captured': 'Đã bắt:',
        'hud.playAgain': '🔄 Chơi lại',
        'hud.victory': 'Chiến Thắng!',
        'hud.beatAI': 'Tuyệt vời! Bạn đã đánh bại AI!',
        'hud.congRed': 'Chúc mừng người chơi Đỏ!',
        'hud.aiWon': 'AI đã thắng! Thử lại nhé!',
        'hud.congBlue': 'Chúc mừng người chơi Xanh!',

        // Piece Inspector
        'inspector.drag': '🖱️ Kéo chuột để xoay mô hình',
        'inspector.power': 'Sức mạnh:',
        'inspector.alive': 'Đang chiến đấu',
        'inspector.dead': 'Đã hy sinh',
        'inspector.sideRed': 'Phe Đỏ',
        'inspector.sideBlue': 'Phe Xanh',

        // Animal Names
        'animal.rat': 'Chuột',
        'animal.cat': 'Mèo',
        'animal.dog': 'Chó',
        'animal.wolf': 'Sói',
        'animal.leopard': 'Báo',
        'animal.tiger': 'Hổ',
        'animal.lion': 'Sư Tử',
        'animal.elephant': 'Voi',

        // Animal Descriptions
        'desc.rat': 'Tuy nhỏ bé nhưng linh hoạt, Chuột có thể hạ gục Voi khổng lồ!',
        'desc.cat': 'Nhanh nhẹn và khéo léo, Mèo luôn tìm cách tiếp cận đối thủ.',
        'desc.dog': 'Trung thành và dũng cảm, Chó bảo vệ hang đến hơi thở cuối cùng.',
        'desc.wolf': 'Sói hoang dã với nanh vuốt sắc bén, kẻ thù đáng gờm trên chiến trường.',
        'desc.leopard': 'Tốc độ chớp nhoáng, Báo là sát thủ thầm lặng của rừng xanh.',
        'desc.tiger': 'Mãnh hổ với sức mạnh phi thường, có thể nhảy qua sông trong nháy mắt.',
        'desc.lion': 'Chúa tể muôn loài, Sư Tử mang uy quyền tối thượng trên chiến trường.',
        'desc.elephant': 'Khổng lồ và bất khả chiến bại, Voi là pháo đài di động... nhưng sợ Chuột!',

        // Language
        'lang.switch': '🇬🇧 English',
    },
    en: {
        // Main Menu
        'menu.title': 'JUNGLE CHESS',
        'menu.subtitle': 'Dark Fantasy Jungle Chess',
        'menu.local': '2 Players',
        'menu.localDesc': 'On the same device',
        'menu.ai': 'Play vs AI',
        'menu.aiDesc': 'Challenge the computer',
        'menu.createRoom': 'Create Online Room',
        'menu.createRoomDesc': 'Invite friends to play',
        'menu.joinRoom': 'Join Room',
        'menu.joinPlaceholder': 'Enter room code...',
        'menu.connecting': 'Connecting...',
        'menu.error': 'Cannot connect. Please check if the server is running!',
        'menu.footer': 'Jungle Chess 3D v3.0 • Dark Fantasy Edition • Made with ❤️',
        'menu.rulesTitle': '📜 Warriors of the Jungle',
        'menu.rule1': '🐘 Elephant > 🦁 Lion > 🐯 Tiger > 🐆 Leopard',
        'menu.rule2': '🐺 Wolf > 🐶 Dog > 🐱 Cat > 🐭 Rat',
        'menu.rule3': '🐀 The tiny Rat can defeat the mighty Elephant!',
        'menu.rule4': '🏊 Only the Rat can swim across the river',
        'menu.rule5': '🦁 Lion & Tiger can leap over the river',
        'menu.rule6': '🏠 Capture the enemy den = Victory!',

        // Difficulty
        'diff.easy': '🛡️ Easy',
        'diff.easyDesc': 'For new warriors',
        'diff.medium': '⚔️ Medium',
        'diff.mediumDesc': 'Arena challenge',
        'diff.hard': '🔥 Hard',
        'diff.hardDesc': 'For elite champions',

        // HUD
        'hud.menu': '← Menu',
        'hud.room': 'Room:',
        'hud.redTurn': "🔴 Red's turn",
        'hud.blueTurn': "🔵 Blue's turn",
        'hud.aiThinking': '🤖 AI thinking...',
        'hud.playing': '⚔️ Playing',
        'hud.redWins': '🏆 Red wins!',
        'hud.blueWins': '🏆 Blue wins!',
        'hud.muteOn': 'Mute',
        'hud.muteOff': 'Unmute',
        'hud.redPlayer': 'Red Player',
        'hud.bluePlayer': 'Blue Player',
        'hud.aiPlayer': 'AI Opponent',
        'hud.pieces': 'pieces',
        'hud.captured': 'Captured:',
        'hud.playAgain': '🔄 Play Again',
        'hud.victory': 'Victory!',
        'hud.beatAI': "Amazing! You've defeated the AI!",
        'hud.congRed': 'Congratulations Red Player!',
        'hud.aiWon': 'AI has won! Try again!',
        'hud.congBlue': 'Congratulations Blue Player!',

        // Piece Inspector
        'inspector.drag': '🖱️ Drag to rotate the model',
        'inspector.power': 'Power:',
        'inspector.alive': 'In battle',
        'inspector.dead': 'Fallen',
        'inspector.sideRed': 'Red Team',
        'inspector.sideBlue': 'Blue Team',

        // Animal Names
        'animal.rat': 'Rat',
        'animal.cat': 'Cat',
        'animal.dog': 'Dog',
        'animal.wolf': 'Wolf',
        'animal.leopard': 'Leopard',
        'animal.tiger': 'Tiger',
        'animal.lion': 'Lion',
        'animal.elephant': 'Elephant',

        // Animal Descriptions
        'desc.rat': 'Small but agile, the Rat can defeat the mighty Elephant!',
        'desc.cat': 'Quick and cunning, the Cat always finds a way to approach its prey.',
        'desc.dog': 'Loyal and brave, the Dog guards the den until its last breath.',
        'desc.wolf': 'A wild beast with razor-sharp fangs, a formidable foe on the battlefield.',
        'desc.leopard': 'Lightning fast, the Leopard is the silent assassin of the jungle.',
        'desc.tiger': 'A fierce beast with incredible power, able to leap across the river.',
        'desc.lion': 'King of all beasts, the Lion commands supreme authority on the battlefield.',
        'desc.elephant': "Massive and unstoppable, the Elephant is a walking fortress... but fears the Rat!",

        // Language
        'lang.switch': '🇻🇳 Tiếng Việt',
    },
} as const;

export type Language = 'vi' | 'en';
export type TranslationKey = keyof typeof translations.vi;

// ─── Language Store ─────────────────────────────────────────────────
interface LanguageStore {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: TranslationKey) => string;
}

export const useLanguage = create<LanguageStore>((set, get) => ({
    language: 'vi',
    setLanguage: (lang) => set({ language: lang }),
    toggleLanguage: () => set((s) => ({ language: s.language === 'vi' ? 'en' : 'vi' })),
    t: (key) => {
        const lang = get().language;
        return translations[lang][key] || translations.vi[key] || key;
    },
}));
