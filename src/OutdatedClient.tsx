import { useState } from 'react';
import {
    Box,
    Typography,
    CssBaseline,
    Paper,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

export default function OutdatedClient() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/version`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.download_url) {
                // Open the download URL in a new tab
                window.open(data.download_url, '_blank', 'noopener,noreferrer');
            } else {
                throw new Error('Download URL not found in response');
            }
        } catch (err) {
            console.error('Error fetching download URL:', err);
            setError(err instanceof Error ? err.message : 'Failed to get download URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    px: 3,
                }}
            >
                <Paper elevation={4} sx={{ p: 4, borderRadius: 2, maxWidth: 600, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom color="error">
                        Update Required
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                        Your client version is outdated and no longer supported.
                        Please update to the latest version to continue using Siege Spider.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                        onClick={handleDownload}
                        disabled={loading}
                        sx={{
                            minWidth: 200,
                            py: 1.5,
                            fontSize: '1.1rem',
                            textTransform: 'none',
                        }}
                    >
                        {loading ? 'Getting Download...' : 'Download Latest Version'}
                    </Button>

                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                        The download will open in a new tab
                    </Typography>
                </Paper>
            </Box>
        </>
    );
}