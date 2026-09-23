import { createTheme } from '@mui/material/styles';

const fonts = {
  sans: "system-ui, 'Segoe UI', Roboto, sans-serif",
  mono: 'ui-monospace, Consolas, monospace',
};

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#aa3bff', contrastText: '#ffffff' },
        secondary: { main: '#5b21b6' },
        success: { main: '#16a34a' },
        error: { main: '#dc2626' },
        background: { default: '#ffffff', paper: '#ffffff' },
        text: { primary: '#6b6375', secondary: '#08060d' },
        divider: '#e5e4e7',
        codeBg: '#f4f3ec',
        socialBg: 'rgba(244, 243, 236, 0.5)',
        headBg: '#f3edff',
      },
    },
    dark: {
      palette: {
        primary: { main: '#aa3bff', contrastText: '#ffffff' },
        secondary: { main: '#5b21b6' },
        success: { main: '#4ade80' },
        error: { main: '#f87171' },
        background: { default: '#16171d', paper: '#16171d' },
        text: { primary: '#9ca3af', secondary: '#f3f4f6' },
        divider: '#2e303a',
        codeBg: '#1f2028',
        socialBg: 'rgba(47, 48, 58, 0.5)',
        headBg: '#2a1f4e',
      },
    },
  },
  typography: {
    fontFamily: fonts.sans,
    h1: {
      fontFamily: fonts.sans,
      fontWeight: 500,
      fontSize: '56px',
      letterSpacing: '-1.68px',
      margin: '32px 0',
    },
    h2: {
      fontFamily: fonts.sans,
      fontWeight: 500,
      fontSize: '24px',
      lineHeight: '118%',
      letterSpacing: '-0.24px',
      margin: '0 0 8px',
    },
  },
  shadows: [
    'none',
    'rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px',
    'rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => {
        const { palette } = themeParam;
        const shadow = themeParam.palette.mode === 'dark' ? 2 : 1;
        return {
          ':root': {
            '--text-h': palette.text.secondary,
            '--border': palette.divider,
            '--code-bg': palette.codeBg,
            '--social-bg': palette.socialBg,
            '--shadow': themeParam.shadows[shadow],
            '--heading': fonts.sans,
            '--mono': fonts.mono,
            letterSpacing: '0.18px',
            colorScheme: palette.mode,
            fontSynthesis: 'none',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          body: {
            margin: 0,
            lineHeight: '145%',
          },
          '@media (max-width: 1024px)': {
            h1: {
              fontSize: '36px',
              margin: '20px 0',
            },
            h2: {
              fontSize: '20px',
            },
          },
          'h1, h2': {
            fontFamily: 'var(--heading)',
            fontWeight: 500,
            color: 'var(--text-h)',
          },
          h1: {
            ...themeParam.typography.h1,
            fontFamily: 'var(--heading)',
          },
          h2: {
            ...themeParam.typography.h2,
            fontFamily: 'var(--heading)',
          },
          p: {
            margin: 0,
          },
          'code, .counter': {
            fontFamily: 'var(--mono)',
            display: 'inline-flex',
            borderRadius: '4px',
            color: 'var(--text-h)',
          },
          code: {
            fontSize: '15px',
            lineHeight: '135%',
            padding: '4px 8px',
            background: 'var(--code-bg)',
          },
        };
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: t.palette.background.paper,
          boxShadow: t.palette.mode === 'dark' ? t.shadows[2] : t.shadows[1],
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(170, 59, 255, 0.08)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          color: t.palette.text.primary,
          borderColor: t.palette.divider,
          padding: '8px',
        }),
        head: ({ theme: t }) => ({
          color: t.palette.text.primary,
          fontWeight: 700,
          backgroundColor: t.palette.headBg,
        }),
        sizeSmall: {
          padding: '6px 8px',
        },
        checkbox: {
          padding: '0 2px',
          width: 48,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td, &:last-child th': {
            border: 0,
          },
        },
      },
    },
  },
});

export default theme;
