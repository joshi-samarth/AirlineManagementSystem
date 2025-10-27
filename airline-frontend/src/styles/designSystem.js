// src/styles/designSystem.js
// Professional Minimalist Design System for SkyBook Airlines

export const colors = {
  // Primary Slate Blue
  primary: {
    main: '#2563eb',      // Main interactive blue
    dark: '#1e40af',      // Dark blue (hover)
    light: '#3b82f6',     // Light blue (accents)
    lightest: '#dbeafe',  // Very light blue (backgrounds)
  },
  
  // Neutral Gray Scale
  neutral: {
    white: '#ffffff',     // White (main background)
    50: '#f8fafc',        // Very light gray (secondary bg)
    100: '#f1f5f9',       // Light gray (subtle bg)
    200: '#e2e8f0',       // Medium-light gray (borders)
    300: '#cbd5e1',       // Medium gray (dividers)
    400: '#94a3b8',       // Medium-dark gray (secondary text)
    500: '#64748b',       // Dark gray (secondary text)
    900: '#0f172a',       // Very dark gray (primary text)
  },
  
  // Semantic Colors
  success: '#16a34a',    // Success (green)
  error: '#dc2626',      // Error (red)
  warning: '#ea580c',    // Warning (orange)
};

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
  },
  fontSize: {
    xs: '0.75rem',       // 12px
    sm: '0.875rem',      // 14px
    base: '1rem',        // 16px
    lg: '1.125rem',      // 18px
    xl: '1.25rem',       // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
    '4xl': '2.25rem',    // 36px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
};

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '36px',
      md: '44px',
      lg: '52px',
    },
    padding: {
      sm: '8px 16px',
      md: '12px 24px',
      lg: '16px 32px',
    },
  },
  input: {
    height: '44px',
    padding: '12px 14px',
    borderWidth: '1px',
    focusBorderWidth: '2px',
  },
  card: {
    padding: '24px',
    borderWidth: '1px',
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  components,
};