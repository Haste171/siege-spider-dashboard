import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './Navbar';
import Lookup from './Lookup';
import Bans from './Bans';
import Login from './Login';
import Match from './Match'; // Import the Match component
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Custom R6S-inspired theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4D9DE0', // R6S blue accent
    },
    secondary: {
      main: '#E56B1F', // R6S orange accent
    },
    background: {
      default: '#1e1e1e',
      paper: '#2d2d2d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#2d2d2d',
        },
      },
    },
  },
});

// Custom Route guard to check if we're on a valid path with parameters before redirecting
function CustomRedirect() {
  const location = useLocation();

  // Don't redirect if we're on lookup with parameters
  if (location.pathname === '/lookup' && location.search.includes('?')) {
    return (
        <ProtectedRoute>
          <Lookup />
        </ProtectedRoute>
    );
  }

  // Don't redirect if we're on match with parameters
  if (location.pathname === '/match' && location.search.includes('?')) {
    return (
        <ProtectedRoute>
          <Match />
        </ProtectedRoute>
    );
  }

  // Otherwise redirect to home
  return <Navigate to="/" replace />;
}

function App() {
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              width: '100%',
              overflowX: 'hidden'
            }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Lookup />
                    </ProtectedRoute>
                  } />
                  <Route path="/bans" element={
                    <ProtectedRoute>
                      <Bans />
                    </ProtectedRoute>
                  } />
                  <Route path="/lookup" element={
                    <ProtectedRoute>
                      <Lookup />
                    </ProtectedRoute>
                  } />
                  <Route path="/match" element={
                    <ProtectedRoute>
                      <Match />
                    </ProtectedRoute>
                  } />
                  {/* Custom catch-all that checks for valid routes with parameters */}
                  <Route path="*" element={<CustomRedirect />} />
                </Routes>
              </div>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;