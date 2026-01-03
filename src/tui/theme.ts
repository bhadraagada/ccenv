// TUI Theme - hauktui-inspired design tokens
import chalk from 'chalk';

export const theme = {
  colors: {
    primary: chalk.cyan,
    secondary: chalk.gray,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    muted: chalk.dim,
    accent: chalk.magenta,
    highlight: chalk.bgCyan.black,
  },
  text: {
    title: chalk.bold.cyan,
    subtitle: chalk.dim,
    label: chalk.white,
    value: chalk.cyan,
    hint: chalk.dim.italic,
  },
  border: {
    normal: chalk.gray,
    active: chalk.cyan,
  },
  symbols: {
    check: '✓',
    cross: '✗',
    arrow: '→',
    arrowRight: '❯',
    arrowDown: '▼',
    bullet: '•',
    line: '─',
    corner: {
      topLeft: '╭',
      topRight: '╮',
      bottomLeft: '╰',
      bottomRight: '╯',
    },
    vertical: '│',
    spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  },
};

// ASCII Art fonts for banner
const fonts = {
  block: {
    A: ['█████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
    B: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██████╔╝', '╚═════╝ '],
    C: ['██████╗', '██╔════╝', '██║     ', '██║     ', '╚██████╗', ' ╚═════╝'],
    D: ['██████╗ ', '██╔══██╗', '██║  ██║', '██║  ██║', '██████╔╝', '╚═════╝ '],
    E: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '███████╗', '╚══════╝'],
    F: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '██║     ', '╚═╝     '],
    G: ['██████╗ ', '██╔════╝ ', '██║  ███╗', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
    H: ['██╗  ██╗', '██║  ██║', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
    I: ['██╗', '██║', '██║', '██║', '██║', '╚═╝'],
    J: ['     ██╗', '     ██║', '     ██║', '██   ██║', '╚█████╔╝', ' ╚════╝ '],
    K: ['██╗  ██╗', '██║ ██╔╝', '█████╔╝ ', '██╔═██╗ ', '██║  ██╗', '╚═╝  ╚═╝'],
    L: ['██╗     ', '██║     ', '██║     ', '██║     ', '███████╗', '╚══════╝'],
    M: ['███╗   ███╗', '████╗ ████║', '██╔████╔██║', '██║╚██╔╝██║', '██║ ╚═╝ ██║', '╚═╝     ╚═╝'],
    N: ['███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝'],
    O: ['██████╗ ', '██╔═══██╗', '██║   ██║', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
    P: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔═══╝ ', '██║     ', '╚═╝     '],
    Q: ['██████╗ ', '██╔═══██╗', '██║   ██║', '██║▄▄ ██║', '╚██████╔╝', ' ╚══▀▀═╝ '],
    R: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██║  ██║', '╚═╝  ╚═╝'],
    S: ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
    T: ['████████╗', '╚══██╔══╝', '   ██║   ', '   ██║   ', '   ██║   ', '   ╚═╝   '],
    U: ['██╗   ██╗', '██║   ██║', '██║   ██║', '██║   ██║', '╚██████╔╝', ' ╚═════╝ '],
    V: ['██╗   ██╗', '██║   ██║', '██║   ██║', '╚██╗ ██╔╝', ' ╚████╔╝ ', '  ╚═══╝  '],
    W: ['██╗    ██╗', '██║    ██║', '██║ █╗ ██║', '██║███╗██║', '╚███╔███╔╝', ' ╚══╝╚══╝ '],
    X: ['██╗  ██╗', '╚██╗██╔╝', ' ╚███╔╝ ', ' ██╔██╗ ', '██╔╝ ██╗', '╚═╝  ╚═╝'],
    Y: ['██╗   ██╗', '╚██╗ ██╔╝', ' ╚████╔╝ ', '  ╚██╔╝  ', '   ██║   ', '   ╚═╝   '],
    Z: ['███████╗', '╚══███╔╝', '  ███╔╝ ', ' ███╔╝  ', '███████╗', '╚══════╝'],
    ' ': ['   ', '   ', '   ', '   ', '   ', '   '],
    '-': ['      ', '      ', '█████╗', '╚════╝', '      ', '      '],
  } as Record<string, string[]>,
  small: {
    A: ['▄▀█', '█▀█'],
    B: ['█▄▄', '█▄█'],
    C: ['█▀▀', '█▄▄'],
    D: ['█▀▄', '█▄▀'],
    E: ['█▀▀', '██▄'],
    F: ['█▀▀', '█▀ '],
    G: ['█▀▀', '█▄█'],
    H: ['█ █', '█▀█'],
    I: ['█', '█'],
    J: [' █', '█▄'],
    K: ['█▄▀', '█ █'],
    L: ['█  ', '█▄▄'],
    M: ['█▀▄▀█', '█ ▀ █'],
    N: ['█▀█', '█ █'],
    O: ['█▀█', '█▄█'],
    P: ['█▀█', '█▀▀'],
    Q: ['█▀█', '▀▀█'],
    R: ['█▀█', '█▀▄'],
    S: ['█▀', '▄█'],
    T: ['▀█▀', ' █ '],
    U: ['█ █', '█▄█'],
    V: ['█ █', '▀▄▀'],
    W: ['█ █ █', '▀▄▀▄▀'],
    X: ['▀▄▀', '█ █'],
    Y: ['█▄█', ' █ '],
    Z: ['▀█', '█▄'],
    ' ': ['  ', '  '],
    '-': ['   ', '▀▀▀'],
  } as Record<string, string[]>,
  mini: {
    A: ['█▀█', '█▀█'],
    B: ['█▀▄', '█▀█'],
    C: ['█▀▀', '█▄▄'],
    D: ['█▀▄', '█▄▀'],
    E: ['█▀▀', '██▄'],
    F: ['█▀▀', '█▀ '],
    G: ['█▀▀', '█▄█'],
    H: ['█ █', '█▀█'],
    I: ['█', '█'],
    J: [' █', '█▄'],
    K: ['█▀▄', '█ █'],
    L: ['█  ', '█▄▄'],
    M: ['█▄█', '█ █'],
    N: ['█▀█', '█ █'],
    O: ['█▀█', '█▄█'],
    P: ['█▀█', '█▀▀'],
    Q: ['█▀█', '▀▀█'],
    R: ['█▀█', '█▀▄'],
    S: ['█▀', '▄█'],
    T: ['▀█▀', ' █ '],
    U: ['█ █', '█▄█'],
    V: ['█ █', '▀▄▀'],
    W: ['█ █', '▀▄▀'],
    X: ['▀▄▀', '█ █'],
    Y: ['█▄█', ' █ '],
    Z: ['▀█', '█▄'],
    ' ': [' ', ' '],
    '-': ['  ', '▀▀'],
  } as Record<string, string[]>,
};

export type BannerFont = 'block' | 'small' | 'mini';
export type BannerVariant = 'default' | 'box' | 'gradient';

export interface BannerOptions {
  font?: BannerFont;
  variant?: BannerVariant;
  color?: typeof chalk;
  gradientColors?: (typeof chalk)[];
  subtitle?: string;
  center?: boolean;
}

export function banner(text: string, options: BannerOptions = {}): string {
  const {
    font = 'block',
    variant = 'default',
    color = theme.colors.primary,
    gradientColors,
    subtitle,
    center = true,
  } = options;

  const fontData = fonts[font];
  const chars = text.toUpperCase().split('');
  const height = font === 'block' ? 6 : 2;
  
  // Build each line of the banner
  const lines: string[] = [];
  for (let row = 0; row < height; row++) {
    let line = '';
    for (const char of chars) {
      const charData = fontData[char] || fontData[' '];
      line += (charData[row] || '') + ' ';
    }
    lines.push(line.trimEnd());
  }

  // Apply color/gradient
  let coloredLines: string[];
  if (gradientColors && gradientColors.length >= 2) {
    // Apply gradient from top to bottom
    coloredLines = lines.map((line, i) => {
      const colorIndex = Math.floor((i / (height - 1)) * (gradientColors.length - 1));
      return gradientColors[Math.min(colorIndex, gradientColors.length - 1)](line);
    });
  } else {
    coloredLines = lines.map(line => color(line));
  }

  // Center if requested
  if (center) {
    const maxWidth = Math.max(...lines.map(l => l.length));
    const termWidth = process.stdout.columns || 80;
    const padding = Math.max(0, Math.floor((termWidth - maxWidth) / 2));
    coloredLines = coloredLines.map(line => ' '.repeat(padding) + line);
  }

  // Add subtitle
  if (subtitle) {
    const subtitleLine = center 
      ? ' '.repeat(Math.max(0, Math.floor(((process.stdout.columns || 80) - subtitle.length) / 2))) + theme.text.subtitle(subtitle)
      : theme.text.subtitle(subtitle);
    coloredLines.push('');
    coloredLines.push(subtitleLine);
  }

  // Wrap in box if requested
  if (variant === 'box') {
    const maxWidth = Math.max(...lines.map(l => l.length)) + 4;
    const boxWidth = Math.min(maxWidth, (process.stdout.columns || 80) - 4);
    
    const topBorder = theme.border.active(theme.symbols.corner.topLeft + theme.symbols.line.repeat(boxWidth) + theme.symbols.corner.topRight);
    const bottomBorder = theme.border.active(theme.symbols.corner.bottomLeft + theme.symbols.line.repeat(boxWidth) + theme.symbols.corner.bottomRight);
    
    const boxedLines = coloredLines.map(line => {
      const stripped = stripAnsi(line);
      const padding = boxWidth - stripped.length;
      return theme.border.active(theme.symbols.vertical) + ' ' + line + ' '.repeat(Math.max(0, padding - 1)) + theme.border.active(theme.symbols.vertical);
    });
    
    return ['', topBorder, ...boxedLines, bottomBorder, ''].join('\n');
  }

  return ['', ...coloredLines, ''].join('\n');
}

// CCX specific banner
export function ccxBanner(showSubtitle = true): string {
  return banner('CCX', {
    font: 'block',
    gradientColors: [chalk.cyan, chalk.blue, chalk.magenta],
    subtitle: showSubtitle ? 'Claude Code Environment Switcher' : undefined,
    center: true,
  });
}

// Smaller banner for headers
export function ccxHeader(subtitle?: string): string {
  return banner('CCX', {
    font: 'small',
    color: theme.colors.primary,
    subtitle,
    center: false,
  });
}

export function box(title: string, content: string, width = 50): string {
  const { corner, vertical, line } = theme.symbols;
  const border = theme.border.normal;
  
  const innerWidth = width - 2;
  const titleText = title ? ` ${title} ` : '';
  const topBorder = corner.topLeft + 
    line.repeat(Math.floor((innerWidth - titleText.length) / 2)) + 
    theme.text.title(titleText) +
    line.repeat(Math.ceil((innerWidth - titleText.length) / 2)) + 
    corner.topRight;
  
  const lines = content.split('\n').map(l => {
    const padding = innerWidth - stripAnsi(l).length;
    return border(vertical) + ' ' + l + ' '.repeat(Math.max(0, padding - 1)) + border(vertical);
  });
  
  const bottomBorder = border(corner.bottomLeft + line.repeat(innerWidth) + corner.bottomRight);
  
  return [border(topBorder), ...lines, bottomBorder].join('\n');
}

export function table(headers: string[], rows: string[][], columnWidths?: number[]): string {
  const { line } = theme.symbols;
  const border = theme.border.normal;
  
  // Calculate column widths
  const widths = columnWidths || headers.map((h, i) => {
    const maxRow = Math.max(...rows.map(r => stripAnsi(r[i] || '').length));
    return Math.max(stripAnsi(h).length, maxRow);
  });
  
  const headerRow = headers.map((h, i) => 
    theme.text.title(h.padEnd(widths[i]))
  ).join('  ');
  
  const separator = border(widths.map(w => line.repeat(w)).join('──'));
  
  const dataRows = rows.map(row => 
    row.map((cell, i) => cell.padEnd(widths[i])).join('  ')
  );
  
  return [headerRow, separator, ...dataRows].join('\n');
}

export function keyValue(items: Array<{ key: string; value: string }>, keyWidth = 15): string {
  return items.map(({ key, value }) => 
    theme.text.label(key.padEnd(keyWidth)) + theme.text.value(value)
  ).join('\n');
}

export function badge(text: string, variant: 'success' | 'warning' | 'error' | 'info' = 'info'): string {
  const colors = {
    success: chalk.bgGreen.black,
    warning: chalk.bgYellow.black,
    error: chalk.bgRed.white,
    info: chalk.bgCyan.black,
  };
  return colors[variant](` ${text} `);
}

export function spinner(frame: number): string {
  return theme.colors.primary(theme.symbols.spinner[frame % theme.symbols.spinner.length]);
}

export function success(message: string): string {
  return theme.colors.success(theme.symbols.check) + ' ' + message;
}

export function error(message: string): string {
  return theme.colors.error(theme.symbols.cross) + ' ' + message;
}

export function info(message: string): string {
  return theme.colors.primary('ℹ') + ' ' + theme.text.hint(message);
}

export function header(title: string, subtitle?: string): string {
  const lines = [
    '',
    theme.text.title(`  ${title}`),
  ];
  if (subtitle) {
    lines.push(theme.text.subtitle(`  ${subtitle}`));
  }
  lines.push('');
  return lines.join('\n');
}

export function divider(width = 50): string {
  return theme.border.normal(theme.symbols.line.repeat(width));
}

// Strip ANSI codes for length calculation
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}
