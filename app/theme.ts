import { createTheme } from '@mui/material/styles';
export const theme = createTheme({
  cssVariables: true,
  colorSchemes: { light: true, dark: false },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-.045em' },
    h2: { fontWeight: 800, letterSpacing: '-.035em' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  palette: {
    primary: { main: '#1740c4', contrastText: '#fff' },
    secondary: { main: '#7c5cff' },
    background: { default: '#f5f7fb', paper: '#fff' },
    text: { primary: '#172b4d', secondary: '#536581' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: { styleOverrides: { root: { boxShadow: '0 8px 28px rgba(34, 52, 88, .06)' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
