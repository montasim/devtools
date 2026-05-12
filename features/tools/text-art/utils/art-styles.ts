// ---------------------------------------------------------------------------
// Art style definitions — pure functions, no external deps
// ---------------------------------------------------------------------------

export type ArtCategory = 'ASCII Banner' | 'Text Box' | 'Unicode Block' | 'Braille Art';

export interface ArtStyle {
    id: string;
    name: string;
    category: ArtCategory;
    description: string;
    generate: (text: string) => string;
}

// ---------------------------------------------------------------------------
// ASCII Banner fonts (self-contained, no figlet dependency)
// ---------------------------------------------------------------------------

/** Render text using a 5-row glyph map */
function renderGlyphFont(
    text: string,
    glyphs: Record<string, string[]>,
    spaceBetween = true,
): string {
    const chars = text.toUpperCase().split('');
    const height = 5;
    const sep = spaceBetween ? ' ' : '';
    const rows: string[] = [];

    for (let row = 0; row < height; row++) {
        let line = '';
        for (const ch of chars) {
            const glyph = glyphs[ch];
            if (glyph) {
                line += (glyph[row] ?? '') + sep;
            } else if (ch === ' ') {
                line += ' '.repeat(4) + sep;
            } else {
                line += ' ? ' + sep;
            }
        }
        rows.push(line.trimEnd());
    }

    return rows.join('\n');
}

