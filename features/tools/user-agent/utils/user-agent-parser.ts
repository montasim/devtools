export interface UserAgentInfo {
    browser: {
        name: string;
        version: string;
        engine: string;
    };
    os: {
        name: string;
        version: string;
        architecture: string;
    };
    device: {
        type: string;
        brand: string;
        model: string;
    };
    isBot: boolean;
    botName: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

const BOTS: RegExp[] = [
    /Googlebot/i,
    /Bingbot/i,
    /Slurp/i,
    /DuckDuckBot/i,
    /Baiduspider/i,
    /YandexBot/i,
    /Sogou/i,
    /facebot/i,
    /facebookexternalhit/i,
    /ia_archiver/i,
    /AhrefsBot/i,
    /SemrushBot/i,
    /MJ12bot/i,
    /DotBot/i,
    /rogerbot/i,
    /exabot/i,
    /Twitterbot/i,
    /LinkedInBot/i,
    /WhatsApp/i,
    /TelegramBot/i,
    /crawler/i,
    /spider/i,
    /bot/i,
];

const BROWSERS: [string, RegExp][] = [
    ['SamsungBrowser', /SamsungBrowser\/([\d.]+)/],
    ['UCBrowser', /UCBrowser\/([\d.]+)/],
    ['Opera GX', /OPRGX\/([\d.]+)/],
    ['Opera', /OPR\/([\d.]+)/],
    ['Opera', /Opera\/([\d.]+)/],
    ['Vivaldi', /Vivaldi\/([\d.]+)/],
    ['Brave', /Brave\/([\d.]+)/],
    ['Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ['Firefox', /Firefox\/([\d.]+)/],
    ['Chrome', /Chrome\/([\d.]+)/],
    ['Safari', /Version\/([\d.]+).*Safari/],
];

const ENGINES: [string, RegExp][] = [
    ['Trident', /Trident\/([\d.]+)/],
    ['EdgeHTML', /Edge\/([\d.]+)/],
    ['Gecko', /Gecko\/([\d.]+)/],
    ['WebKit', /AppleWebKit\/([\d.]+)/],
    ['Blink', /Chrome\//],
    ['Presto', /Presto\/([\d.]+)/],
    ['Goanna', /Goanna\/([\d.]+)/],
];

const OS_PATTERNS: [string, RegExp, number][] = [
    ['Windows Phone', /Windows Phone(?: OS)? ([\d.]+)/, 1],
    ['Windows', /Windows NT ([\d.]+)/, 1],
    ['macOS', /Mac OS X ([\d_]+)/, 1],
    ['iOS', /iPhone OS ([\d_]+)/, 1],
    ['iOS', /iPad.*OS ([\d_]+)/, 1],
    ['ChromeOS', /CrOS ([\w]+) ([\d.]+)/, 2],
    ['Android', /Android ([\d.]+)/, 1],
    ['Linux', /Linux/, 0],
    ['FreeBSD', /FreeBSD/, 0],
    ['OpenBSD', /OpenBSD/, 0],
    ['NetBSD', /NetBSD/, 0],
];

const WINDOWS_VERSIONS: Record<string, string> = {
    '10.0': '10/11',
    '6.3': '8.1',
    '6.2': '8',
    '6.1': '7',
    '6.0': 'Vista',
    '5.1': 'XP',
    '5.0': '2000',
};

const MAC_VERSIONS: Record<string, string> = {
    '15': 'Sequoia',
    '14': 'Sonoma',
    '13': 'Ventura',
    '12': 'Monterey',
    '11': 'Big Sur',
    '10_15': 'Catalina',
    '10_14': 'Mojave',
    '10_13': 'High Sierra',
    '10_12': 'Sierra',
    '10_11': 'El Capitan',
    '10_10': 'Yosemite',
    '10_9': 'Mavericks',
    '10_8': 'Mountain Lion',
    '10_7': 'Lion',
    '10_6': 'Snow Leopard',
    '10_5': 'Leopard',
    '10_4': 'Tiger',
    '10_3': 'Panther',
    '10_2': 'Jaguar',
    '10_1': 'Puma',
    '10_0': 'Cheetah',
};

const MOBILE_BRANDS: [string, RegExp][] = [
    ['Apple', /iPhone/],
    ['Apple', /iPad/],
    ['Samsung', /Samsung/i],
    ['Google', /Pixel/i],
    ['Huawei', /Huawei/i],
    ['Xiaomi', /Xiaomi/i],
    ['OnePlus', /OnePlus/i],
    ['OPPO', /OPPO/i],
    ['Vivo', /Vivo/i],
    ['LG', /LG/i],
    ['Sony', /Sony/i],
    ['HTC', /HTC/i],
    ['Nokia', /Nokia/i],
    ['Motorola', /Moto/i],
];

const ARCH_PATTERNS: [string, RegExp][] = [
    ['x86_64', /x86-64|x64|Win64|x86_64|amd64/i],
    ['x86', /x86|i[36]86/i],
    ['ARM64', /arm64|aarch64/i],
    ['ARM', /armv[0-9]+/i],
    ['WOW64', /WOW64/i],
];

function detectBot(ua: string): { isBot: boolean; botName: string } {
    for (const pattern of BOTS) {
        const match = ua.match(pattern);
        if (match) {
            return { isBot: true, botName: match[0] };
        }
    }
    return { isBot: false, botName: '' };
}

function detectBrowser(ua: string): { name: string; version: string; engine: string } {
    for (const [name, pattern] of BROWSERS) {
        const match = ua.match(pattern);
        if (match) {
            return { name, version: match[1] || '', engine: '' };
        }
    }
    return { name: 'Unknown', version: '', engine: '' };
}

function detectEngine(ua: string): string {
    for (const [name, pattern] of ENGINES) {
        if (pattern.test(ua)) {
            return name;
        }
    }
    return 'Unknown';
}

function detectOS(ua: string): { name: string; version: string; architecture: string } {
    for (const [name, pattern, groupIdx] of OS_PATTERNS) {
        const match = ua.match(pattern);
        if (match) {
            let version = groupIdx > 0 ? (match[groupIdx] || '').replace(/_/g, '.') : '';

            if (name === 'Windows' && version in WINDOWS_VERSIONS) {
                version = WINDOWS_VERSIONS[version];
            }

            if (name === 'macOS' || name === 'iOS') {
                const majorMinor = version.split('.').slice(0, 2).join('_');
                if (MAC_VERSIONS[majorMinor]) {
                    version = `${MAC_VERSIONS[majorMinor]} (${version})`;
                } else if (MAC_VERSIONS[version]) {
                    version = `${MAC_VERSIONS[version]} (${version})`;
                } else if (name === 'macOS' || name === 'iOS') {
                    const major = version.split('.')[0];
                    if (MAC_VERSIONS[major]) {
                        version = `${MAC_VERSIONS[major]} (${version})`;
                    }
                }
            }

            return { name, version, architecture: '' };
        }
    }
    return { name: 'Unknown', version: '', architecture: '' };
}

function detectDevice(ua: string): { type: string; brand: string; model: string } {
    const isTablet = /iPad/i.test(ua) || /Android(?!.*Mobile)/i.test(ua) || /tablet/i.test(ua);
    const isMobile = /Mobile|iPhone|Android.*Mobile/i.test(ua) && !isTablet;

    let type = 'Desktop';
    if (isMobile) type = 'Mobile';
    else if (isTablet) type = 'Tablet';

    let brand = '';
    let model = '';

    for (const [b, pattern] of MOBILE_BRANDS) {
        if (pattern.test(ua)) {
            brand = b;
            break;
        }
    }

    const modelMatch = ua.match(/;\s*([A-Za-z0-9]+(?:\s[A-Za-z0-9]+)*)\s*(?:Build|\))/);
    if (modelMatch) {
        model = modelMatch[1].trim();
    }

    return { type, brand, model };
}

function detectArchitecture(ua: string): string {
    for (const [arch, pattern] of ARCH_PATTERNS) {
        if (pattern.test(ua)) {
            return arch;
        }
    }
    return 'Unknown';
}

export function parseUserAgent(ua: string): UserAgentInfo {
    if (!ua || !ua.trim()) {
        return {
            browser: { name: 'Unknown', version: '', engine: 'Unknown' },
            os: { name: 'Unknown', version: '', architecture: 'Unknown' },
            device: { type: 'Desktop', brand: '', model: '' },
            isBot: false,
            botName: '',
            isMobile: false,
            isTablet: false,
            isDesktop: true,
        };
    }

    const browser = detectBrowser(ua);
    browser.engine = detectEngine(ua);

    const os = detectOS(ua);
    os.architecture = detectArchitecture(ua);

    const device = detectDevice(ua);
    const { isBot, botName } = detectBot(ua);

    return {
        browser,
        os,
        device,
        isBot,
        botName,
        isMobile: device.type === 'Mobile',
        isTablet: device.type === 'Tablet',
        isDesktop: device.type === 'Desktop',
    };
}

export const COMMON_USER_AGENTS: { label: string; ua: string }[] = [
    {
        label: 'Chrome 131 · Windows 11',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    },
    {
        label: 'Firefox 133 · Windows 11',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    },
    {
        label: 'Safari 18 · macOS Sequoia',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
    },
    {
        label: 'Edge 131 · Windows 11',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
    },
    {
        label: 'Chrome 131 · macOS Sequoia',
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    },
    {
        label: 'Safari · iPhone 16 (iOS 18)',
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
    },
    {
        label: 'Chrome · Android 15 (Samsung)',
        ua: 'Mozilla/5.0 (Linux; Android 15; SM-S928B Build/AP3A.241005.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    },
    {
        label: 'Googlebot',
        ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    },
    {
        label: 'Safari · iPad Pro (iPadOS 18)',
        ua: 'Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
    },
    {
        label: 'Brave · Windows 11',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Brave/131.0.0.0',
    },
];
