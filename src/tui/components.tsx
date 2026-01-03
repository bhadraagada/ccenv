// TUI App - React/Ink based interactive UI
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { theme } from './theme.js';

// Types
interface SelectItem {
  label: string;
  value: string;
}

interface WizardStep {
  type: 'input' | 'password' | 'select' | 'confirm' | 'loading';
  message: string;
  choices?: SelectItem[];
  default?: string;
  validate?: (value: string) => string | true;
}

interface WizardProps {
  title: string;
  subtitle?: string;
  steps: WizardStep[];
  onComplete: (answers: Record<string, string>) => void;
  onCancel?: () => void;
}

// Header Component
export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box borderStyle="round" borderColor="cyan" paddingX={2}>
        <Text bold color="cyan">{title}</Text>
      </Box>
      {subtitle && (
        <Box marginLeft={2}>
          <Text dimColor>{subtitle}</Text>
        </Box>
      )}
    </Box>
  );
}

// Input Component
export function Input({ 
  label, 
  value, 
  onChange, 
  onSubmit, 
  mask,
  placeholder 
}: { 
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  mask?: string;
  placeholder?: string;
}) {
  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">? </Text>
        <Text bold>{label} </Text>
      </Box>
      <Box marginLeft={2}>
        <Text color="gray">{theme.symbols.arrowRight} </Text>
        <TextInput 
          value={value} 
          onChange={onChange} 
          onSubmit={onSubmit}
          mask={mask}
          placeholder={placeholder}
        />
      </Box>
    </Box>
  );
}

// Select Component
export function Select({ 
  label, 
  items, 
  onSelect 
}: { 
  label: string;
  items: SelectItem[];
  onSelect: (item: SelectItem) => void;
}) {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan">? </Text>
        <Text bold>{label}</Text>
      </Box>
      <SelectInput
        items={items}
        onSelect={onSelect}
        indicatorComponent={({ isSelected }) => (
          <Text color={isSelected ? 'cyan' : 'gray'}>
            {isSelected ? '❯ ' : '  '}
          </Text>
        )}
        itemComponent={({ isSelected, label }) => (
          <Text color={isSelected ? 'cyan' : 'white'}>
            {label}
          </Text>
        )}
      />
    </Box>
  );
}

// Confirm Component
export function Confirm({ 
  label, 
  onConfirm 
}: { 
  label: string;
  onConfirm: (value: boolean) => void;
}) {
  const [selected, setSelected] = useState(0);
  
  useInput((input, key) => {
    if (key.leftArrow || input === 'h') setSelected(0);
    if (key.rightArrow || input === 'l') setSelected(1);
    if (key.return) onConfirm(selected === 0);
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">? </Text>
        <Text bold>{label}</Text>
      </Box>
      <Box marginLeft={2} gap={2}>
        <Text 
          color={selected === 0 ? 'cyan' : 'gray'}
          bold={selected === 0}
        >
          {selected === 0 ? '❯ ' : '  '}Yes
        </Text>
        <Text 
          color={selected === 1 ? 'cyan' : 'gray'}
          bold={selected === 1}
        >
          {selected === 1 ? '❯ ' : '  '}No
        </Text>
      </Box>
    </Box>
  );
}

// Loading Component
export function Loading({ message }: { message: string }) {
  return (
    <Box>
      <Text color="cyan">
        <Spinner type="dots" />
      </Text>
      <Text> {message}</Text>
    </Box>
  );
}

// Success/Error Messages
export function Message({ 
  type, 
  message 
}: { 
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}) {
  const icons = {
    success: { icon: '✓', color: 'green' as const },
    error: { icon: '✗', color: 'red' as const },
    info: { icon: 'ℹ', color: 'cyan' as const },
    warning: { icon: '⚠', color: 'yellow' as const },
  };
  const { icon, color } = icons[type];
  
  return (
    <Box>
      <Text color={color}>{icon} </Text>
      <Text>{message}</Text>
    </Box>
  );
}

// Table Component
export function Table({ 
  headers, 
  rows, 
  columnWidths 
}: { 
  headers: string[];
  rows: string[][];
  columnWidths?: number[];
}) {
  const widths = columnWidths || headers.map((h, i) => {
    const maxRow = Math.max(...rows.map(r => (r[i] || '').length));
    return Math.max(h.length, maxRow);
  });

  return (
    <Box flexDirection="column">
      <Box>
        {headers.map((h, i) => (
          <Box key={i} width={widths[i] + 2}>
            <Text bold color="cyan">{h}</Text>
          </Box>
        ))}
      </Box>
      <Box>
        {widths.map((w, i) => (
          <Box key={i} width={w + 2}>
            <Text dimColor>{'─'.repeat(w)}</Text>
          </Box>
        ))}
      </Box>
      {rows.map((row, ri) => (
        <Box key={ri}>
          {row.map((cell, ci) => (
            <Box key={ci} width={widths[ci] + 2}>
              <Text>{cell}</Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

// Profile Card Component
export function ProfileCard({
  name,
  provider,
  model,
  baseUrl,
  isActive
}: {
  name: string;
  provider: string;
  model?: string;
  baseUrl: string;
  isActive?: boolean;
}) {
  return (
    <Box 
      flexDirection="column" 
      borderStyle="round" 
      borderColor={isActive ? 'green' : 'gray'}
      paddingX={2}
      paddingY={1}
      marginBottom={1}
    >
      <Box>
        <Text bold color={isActive ? 'green' : 'cyan'}>{name}</Text>
        {isActive && <Text color="green"> (active)</Text>}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Provider: </Text>
        <Text>{provider}</Text>
      </Box>
      {model && (
        <Box>
          <Text dimColor>Model:    </Text>
          <Text color="yellow">{model}</Text>
        </Box>
      )}
      <Box>
        <Text dimColor>URL:      </Text>
        <Text dimColor>{baseUrl}</Text>
      </Box>
    </Box>
  );
}

// Model List Item
export function ModelItem({
  id,
  context,
  price,
  isSelected
}: {
  id: string;
  context: string;
  price: string;
  isSelected?: boolean;
}) {
  return (
    <Box>
      <Text color={isSelected ? 'cyan' : 'white'}>
        {isSelected ? '❯ ' : '  '}
      </Text>
      <Box width={42}>
        <Text color={isSelected ? 'cyan' : 'white'}>{id}</Text>
      </Box>
      <Box width={10}>
        <Text dimColor>{context}</Text>
      </Box>
      <Text color="green">{price}</Text>
    </Box>
  );
}

// Export render helper
export { render };
