import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Paper,
    Alert
} from '@mui/material';
import { Gamepad as GamepadIcon } from '@mui/icons-material';
import { useAuth } from './contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the intended destination from the location state or default to home
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Login failed');
            }

            const data = await response.json();
            login(data.access_token);
            navigate(from, {replace: true});
        } catch (err: unknown) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                px: { xs: 2, sm: 3, md: 4 },
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 64px)' // Subtract navbar height
            }}
        >
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    maxWidth: 500,
                    width: '100%',
                    backgroundImage:
                        'linear-gradient(to right, rgba(45,45,45,0.95), rgba(45,45,45,0.95)), url(https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7qSZdEMRFLzLgiBDNmBUVP/fb4b112c8037c714230e863ade8a0b2f/r6s-header-mobile.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: 3,
                }}
            >
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <GamepadIcon sx={{fontSize: 32, mr: 2, color: 'primary.main'}}/>
                    <Typography variant="h4">R6S Spider Login</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Please log in to access the application
                </Typography>
            </Paper>

            <Card sx={{ maxWidth: 500, width: '100%' }}>
                <CardContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            InputProps={{
                                autoComplete: 'email'
                            }}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            InputProps={{
                                autoComplete: 'current-password'
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ mt: 3 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}