const STANDARD_GLYPHS: Record<string, string[]> = {
    A: ['  █  ', '█   █', '█████', '█   █', '█   █'],
    B: ['████ ', '█   █', '████ ', '█   █', '████ '],
    C: [' ████', '█    ', '█    ', '█    ', ' ████'],
    D: ['████ ', '█   █', '█   █', '█   █', '████ '],
    E: ['█████', '█    ', '███  ', '█    ', '█████'],
    F: ['█████', '█    ', '███  ', '█    ', '█    '],
    G: [' ████', '█    ', '█  ██', '█   █', ' ████'],
    H: ['█   █', '█   █', '█████', '█   █', '█   █'],
    I: ['█████', '  █  ', '  █  ', '  █  ', '█████'],
    J: ['█████', '   █ ', '   █ ', '█  █ ', ' ██  '],
    K: ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
    L: ['█    ', '█    ', '█    ', '█    ', '█████'],
    M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    O: [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
    P: ['████ ', '█   █', '████ ', '█    ', '█    '],
    Q: [' ███ ', '█   █', '█ █ █', '█  █ ', ' ████'],
    R: ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
    S: [' ████', '█    ', ' ███ ', '    █', '████ '],
    T: ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    U: ['█   █', '█   █', '█   █', '█   █', ' ███ '],
    V: ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    X: ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    Z: ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    '0': [' ███ ', '█  ██', '█ █ █', '██  █', ' ███ '],
    '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
    '2': [' ███ ', '█   █', '  ██ ', ' █   ', '█████'],
    '3': ['████ ', '    █', ' ███ ', '    █', '████ '],
    '4': ['█   █', '█   █', '█████', '    █', '    █'],
    '5': ['█████', '█    ', '████ ', '    █', '████ '],
    '6': [' ███ ', '█    ', '████ ', '█   █', ' ███ '],
    '7': ['█████', '   █ ', '  █  ', ' █   ', '█    '],
    '8': [' ███ ', '█   █', ' ███ ', '█   █', ' ███ '],
    '9': [' ███ ', '█   █', ' ████', '    █', ' ███ '],
    ' ': ['     ', '     ', '     ', '     ', '     '],
    '!': ['  █  ', '  █  ', '  █  ', '     ', '  █  '],
    '?': [' ███ ', '█   █', '  ██ ', '     ', '  █  '],
    '.': ['     ', '     ', '     ', '     ', '  █  '],
    '-': ['     ', '     ', '█████', '     ', '     '],
};

const BLOCK_GLYPHS: Record<string, string[]> = {
    A: ['█████', '█   █', '█████', '█   █', '█   █'],
    B: ['████ ', '█   █', '████ ', '█   █', '████ '],
    C: [' ████', '█    ', '█    ', '█    ', ' ████'],
    D: ['████ ', '█   █', '█   █', '█   █', '████ '],
    E: ['█████', '█    ', '███  ', '█    ', '█████'],
    F: ['█████', '█    ', '███  ', '█    ', '█    '],
    G: [' ████', '█    ', '█  ██', '█   █', ' ████'],
    H: ['█   █', '█   █', '█████', '█   █', '█   █'],
    I: ['█████', '  █  ', '  █  ', '  █  ', '█████'],
    J: ['█████', '   █ ', '   █ ', '█  █ ', ' ██  '],
    K: ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
    L: ['█    ', '█    ', '█    ', '█    ', '█████'],
    M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    O: [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
    P: ['████ ', '█   █', '████ ', '█    ', '█    '],
    Q: [' ███ ', '█   █', '█ █ █', '█  █ ', ' ████'],
    R: ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
    S: [' ████', '█    ', ' ███ ', '    █', '████ '],
    T: ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    U: ['█   █', '█   █', '█   █', '█   █', ' ███ '],
    V: ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    X: ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    Z: ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    ' ': ['   ', '   ', '   ', '   ', '   '],
};

const SHADOW_GLYPHS: Record<string, string[]> = {
    A: ['  ██  ', ' █  █ ', '██████', '█    █', '█    █'],
    B: ['█████ ', '█    █', '█████ ', '█    █', '█████ '],
    C: [' █████', '█     ', '█     ', '█     ', ' █████'],
    D: ['█████ ', '█    █', '█    █', '█    █', '█████ '],
    E: ['██████', '█     ', '████  ', '█     ', '██████'],
    F: ['██████', '█     ', '████  ', '█     ', '█     '],
    G: [' █████', '█     ', '█  ███', '█    █', ' █████'],
    H: ['█    █', '█    █', '██████', '█    █', '█    █'],
    I: ['██████', '  ██  ', '  ██  ', '  ██  ', '██████'],
    J: ['██████', '    █ ', '    █ ', '█   █ ', ' ███  '],
    K: ['█   █ ', '█  █  ', '███   ', '█  █  ', '█   █ '],
    L: ['█     ', '█     ', '█     ', '█     ', '██████'],
    M: ['█    █', '██  ██', '█ ██ █', '█    █', '█    █'],
    N: ['█    █', '██   █', '█ █  █', '█  █ █', '█   ██'],
    O: [' ████ ', '█    █', '█    █', '█    █', ' ████ '],
    P: ['█████ ', '█    █', '█████ ', '█     ', '█     '],
    Q: [' ████ ', '█    █', '█  █ █', '█   █ ', ' █████'],
    R: ['█████ ', '█    █', '█████ ', '█  █  ', '█   █ '],
    S: [' █████', '█     ', ' ████ ', '     █', '█████ '],
    T: ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
    U: ['█    █', '█    █', '█    █', '█    █', ' ████ '],
    V: ['█    █', '█    █', ' █  █ ', ' █  █ ', '  ██  '],
    W: ['█    █', '█    █', '█ ██ █', '██  ██', '█    █'],
    X: ['█    █', ' █  █ ', '  ██  ', ' █  █ ', '█    █'],
    Y: ['█    █', ' █  █ ', '  ██  ', '  ██  ', '  ██  '],
    Z: ['██████', '   █  ', '  █   ', ' █    ', '██████'],
    ' ': ['     ', '     ', '     ', '     ', '     '],
};

const SLANT_GLYPHS: Record<string, string[]> = {
    A: ['    ██   ', '   ███  ', '  ██ ██ ', ' ██  ██ ', '██   ██ '],
    B: ['█████   ', '██  ██  ', '█████   ', '██  ██  ', '█████   '],
    C: ['  ████  ', ' ██     ', ' ██     ', ' ██     ', '  ████  '],
    D: ['████    ', '██  ██  ', '██   ██ ', '██  ██  ', '████    '],
    E: ['██████  ', '██      ', '████    ', '██      ', '██████  '],
    F: ['██████  ', '██      ', '████    ', '██      ', '██      '],
    G: ['  ████  ', ' ██     ', ' ██  ██ ', ' ██  ██ ', '  ███ █ '],
    H: ['██   ██ ', '██   ██ ', '███████ ', '██   ██ ', '██   ██ '],
    I: ['██████  ', '  ██    ', '  ██    ', '  ██    ', '██████  '],
    J: ['  █████ ', '    ██  ', '    ██  ', '██  ██  ', ' ████   '],
    K: ['██  ██  ', '██ ██   ', '████    ', '██ ██   ', '██  ██  '],
    L: ['██      ', '██      ', '██      ', '██      ', '██████  '],
    M: ['██   ██ ', '███ ███ ', '██ █ ██ ', '██   ██ ', '██   ██ '],
    N: ['██   ██ ', '███  ██ ', '██ █ ██ ', '██  ███ ', '██   ██ '],
    O: [' ████   ', '██  ██  ', '██  ██  ', '██  ██  ', ' ████   '],
    P: ['█████   ', '██  ██  ', '█████   ', '██      ', '██      '],
    Q: [' ████   ', '██  ██  ', '██  ██  ', '██ ███  ', ' ██████ '],
    R: ['█████   ', '██  ██  ', '█████   ', '██ ██   ', '██  ██  '],
    S: ['  ████  ', ' ██     ', '  ███   ', '    ██  ', ' ████   '],
    T: ['███████ ', '   ██   ', '   ██   ', '   ██   ', '   ██   '],
    U: ['██   ██ ', '██   ██ ', '██   ██ ', '██   ██ ', ' ████   '],
    V: ['██   ██ ', '██   ██ ', ' ███ ███', ' ███ ██ ', '  ██ ██ '],
    W: ['██   ██ ', '██   ██ ', '██ █ ██ ', '███ ███ ', '██   ██ '],
    X: ['██   ██ ', ' ███ ██ ', '  ███   ', ' ██ ███ ', '██   ██ '],
    Y: ['██   ██ ', ' ███ ██ ', '  ███   ', '  ██    ', '  ██    '],
    Z: ['███████ ', '   ███  ', '  ██    ', ' ███    ', '███████ '],
    ' ': ['       ', '       ', '       ', '       ', '       '],
};

const BANNER_GLYPHS: Record<string, string[]> = {
    A: ['  #   ', ' # #  ', '#####', '#   #', '#   #'],
    B: ['#### ', '#   #', '#### ', '#   #', '#### '],
    C: [' ####', '#    ', '#    ', '#    ', ' ####'],
    D: ['#### ', '#   #', '#   #', '#   #', '#### '],
    E: ['#####', '#    ', '#### ', '#    ', '#####'],
    F: ['#####', '#    ', '#### ', '#    ', '#    '],
    G: [' ####', '#    ', '#  ##', '#   #', ' ####'],
    H: ['#   #', '#   #', '#####', '#   #', '#   #'],
    I: ['#####', '  #  ', '  #  ', '  #  ', '#####'],
    J: ['#####', '   # ', '   # ', '#  # ', ' ##  '],
    K: ['#   #', '#  # ', '##   ', '#  # ', '#   #'],
    L: ['#    ', '#    ', '#    ', '#    ', '#####'],
    M: ['#   #', '## ##', '# # #', '#   #', '#   #'],
    N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
    O: [' ### ', '#   #', '#   #', '#   #', ' ### '],
    P: ['#### ', '#   #', '#### ', '#    ', '#    '],
    Q: [' ### ', '#   #', '# # #', '#  # ', ' ####'],
    R: ['#### ', '#   #', '#### ', '#  # ', '#   #'],
    S: [' ####', '#    ', ' ### ', '    #', '#### '],
    T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
    U: ['#   #', '#   #', '#   #', '#   #', ' ### '],
    V: ['#   #', '#   #', '#   #', ' # # ', '  #  '],
    W: ['#   #', '#   #', '# # #', '## ##', '#   #'],
    X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
    Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
    Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
    ' ': ['    ', '    ', '    ', '    ', '    '],
};

const DIGITAL_GLYPHS: Record<string, string[]> = {
    A: [' ██ ', '█  █', '████', '█  █', '█  █'],
    B: ['███ ', '█  █', '███ ', '█  █', '███ '],
    C: [' ██ ', '█  █', '█   ', '█  █', ' ██ '],
    D: ['███ ', '█  █', '█  █', '█  █', '███ '],
    E: ['████', '█   ', '███ ', '█   ', '████'],
    F: ['████', '█   ', '███ ', '█   ', '█   '],
    G: [' ██ ', '█   ', '█ ██', '█  █', ' ██ '],
    H: ['█  █', '█  █', '████', '█  █', '█  █'],
    I: ['███', ' █ ', ' █ ', ' █ ', '███'],
    J: ['████', '  █ ', '  █ ', '█ █ ', ' ██ '],
    K: ['█  █', '█ █ ', '██  ', '█ █ ', '█  █'],
    L: ['█   ', '█   ', '█   ', '█   ', '████'],
    M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    O: [' ██ ', '█  █', '█  █', '█  █', ' ██ '],
    P: ['███ ', '█  █', '███ ', '█   ', '█   '],
    Q: [' ██ ', '█  █', '█ ██', '█  █', ' ███'],
    R: ['███ ', '█  █', '███ ', '█ █ ', '█  █'],
    S: [' ███', '█   ', ' ██ ', '   █', '███ '],
    T: ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    U: ['█  █', '█  █', '█  █', '█  █', ' ██ '],
    V: ['█   █', '█   █', ' █ █ ', ' █ █ ', '  █  '],
    W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    X: ['█  █', '█  █', ' ██ ', '█  █', '█  █'],
    Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    Z: ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    ' ': ['   ', '   ', '   ', '   ', '   '],
};

const THICK_GLYPHS: Record<string, string[]> = {
    A: [' ███ ', '█   █', '█████', '█   █', '█   █'],
    B: ['█████', '█   █', '█████', '█   █', '█████'],
    C: [' █████', '█     ', '█     ', '█     ', ' █████'],
    D: ['█████ ', '█    █', '█    █', '█    █', '█████ '],
    E: ['██████', '█     ', '████  ', '█     ', '██████'],
    F: ['██████', '█     ', '████  ', '█     ', '█     '],
    G: [' █████', '█     ', '█  ███', '█    █', ' █████'],
    H: ['█    █', '█    █', '██████', '█    █', '█    █'],
    I: ['██████', '  ██  ', '  ██  ', '  ██  ', '██████'],
    J: ['██████', '    █ ', '    █ ', '█   █ ', ' ███  '],
    K: ['█   █ ', '█  █  ', '███   ', '█  █  ', '█   █ '],
    L: ['█     ', '█     ', '█     ', '█     ', '██████'],
    M: ['█    █', '██  ██', '█ ██ █', '█    █', '█    █'],
    N: ['█    █', '██   █', '█ █  █', '█  █ █', '█   ██'],
    O: [' ████ ', '█    █', '█    █', '█    █', ' ████ '],
    P: ['█████ ', '█    █', '█████ ', '█     ', '█     '],
    Q: [' ████ ', '█    █', '█ █  █', '█   █ ', ' █████'],
    R: ['█████ ', '█    █', '█████ ', '█  █  ', '█   █ '],
    S: [' █████', '█     ', ' ████ ', '     █', '█████ '],
    T: ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
    U: ['█    █', '█    █', '█    █', '█    █', ' ████ '],
    V: ['█    █', '█    █', '█    █', ' █  █ ', '  ██  '],
    W: ['█    █', '█    █', '█ ██ █', '██  ██', '█    █'],
    X: ['█    █', ' █  █ ', '  ██  ', ' █  █ ', '█    █'],
    Y: ['█    █', ' █  █ ', '  ██  ', '  ██  ', '  ██  '],
    Z: ['██████', '   █  ', '  █   ', ' █    ', '██████'],
    ' ': ['     ', '     ', '     ', '     ', '     '],
};

const SMALL_GLYPHS: Record<string, string[]> = {
    A: [' _ ', '| _|', '|_|'],
    B: ['|_ ', '|_|', '|_ '],
    C: [' _ ', '| ', '|_ '],
    D: ['|_ ', '| |', '|_ '],
    E: [' _ ', '|_ ', '|_ '],
    F: [' _ ', '|_ ', '| '],
    G: [' _ ', '| ', '|_|'],
    H: ['| |', '|_|', '| |'],
    I: [' _ ', ' | ', ' _ '],
    J: [' _ ', ' | ', '| '],
    K: ['| |', '|_', '| |'],
    L: ['| ', '| ', '|_ '],
    M: ['|  |', '|\\/|', '|  |'],
    N: ['|\\ |', '| \\|', '|  |'],
    O: [' _ ', '| |', '|_|'],
    P: ['|_ ', '|_|', '| '],
    Q: [' _ ', '| |', '|_|'],
    R: ['|_ ', '|_|', '| |'],
    S: [' _ ', '|_ ', ' _|'],
    T: [' _ ', ' | ', ' | '],
    U: ['| |', '| |', '|_|'],
    V: ['| |', '| |', ' v '],
    W: ['| |', '| |', '|W|'],
    X: ['| |', ' x ', '| |'],
    Y: ['| |', ' Y ', ' | '],
    Z: [' _ ', '/ ', '_ '],
    ' ': ['   ', '   ', '   '],
};

// ---------------------------------------------------------------------------
// ASCII banner style definitions
// ---------------------------------------------------------------------------

const ASCII_BANNER_STYLES: ArtStyle[] = [
    {
        id: 'banner-standard',
        name: 'Standard',
        category: 'ASCII Banner',
        description: 'Classic default ASCII art font',
        generate: (t) => renderGlyphFont(t, STANDARD_GLYPHS),
    },
    {
        id: 'banner-block',
        name: 'Block',
        category: 'ASCII Banner',
        description: 'Bold filled block letters',
        generate: (t) => renderGlyphFont(t, BLOCK_GLYPHS),
    },
    {
        id: 'banner-shadow',
        name: 'Shadow',
        category: 'ASCII Banner',
        description: 'Wide letters with shadow effect',
        generate: (t) => renderGlyphFont(t, SHADOW_GLYPHS),
    },
    {
        id: 'banner-slant',
        name: 'Slant',
        category: 'ASCII Banner',
        description: 'Italic slanted letters',
        generate: (t) => renderGlyphFont(t, SLANT_GLYPHS),
    },
    {
        id: 'banner-banner',
        name: 'Banner',
        category: 'ASCII Banner',
        description: 'Compact banner with # characters',
        generate: (t) => renderGlyphFont(t, BANNER_GLYPHS),
    },
    {
        id: 'banner-digital',
        name: 'Digital',
        category: 'ASCII Banner',
        description: 'LCD/dot-matrix display style',
        generate: (t) => renderGlyphFont(t, DIGITAL_GLYPHS),
    },
    {
        id: 'banner-thick',
        name: 'Thick',
        category: 'ASCII Banner',
        description: 'Heavy thick letters',
        generate: (t) => renderGlyphFont(t, THICK_GLYPHS),
    },
    {
        id: 'banner-small',
        name: 'Small',
        category: 'ASCII Banner',
        description: 'Compact 3-row small letters',
        generate: (t) => renderGlyphFont(t, SMALL_GLYPHS),
    },
    {
        id: 'banner-3d',
        name: '3D Block',
        category: 'ASCII Banner',
        description: 'Three-dimensional block effect',
        generate: (text) => {
            const base = renderGlyphFont(text, BLOCK_GLYPHS);
            return base
                .split('\n')
                .map((line) => line + '\n' + line.replace(/█/g, '▓').replace(/ /g, '░'))
                .join('\n');
        },
    },
    {
        id: 'banner-double-line',
        name: 'Double Line',
        category: 'ASCII Banner',
        description: 'Double-outline letters using ═║',
        generate: (text) => {
            const base = renderGlyphFont(text, STANDARD_GLYPHS);
            return base.replace(/█/g, '═');
        },
    },
    {
        id: 'banner-star',
        name: 'Star',
        category: 'ASCII Banner',
        description: 'Letters made of star characters ★',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '★'),
    },
    {
        id: 'banner-hash',
        name: 'Hash',
        category: 'ASCII Banner',
        description: 'Letters made of hash characters #',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '#'),
    },
    {
        id: 'banner-dot',
        name: 'Dot Matrix',
        category: 'ASCII Banner',
        description: 'Dot matrix printer style',
        generate: (text) => renderGlyphFont(text.toUpperCase(), DIGITAL_GLYPHS).replace(/█/g, '●'),
    },
    {
        id: 'banner-diamond',
        name: 'Diamond',
        category: 'ASCII Banner',
        description: 'Letters made of diamond chars ◆',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '◆'),
    },
    {
        id: 'banner-heart',
        name: 'Heart',
        category: 'ASCII Banner',
        description: 'Letters made of heart chars ♥',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '♥'),
    },
    {
        id: 'banner-circle',
        name: 'Circle',
        category: 'ASCII Banner',
        description: 'Letters made of circle chars ○',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '○'),
    },
    {
        id: 'banner-cross',
        name: 'Cross',
        category: 'ASCII Banner',
        description: 'Letters made of cross chars ✚',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '✚'),
    },
    {
        id: 'banner-spade',
        name: 'Spade',
        category: 'ASCII Banner',
        description: 'Letters made of spade chars ♠',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '♠'),
    },
    {
        id: 'banner-club',
        name: 'Club',
        category: 'ASCII Banner',
        description: 'Letters made of club chars ♣',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '♣'),
    },
    {
        id: 'banner-triangle',
        name: 'Triangle',
        category: 'ASCII Banner',
        description: 'Letters made of triangle chars ▲',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '▲'),
    },
    {
        id: 'banner-flower',
        name: 'Flower',
        category: 'ASCII Banner',
        description: 'Letters made of flower chars ✿',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '✿'),
    },
    {
        id: 'banner-lightning',
        name: 'Lightning',
        category: 'ASCII Banner',
        description: 'Letters made of lightning chars ⚡',
        generate: (text) =>
            renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '⚡'),
    },
    {
        id: 'banner-music',
        name: 'Music',
        category: 'ASCII Banner',
        description: 'Letters made of music chars ♫',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '♫'),
    },
    {
        id: 'banner-bullet',
        name: 'Bullet',
        category: 'ASCII Banner',
        description: 'Letters made of bullet chars •',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '•'),
    },
    {
        id: 'banner-dollar',
        name: 'Dollar',
        category: 'ASCII Banner',
        description: 'Letters made of dollar chars $',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '$'),
    },
    {
        id: 'banner-plus',
        name: 'Plus',
        category: 'ASCII Banner',
        description: 'Letters made of plus chars +',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '+'),
    },
    {
        id: 'banner-equals',
        name: 'Equals',
        category: 'ASCII Banner',
        description: 'Letters made of equals chars =',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '='),
    },
    {
        id: 'banner-shade-light',
        name: 'Light Shade',
        category: 'ASCII Banner',
        description: 'Letters using light shade chars ░',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '░'),
    },
    {
        id: 'banner-shade-medium',
        name: 'Medium Shade',
        category: 'ASCII Banner',
        description: 'Letters using medium shade chars ▒',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '▒'),
    },
    {
        id: 'banner-shade-dark',
        name: 'Dark Shade',
        category: 'ASCII Banner',
        description: 'Letters using dark shade chars ▓',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '▓'),
    },
    {
        id: 'banner-half-upper',
        name: 'Upper Half',
        category: 'ASCII Banner',
        description: 'Letters using upper half block chars ▀',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '▀'),
    },
    {
        id: 'banner-half-lower',
        name: 'Lower Half',
        category: 'ASCII Banner',
        description: 'Letters using lower half block chars ▄',
        generate: (text) => renderGlyphFont(text.toUpperCase(), STANDARD_GLYPHS).replace(/█/g, '▄'),
    },
];

