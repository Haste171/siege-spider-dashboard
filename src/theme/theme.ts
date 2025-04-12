// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

// Rainbow Six Siege inspired color palette
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4EA5DC', // Blue from R6S
      light: '#6BB5E3',
      dark: '#3182B8',
    },
    secondary: {
      main: '#F4B400', // Yellow accent from R6S
      light: '#FFCD4D',
      dark: '#C89000',
    },
    background: {
      default: '#1A1A1A',
      paper: '#2D2D2D',
    },
    error: {
      main: '#F44336',
    },
    success: {
      main: '#43A047',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.2rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '1.8rem',
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          backgroundColor: '#2D2D2D',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#3182B8',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#1D1D1D',
        },
      },
    },
  },
});

export default theme;