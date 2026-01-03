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