// ---------------------------------------------------------------------------
// Text box generators
// ---------------------------------------------------------------------------

function boxSingle(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '┌' + '─'.repeat(maxLen + 2) + '┐';
    const bot = '└' + '─'.repeat(maxLen + 2) + '┘';
    const body = lines.map((l) => '│ ' + l.padEnd(maxLen) + ' │').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxDouble(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '╔' + '═'.repeat(maxLen + 2) + '╗';
    const bot = '╚' + '═'.repeat(maxLen + 2) + '╝';
    const body = lines.map((l) => '║ ' + l.padEnd(maxLen) + ' ║').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxRounded(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '╭' + '─'.repeat(maxLen + 2) + '╮';
    const bot = '╰' + '─'.repeat(maxLen + 2) + '╯';
    const body = lines.map((l) => '│ ' + l.padEnd(maxLen) + ' │').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxBold(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '┏' + '━'.repeat(maxLen + 2) + '┓';
    const bot = '┗' + '━'.repeat(maxLen + 2) + '┛';
    const body = lines.map((l) => '┃ ' + l.padEnd(maxLen) + ' ┃').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxStar(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '*' + '*'.repeat(maxLen + 2) + '*';
    const bot = '*' + '*'.repeat(maxLen + 2) + '*';
    const body = lines.map((l) => '* ' + l.padEnd(maxLen) + ' *').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxHash(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '#' + '#'.repeat(maxLen + 2) + '#';
    const bot = '#' + '#'.repeat(maxLen + 2) + '#';
    const body = lines.map((l) => '# ' + l.padEnd(maxLen) + ' #').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxDots(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '·' + '─'.repeat(maxLen + 2) + '·';
    const bot = '·' + '─'.repeat(maxLen + 2) + '·';
    const body = lines.map((l) => '│ ' + l.padEnd(maxLen) + ' │').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxArrow(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '▶' + '═'.repeat(maxLen + 2) + '◀';
    const bot = '▶' + '═'.repeat(maxLen + 2) + '◀';
    const body = lines.map((l) => '│ ' + l.padEnd(maxLen) + ' │').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxClassic(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '+' + '-'.repeat(maxLen + 2) + '+';
    const bot = '+' + '-'.repeat(maxLen + 2) + '+';
    const body = lines.map((l) => '| ' + l.padEnd(maxLen) + ' |').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxDashed(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '┌' + '╌'.repeat(maxLen + 2) + '┐';
    const bot = '└' + '╌'.repeat(maxLen + 2) + '┘';
    const body = lines.map((l) => '╎ ' + l.padEnd(maxLen) + ' ╎').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxMixed(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '╓' + '─'.repeat(maxLen + 2) + '╖';
    const bot = '╙' + '─'.repeat(maxLen + 2) + '╜';
    const body = lines.map((l) => '║ ' + l.padEnd(maxLen) + ' ║').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxSpeech(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '╭' + '─'.repeat(maxLen + 2) + '╮';
    const bot = '╰' + '─'.repeat(maxLen + 2) + '╯';
    const body = lines.map((l) => '│ ' + l.padEnd(maxLen) + ' │').join('\n');
    const tailPos = Math.max(1, Math.floor((maxLen + 4) / 3));
    const tail = ' '.repeat(tailPos) + '╰─◂';
    return `${top}\n${body}\n${bot}\n${tail}`;
}

function boxCode(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '┌' + '─'.repeat(maxLen + 2) + '┐';
    const bot = '└' + '─'.repeat(maxLen + 2) + '┘';
    const body = lines.map((l) => '│ ' + l.padEnd(maxLen) + ' │').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxDoubleH(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '╒' + '═'.repeat(maxLen + 2) + '╕';
    const bot = '╘' + '═'.repeat(maxLen + 2) + '╛';
    const body = lines.map((l) => '│ ' + l.padEnd(maxLen) + ' │').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxDoubleV(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '┌' + '─'.repeat(maxLen + 2) + '┐';
    const bot = '└' + '─'.repeat(maxLen + 2) + '┘';
    const body = lines.map((l) => '║ ' + l.padEnd(maxLen) + ' ║').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxThickDashed(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '┏' + '╌'.repeat(maxLen + 2) + '┓';
    const bot = '┗' + '╌'.repeat(maxLen + 2) + '┛';
    const body = lines.map((l) => '╎ ' + l.padEnd(maxLen) + ' ╎').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxWave(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '~' + '~'.repeat(maxLen + 2) + '~';
    const bot = '~' + '~'.repeat(maxLen + 2) + '~';
    const body = lines.map((l) => '| ' + l.padEnd(maxLen) + ' |').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxOrnate(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '❰' + '═'.repeat(maxLen + 2) + '❱';
    const bot = '❰' + '═'.repeat(maxLen + 2) + '❱';
    const body = lines.map((l) => '┃ ' + l.padEnd(maxLen) + ' ┃').join('\n');
    return `${top}\n${body}\n${bot}`;
}

function boxBrace(text: string): string {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map((l) => l.length));
    const top = '{' + '-'.repeat(maxLen + 2) + '}';
    const bot = '{' + '-'.repeat(maxLen + 2) + '}';
    const body = lines.map((l) => '| ' + l.padEnd(maxLen) + ' |').join('\n');
    return `${top}\n${body}\n${bot}`;
}

const TEXT_BOX_STYLES: ArtStyle[] = [
    {
        id: 'box-single',
        name: 'Single Border',
        category: 'Text Box',
        description: 'Single-line box drawing characters',
        generate: boxSingle,
    },
    {
        id: 'box-double',
        name: 'Double Border',
        category: 'Text Box',
        description: 'Double-line box drawing characters',
        generate: boxDouble,
    },
    {
        id: 'box-rounded',
        name: 'Rounded Border',
        category: 'Text Box',
        description: 'Rounded corner box drawing',
        generate: boxRounded,
    },
    {
        id: 'box-bold',
        name: 'Bold Border',
        category: 'Text Box',
        description: 'Bold/thick box drawing characters',
        generate: boxBold,
    },
    {
        id: 'box-star',
        name: 'Star Border',
        category: 'Text Box',
        description: 'Asterisk border around text',
        generate: boxStar,
    },
    {
        id: 'box-hash',
        name: 'Hash Border',
        category: 'Text Box',
        description: 'Hash/pound border around text',
        generate: boxHash,
    },
    {
        id: 'box-dots',
        name: 'Dotted Border',
        category: 'Text Box',
        description: 'Dotted border with corners',
        generate: boxDots,
    },
    {
        id: 'box-arrow',
        name: 'Arrow Border',
        category: 'Text Box',
        description: 'Arrow-headed border',
        generate: boxArrow,
    },
    {
        id: 'box-classic',
        name: 'Classic ASCII',
        category: 'Text Box',
        description: 'Classic ASCII box with + - |',
        generate: boxClassic,
    },
    {
        id: 'box-dashed',
        name: 'Dashed Border',
        category: 'Text Box',
        description: 'Dashed lines with ┌ ╌ ┐ corners',
        generate: boxDashed,
    },
    {
        id: 'box-mixed',
        name: 'Mixed Corners',
        category: 'Text Box',
        description: 'Double vertical with single horizontal',
        generate: boxMixed,
    },
    {
        id: 'box-speech',
        name: 'Speech Bubble',
        category: 'Text Box',
        description: 'Rounded box with speech tail',
        generate: boxSpeech,
    },
    {
        id: 'box-code',
        name: 'Code Block',
        category: 'Text Box',
        description: 'Clean code block border',
        generate: boxCode,
    },
    {
        id: 'box-double-h',
        name: 'Double Horizontal',
        category: 'Text Box',
        description: 'Double top/bottom ═ with single sides │',
        generate: boxDoubleH,
    },
    {
        id: 'box-double-v',
        name: 'Double Vertical',
        category: 'Text Box',
        description: 'Single top/bottom ─ with double sides ║',
        generate: boxDoubleV,
    },
    {
        id: 'box-thick-dashed',
        name: 'Thick Dashed',
        category: 'Text Box',
        description: 'Bold corners ┏┓ with dashed lines ╌',
        generate: boxThickDashed,
    },
    {
        id: 'box-wave',
        name: 'Wave Border',
        category: 'Text Box',
        description: 'Wavy ~ top and bottom border',
        generate: boxWave,
    },
    {
        id: 'box-ornate',
        name: 'Ornate Border',
        category: 'Text Box',
        description: 'Decorative border with ❰❱ corners',
        generate: boxOrnate,
    },
    {
        id: 'box-brace',
        name: 'Brace Border',
        category: 'Text Box',
        description: 'Curly brace { } cornered border',
        generate: boxBrace,
    },
];

// ---------------------------------------------------------------------------
// Unicode block art generators
// ---------------------------------------------------------------------------

const BLOCK_FONT: Record<string, string[]> = {
    A: [' ██ ', '█  █', '████', '█  █', '█  █'],
    B: ['███ ', '█  █', '███ ', '█  █', '███ '],
    C: [' ████', '█    ', '█    ', '█    ', ' ████'],
    D: ['███ ', '█  █', '█  █', '█  █', '███ '],
    E: ['████', '█   ', '███ ', '█   ', '████'],
    F: ['████', '█   ', '███ ', '█   ', '█   '],
    G: [' ████', '█    ', '█ ██', '█  █', ' ████'],
    H: ['█  █', '█  █', '████', '█  █', '█  █'],
    I: ['███', ' █ ', ' █ ', ' █ ', '███'],
    J: ['████', '   █', '   █', '█  █', ' ██ '],
    K: ['█  █', '█ █ ', '██  ', '█ █ ', '█  █'],
    L: ['█   ', '█   ', '█   ', '█   ', '████'],
    M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    O: [' ██ ', '█  █', '█  █', '█  █', ' ██ '],
    P: ['███ ', '█  █', '███ ', '█   ', '█   '],
    Q: [' ██ ', '█  █', '█ ██', '█  █', ' ███'],
    R: ['███ ', '█  █', '███ ', '█ █ ', '█  █'],
    S: [' ███', '█   ', ' ██ ', '   █', '███ '],
    T: ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    U: ['█  █', '█  █', '█  █', '█  █', ' ██ '],
    V: ['█   █', '█   █', ' █ █ ', ' █ █ ', '  █  '],
    W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    X: ['█  █', '█  █', ' ██ ', '█  █', '█  █'],
    Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    Z: ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    ' ': ['   ', '   ', '   ', '   ', '   '],
    '0': [' ██ ', '█ ██', '█ █ █', '██ █', ' ██ '],
    '1': [' █ ', '██ ', ' █ ', ' █ ', '███'],
    '2': [' ██ ', '█  █', '  █ ', ' █  ', '████'],
    '3': ['███ ', '   █', ' ██ ', '   █', '███ '],
    '4': ['█  █', '█  █', '████', '   █', '   █'],
    '5': ['████', '█   ', '███ ', '   █', '███ '],
    '6': [' ██ ', '█   ', '███ ', '█  █', ' ██ '],
    '7': ['████', '   █', '  █ ', ' █  ', '█   '],
    '8': [' ██ ', '█  █', ' ██ ', '█  █', ' ██ '],
    '9': [' ██ ', '█  █', ' ███', '   █', ' ██ '],
};

function generateBlockArt(text: string, block: string, empty: string): string {
    const chars = text.toUpperCase().split('');
    const rows: string[] = [];

    for (let row = 0; row < 5; row++) {
        let line = '';
        for (const ch of chars) {
            const glyph = BLOCK_FONT[ch];
            if (glyph) {
                line += (glyph[row] || '').replace(/█/g, block).replace(/ /g, empty) + empty;
            } else {
                line += empty.repeat(4);
            }
        }
        rows.push(line);
    }

    return rows.join('\n');
}

const UNICODE_BLOCK_STYLES: ArtStyle[] = [
    {
        id: 'block-full',
        name: 'Full Block',
        category: 'Unicode Block',
        description: 'Pixel art using full block chars █',
        generate: (t) => generateBlockArt(t, '█', ' '),
    },
    {
        id: 'block-light',
        name: 'Light Shade',
        category: 'Unicode Block',
        description: 'Pixel art using light shade ░',
        generate: (t) => generateBlockArt(t, '░', ' '),
    },
    {
        id: 'block-medium',
        name: 'Medium Shade',
        category: 'Unicode Block',
        description: 'Pixel art using medium shade ▒',
        generate: (t) => generateBlockArt(t, '▒', ' '),
    },
    {
        id: 'block-dark',
        name: 'Dark Shade',
        category: 'Unicode Block',
        description: 'Pixel art using dark shade ▓',
        generate: (t) => generateBlockArt(t, '▓', ' '),
    },
    {
        id: 'block-upper',
        name: 'Upper Half',
        category: 'Unicode Block',
        description: 'Pixel art using upper half blocks ▀',
        generate: (t) => generateBlockArt(t, '▀', ' '),
    },
    {
        id: 'block-lower',
        name: 'Lower Half',
        category: 'Unicode Block',
        description: 'Pixel art using lower half blocks ▄',
        generate: (t) => generateBlockArt(t, '▄', ' '),
    },
    {
        id: 'block-star',
        name: 'Star Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using star chars ★',
        generate: (t) => generateBlockArt(t, '★', ' '),
    },
    {
        id: 'block-heart',
        name: 'Heart Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using heart chars ♥',
        generate: (t) => generateBlockArt(t, '♥', ' '),
    },
    {
        id: 'block-square',
        name: 'Square Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using square chars ■',
        generate: (t) => generateBlockArt(t, '■', ' '),
    },
    {
        id: 'block-medium-square',
        name: 'Medium Square',
        category: 'Unicode Block',
        description: 'Pixel art using medium square ◾',
        generate: (t) => generateBlockArt(t, '◾', ' '),
    },
    {
        id: 'block-braille',
        name: 'Braille Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using braille chars ⣿',
        generate: (t) => generateBlockArt(t, '⣿', ' '),
    },
    {
        id: 'block-inverted',
        name: 'Inverted',
        category: 'Unicode Block',
        description: 'Negative pixel art — filled background',
        generate: (t) => generateBlockArt(t, ' ', '█'),
    },
    {
        id: 'block-small-square',
        name: 'Small Square',
        category: 'Unicode Block',
        description: 'Pixel art using small square chars ▪',
        generate: (t) => generateBlockArt(t, '▪', ' '),
    },
    {
        id: 'block-circle',
        name: 'Circle Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using filled circle chars ●',
        generate: (t) => generateBlockArt(t, '●', ' '),
    },
    {
        id: 'block-fisheye',
        name: 'Fisheye Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using fisheye chars ◉',
        generate: (t) => generateBlockArt(t, '◉', ' '),
    },
    {
        id: 'block-four-star',
        name: 'Four-Point Star',
        category: 'Unicode Block',
        description: 'Pixel art using four-point star chars ✦',
        generate: (t) => generateBlockArt(t, '✦', ' '),
    },
    {
        id: 'block-diamond',
        name: 'Diamond Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using diamond chars ◆',
        generate: (t) => generateBlockArt(t, '◆', ' '),
    },
    {
        id: 'block-flower',
        name: 'Flower Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using flower chars ✿',
        generate: (t) => generateBlockArt(t, '✿', ' '),
    },
    {
        id: 'block-lightning',
        name: 'Lightning Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using lightning chars ⚡',
        generate: (t) => generateBlockArt(t, '⚡', ' '),
    },
    {
        id: 'block-music',
        name: 'Music Pixel',
        category: 'Unicode Block',
        description: 'Pixel art using music chars ♫',
        generate: (t) => generateBlockArt(t, '♫', ' '),
    },
];

// ---------------------------------------------------------------------------
// Braille art generators
// ---------------------------------------------------------------------------

/**
 * Braille dot positions within a 2×4 cell:
 *   (0,0)=0x01  (1,0)=0x08
 *   (0,1)=0x02  (1,1)=0x10
 *   (0,2)=0x04  (1,2)=0x20
 *   (0,3)=0x40  (1,3)=0x80
 */
const BRAILLE_DOT_MAP: [number, number][][] = [
    [
        [0, 0x01],
        [1, 0x08],
    ],
    [
        [0, 0x02],
        [1, 0x10],
    ],
    [
        [0, 0x04],
        [1, 0x20],
    ],
    [
        [0, 0x40],
        [1, 0x80],
    ],
];

function generateBrailleArt(text: string, glyphs: Record<string, string[]>): string {
    const chars = text.toUpperCase().split('');
    const GLYPH_HEIGHT = glyphs === SMALL_GLYPHS ? 3 : 5;
    // Pad to nearest multiple of 4
    const targetHeight = Math.ceil(GLYPH_HEIGHT / 4) * 4;

    const brailleRows: string[] = [];

    for (let baseRow = 0; baseRow < targetHeight; baseRow += 4) {
        let brailleLine = '';

        for (const ch of chars) {
            const glyph = glyphs[ch] || glyphs[' '];
            if (!glyph) {
                brailleLine += '  ';
                continue;
            }

            const width = glyph[0]?.length ?? 0;
            const paddedWidth = Math.ceil(width / 2) * 2;

            // Scan 2 columns at a time
            for (let col = 0; col < paddedWidth; col += 2) {
                let brailleByte = 0;

                for (let dotRow = 0; dotRow < 4; dotRow++) {
                    const row = baseRow + dotRow;
                    const rowStr = row < GLYPH_HEIGHT ? glyph[row] || '' : '';

                    for (let dotCol = 0; dotCol < 2; dotCol++) {
                        const c = col + dotCol;
                        if (c < rowStr.length && rowStr[c] !== ' ') {
                            brailleByte |= BRAILLE_DOT_MAP[dotRow][dotCol][1];
                        }
                    }
                }

                brailleLine += String.fromCharCode(0x2800 + brailleByte);
            }

            brailleLine += ' ';
        }

        brailleRows.push(brailleLine.trimEnd());
    }

    return brailleRows.join('\n');
}

const BRAILLE_ART_STYLES: ArtStyle[] = [
    {
        id: 'braille-standard',
        name: 'Braille Standard',
        category: 'Braille Art',
        description: 'Braille dot art from standard font',
        generate: (t) => generateBrailleArt(t, STANDARD_GLYPHS),
    },
    {
        id: 'braille-block',
        name: 'Braille Block',
        category: 'Braille Art',
        description: 'Braille dot art from block font',
        generate: (t) => generateBrailleArt(t, BLOCK_GLYPHS),
    },
    {
        id: 'braille-digital',
        name: 'Braille Digital',
        category: 'Braille Art',
        description: 'Braille dot art from digital font',
        generate: (t) => generateBrailleArt(t, DIGITAL_GLYPHS),
    },
    {
        id: 'braille-small',
        name: 'Braille Small',
        category: 'Braille Art',
        description: 'Compact braille art from small font',
        generate: (t) => generateBrailleArt(t, SMALL_GLYPHS),
    },
    {
        id: 'braille-shadow',
        name: 'Braille Shadow',
        category: 'Braille Art',
        description: 'Braille dot art from wide shadow font',
        generate: (t) => generateBrailleArt(t, SHADOW_GLYPHS),
    },
    {
        id: 'braille-slant',
        name: 'Braille Slant',
        category: 'Braille Art',
        description: 'Braille dot art from italic slant font',
        generate: (t) => generateBrailleArt(t, SLANT_GLYPHS),
    },
    {
        id: 'braille-thick',
        name: 'Braille Thick',
        category: 'Braille Art',
        description: 'Braille dot art from heavy thick font',
        generate: (t) => generateBrailleArt(t, THICK_GLYPHS),
    },
    {
        id: 'braille-banner',
        name: 'Braille Banner',
        category: 'Braille Art',
        description: 'Braille dot art from compact banner font',
        generate: (t) => generateBrailleArt(t, BANNER_GLYPHS),
    },
];

// ---------------------------------------------------------------------------
// Export all styles combined
// ---------------------------------------------------------------------------

export const ART_STYLES: ArtStyle[] = [
    ...ASCII_BANNER_STYLES,
    ...TEXT_BOX_STYLES,
    ...UNICODE_BLOCK_STYLES,
    ...BRAILLE_ART_STYLES,
];

export const ART_CATEGORIES: ArtCategory[] = [
    'ASCII Banner',
    'Text Box',
    'Unicode Block',
    'Braille Art',
];
