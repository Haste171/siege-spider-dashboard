import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Paper,
    LinearProgress,
    Avatar,
    Chip,
    Tab,
    Tabs,
    CircularProgress,
    useTheme,
    SelectChangeEvent,
    Grid,
    CssBaseline,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Badge,
    Tooltip,
} from '@mui/material';
import {
    Person as PersonIcon,
    Gamepad as GamepadIcon,
    EmojiEvents as EmojiEventsIcon,
    Timer as TimerIcon,
    BarChart as BarChartIcon,
    Link as LinkIcon,
    Block as BlockIcon,
    Warning as WarningIcon,
    Launch as LaunchIcon,
} from '@mui/icons-material';
import { fetchWithAuth } from './utils/api';
import { useLocation, useNavigate } from 'react-router-dom';

// Interfaces
interface PlayerStats {
    max_rank_id: number;
    max_rank: string;
    max_rank_points: number;
    rank_id: number;
    rank: string;
    rank_points: number;
    prev_rank_points: number;
    next_rank_points: number;
    top_rank_position: number;
    season_id: number;
    season_code: string;
    kills: number;
    deaths: number;
    kill_death_ratio: number;
    wins: number;
    losses: number;
    win_loss_ratio: number;
    abandons: number;
}

interface LinkedAccount {
    profile_id: string;
    user_id: string;
    platform_type: string;
    id_on_platform: string;
    name_on_platform: string;
    info_link: string | null;
}

interface SiegeBanMetadata {
    id: string;
    source_application_id: string;
    date_posted: string;
    created_at: string;
    ban_id: string;
    notification_type: string;
    space_id: string;
    updated_at: string | null;
}

interface SiegeBan {
    uplay: string;
    psn: string;
    created_at: string;
    xbl: string;
    id: string;
    profile_id: string;
    ban_reason: number;
    updated_at: string | null;
    metadata?: SiegeBanMetadata[];
}

interface PlayerData {
    player: {
        name: string;
        profile_id: string;
        uuid: string;
        profile_pic_url: string;
        locker_link: string;
        linked_accounts: LinkedAccount[];
        persona: {
            tag: string;
            enabled: boolean;
            nickname: string;
        };
        playtime: {
            pvp_time_played: number;
            pve_time_played: number;
            total_time_played: number;
            total_time_played_hours: number;
        };
        progress: {
            level: number;
            xp: number;
            total_xp: number;
            xp_to_level_up: number;
        };
        stats: {
            ranked: PlayerStats;
            standard: PlayerStats;
            casual: PlayerStats;
            event: PlayerStats;
            warmup: PlayerStats;
        };
    };
    bans?: SiegeBan[];
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function StatsPanel({ stats }: { stats: PlayerStats }) {
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {stats.rank_id > 0 && (
                        <Box sx={{ mr: 2 }}>
                            <img
                                src={`/assets/ranks/rank_${stats.rank_id}.png`}
                                alt={stats.rank}
                                style={{ width: '80px', height: '80px' }}
                            />
                        </Box>
                    )}
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            {stats.rank === 'Unranked' ? 'Unranked' : stats.rank}
                        </Typography>
                        {stats.rank !== 'Unranked' && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary" mr={1}>
                                    MMR:
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {stats.rank_points}
                                </Typography>
                                {stats.rank !== 'Unranked' && (
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                        (Next: {stats.next_rank_points})
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" gutterBottom>
                        Season {stats.season_code}
                    </Typography>
                    {stats.max_rank !== 'Unranked' && (
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Max Rank: {stats.max_rank} ({stats.max_rank_points})
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Card variant="outlined" sx={{height: '100%', minHeight: '250px', minWidth: '350px'}}>
                    <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Win/Loss
                        </Typography>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 4}}>
                            <Box>
                                <Typography variant="h6">{stats.wins}</Typography>
                                <Typography variant="caption" color="text.secondary">Wins</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6">{stats.losses}</Typography>
                                <Typography variant="caption" color="text.secondary">Losses</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6">{stats.abandons}</Typography>
                                <Typography variant="caption" color="text.secondary">Abandons</Typography>
                            </Box>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                            <Typography variant="caption" fontWeight="bold">
                                {stats.wins + stats.losses > 0
                                    ? `${Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%`
                                    : 'N/A'}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={stats.wins + stats.losses > 0
                                ? (stats.wins / (stats.wins + stats.losses)) * 100
                                : 0}
                            sx={{height: 8, borderRadius: 5, mt: 1}}
                        />
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{height: '100%', minHeight: '250px', minWidth: '400px'}}>
                    <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Kill/Death
                        </Typography>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                            <Box>
                                <Typography variant="h4">{stats.kills}</Typography>
                                <Typography variant="body2" color="text.secondary">Kills</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h4">{stats.deaths}</Typography>
                                <Typography variant="body2" color="text.secondary">Deaths</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h4">{stats.kill_death_ratio.toFixed(2)}</Typography>
                                <Typography variant="body2" color="text.secondary">K/D Ratio</Typography>
                            </Box>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <Typography variant="body2" color="text.secondary">K/D Comparison</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {stats.kill_death_ratio >= 1 ? 'Positive' : 'Negative'}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(stats.kill_death_ratio * 50, 100)}
                            color={stats.kill_death_ratio >= 1 ? "success" : "warning"}
                            sx={{height: 8, borderRadius: 5, mt: 1}}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Box>
    );
}

export default function Lookup() {
    const [input, setInput] = useState('');
    const [type, setType] = useState<'uplay' | 'profile_id'>('uplay');
    const [data, setData] = useState<PlayerData | null>(null);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [metadata, setMetadata] = useState<{ [key: string]: SiegeBanMetadata[] }>({});
    const [loadingMetadata, setLoadingMetadata] = useState<{ [key: string]: boolean }>({});
    const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    useTheme();

    // Process URL parameters only once on component mount
    useEffect(() => {
        if (!urlParamsProcessed) {
            const params = new URLSearchParams(location.search);
            const typeParam = params.get('type');
            const idParam = params.get('id');

            if (typeParam && idParam) {
                if (typeParam === 'uplay' || typeParam === 'profile_id') {
                    setType(typeParam as 'uplay' | 'profile_id');
                    setInput(idParam);

                    // Use the separate function for URL parameter loading
                    fetchFromUrlParams(typeParam as 'uplay' | 'profile_id', idParam);
                }
            }

            setUrlParamsProcessed(true);
        }
    }, [location.search, urlParamsProcessed]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

    const handleTypeChange = (event: SelectChangeEvent) => {
        setType(event.target.value as 'uplay' | 'profile_id');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    // Special fetch function that doesn't update the URL (for URL parameter loading)
    const fetchFromUrlParams = async (searchType: 'uplay' | 'profile_id', searchInput: string) => {
        if (!searchInput) return;

        console.log(`Loading player from URL params: ${searchType}, ${searchInput}`);
        setLoading(true);
        setData(null);

        try {
            // Fetch player data
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/lookup/${searchType}/${searchInput}`;
            console.log(`Fetching from: ${apiUrl}`);

            const res = await fetchWithAuth(apiUrl);
            const playerData = await res.json();

            // Fetch ban data
            try {
                const banRes = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/lookup/bans/${searchInput}/${searchType}`);
                const banData = await banRes.json();

                // Combine player data with ban data
                setData({
                    ...playerData,
                    bans: banData.bans
                });
            } catch (banErr) {
                // If no bans are found, just use the player data
                console.log("No bans found or error fetching bans:", banErr);
                setData(playerData);
            }
        } catch (err) {
            console.error("Error fetching player data:", err);
            alert('Failed to fetch player data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBanMetadata = async (banId: string) => {
        if (!data || !input) return;

        // Update loading state for this specific ban
        setLoadingMetadata(prev => ({
            ...prev,
            [banId]: true
        }));

        try {
            // Direct API call
            const metadataUrl = `${import.meta.env.VITE_API_BASE_URL}/lookup/bans/${input}/${type}/metadata`;
            console.log(`Fetching metadata from: ${metadataUrl}`);

            const response = await fetchWithAuth(metadataUrl);
            const result = await response.json();

            console.log('Metadata API response:', result);

            if (result && result.metadata) {
                // Store the metadata keyed by ban ID
                const banMetadata = result.metadata.filter(
                    (meta: SiegeBanMetadata) => meta.ban_id === banId
                );

                setMetadata(prev => ({
                    ...prev,
                    [banId]: banMetadata
                }));

                console.log(`Successfully fetched ${banMetadata.length} metadata records for ban ID: ${banId}`);
            }
        } catch (error) {
            console.error('Error fetching ban metadata:', error);
            alert('Failed to fetch ban metadata. See console for details.');
        } finally {
            // Update loading state
            setLoadingMetadata(prev => ({
                ...prev,
                [banId]: false
            }));
        }
    };

    // Regular fetch function that updates the URL (for button click)
    const fetchPlayer = async () => {
        if (!input) return;

        console.log(`Fetching player: ${type}, ${input}`);
        setLoading(true);
        setData(null);

        try {
            // Fetch player data
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/lookup/${type}/${input}`;
            console.log(`Fetching from: ${apiUrl}`);

            const res = await fetchWithAuth(apiUrl);
            const playerData = await res.json();

            // Fetch ban data
            try {
                const banRes = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/lookup/bans/${input}/${type}`);
                const banData = await banRes.json();

                // Combine player data with ban data
                setData({
                    ...playerData,
                    bans: banData.bans
                });

                // Update URL after successful fetch
                navigate(`/lookup?type=${type}&id=${encodeURIComponent(input)}`, { replace: true });

            } catch (banErr) {
                // If no bans are found, just use the player data
                console.log("No bans found or error fetching bans:", banErr);
                setData(playerData);

                // Still update URL if player data was successful
                navigate(`/lookup?type=${type}&id=${encodeURIComponent(input)}`, { replace: true });
            }
        } catch (err) {
            console.error("Error fetching player data:", err);
            alert('Failed to fetch player data.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <>
            <CssBaseline/>
            <Box
                sx={{
                    width: '100%',
                    px: { xs: 2, sm: 3, md: 4 },
                    py: 2
                }}
            >
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        backgroundImage:
                            'linear-gradient(to right, rgba(45,45,45,0.95), rgba(45,45,45,0.95)), url(https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7qSZdEMRFLzLgiBDNmBUVP/fb4b112c8037c714230e863ade8a0b2f/r6s-header-mobile.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        boxShadow: 3,
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <GamepadIcon sx={{fontSize: 32, mr: 2, color: 'primary.main'}}/>
                        <Typography variant="h4">Rainbow Six Siege Player Lookup</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        Enter a player's Uplay name or profile ID to view their stats
                    </Typography>
                </Paper>

                <Paper sx={{p: 3, mb: 4, borderRadius: 2, boxShadow: 2}}>
                    <Grid container spacing={2} alignItems="center">
                        <FormControl fullWidth size="small">
                            <InputLabel id="lookup-type-label">Lookup Type</InputLabel>
                            <Select
                                labelId="lookup-type-label"
                                value={type}
                                label="Lookup Type"
                                onChange={handleTypeChange}
                            >
                                <MenuItem value="uplay">Uplay</MenuItem>
                                <MenuItem value="profile_id">Profile ID</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            size="small"
                            value={input}
                            onChange={handleInputChange}
                            placeholder={type === 'uplay' ? 'Enter Uplay Name' : 'Enter Profile ID'}
                            label={type === 'uplay' ? 'Uplay Name' : 'Profile ID'}
                            variant="outlined"
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={fetchPlayer}
                            disabled={loading || !input}
                            startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <PersonIcon />}
                        >
                            {loading ? 'Searching...' : 'Lookup Player'}
                        </Button>
                    </Grid>
                </Paper>

                {loading && (
                    <Box sx={{width: '100%', mb: 4}}>
                        <LinearProgress/>
                    </Box>
                )}

                {!loading && !data && (
                    <Box sx={{textAlign: 'center', py: 8}}>
                        <GamepadIcon sx={{fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.3}}/>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No player data to display
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter a Uplay username or Profile ID above to search for a player
                        </Typography>
                    </Box>
                )}

                {data && data.player && (
                    <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 3, width: '100%'}}>
                        <Box sx={{flex: {xs: '1 1 100%', md: '0 0 35%'}, height: {md: '750px'}}}>
                            <Card sx={{height: '100%', boxShadow: 3}}>
                                <CardHeader
                                    title="Player Profile"
                                    avatar={<PersonIcon color="primary"/>}
                                    sx={{borderBottom: 1, borderColor: 'divider', pb: 1}}
                                />
                                <CardContent>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                                        <Avatar
                                            src={data.player.profile_pic_url}
                                            alt={data.player.name}
                                            sx={{width: 80, height: 80, mr: 2, border: '2px solid', borderColor: 'primary.main'}}
                                        />
                                        <Box>
                                            <Typography variant="h6" gutterBottom>
                                                {data.player.name}
                                            </Typography>
                                            <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                                                <Chip
                                                    label={`Level ${data.player.progress.level}`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{mr: 1, mb: 1}}
                                                />
                                                {data.player.stats.ranked.rank !== 'Unranked' && (
                                                    <Chip
                                                        label={data.player.stats.ranked.rank}
                                                        size="small"
                                                        color="secondary"
                                                        sx={{mb: 1, mr: 1}}
                                                    />
                                                )}
                                                {data.bans && data.bans.length > 0 && (
                                                    <Tooltip title={`This player has ${data.bans.length} ban(s)`}>
                                                        <Chip
                                                            icon={<BlockIcon fontSize="small"/>}
                                                            label={`${data.bans.length} Ban${data.bans.length > 1 ? 's' : ''}`}
                                                            size="small"
                                                            color="error"
                                                            sx={{mb: 1}}
                                                        />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                            <Button
                                                component="a"
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                startIcon={<LaunchIcon />}
                                                href={data.player.locker_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ mt: 1 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(data.player.locker_link, '_blank', 'noopener,noreferrer');
                                                }}
                                            >
                                                View Locker
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Divider sx={{my: 2}}/>

                                    <Typography variant="subtitle2" gutterBottom color="primary">
                                        <TimerIcon fontSize="small" sx={{verticalAlign: 'middle', mr: 1}}/>
                                        Playtime
                                    </Typography>
                                    <Grid container spacing={1} sx={{mb: 2}}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">PvP</Typography>
                                            <Typography variant="body1">
                                                {formatTime(data.player.playtime.pvp_time_played)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">PvE</Typography>
                                            <Typography variant="body1">
                                                {formatTime(data.player.playtime.pve_time_played)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Total</Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {data.player.playtime.total_time_played_hours} hours
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Divider sx={{my: 2}}/>

                                    <Typography variant="subtitle2" gutterBottom color="primary">
                                        <BarChartIcon fontSize="small" sx={{verticalAlign: 'middle', mr: 1}}/>
                                        Progress
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Level Progress</Typography>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                        <Box sx={{width: '100%', mr: 1}}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(data.player.progress.xp / (data.player.progress.xp + data.player.progress.xp_to_level_up)) * 100}
                                                sx={{height: 8, borderRadius: 5}}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {Math.round((data.player.progress.xp / (data.player.progress.xp + data.player.progress.xp_to_level_up)) * 100)}%
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {data.player.progress.xp.toLocaleString()} / {(data.player.progress.xp + data.player.progress.xp_to_level_up).toLocaleString()} XP
                                        to Level {data.player.progress.level + 1}
                                    </Typography>

                                    <Divider sx={{my: 2}}/>

                                    <Typography variant="subtitle2" gutterBottom color="primary">
                                        <LinkIcon fontSize="small" sx={{verticalAlign: 'middle', mr: 1}}/>
                                        Linked Accounts
                                    </Typography>
                                    {data.player.linked_accounts.map((account, index) => (
                                        <Box key={index} sx={{mb: 1}}>
                                            <Typography variant="body2" color="text.secondary">
                                                {account.platform_type.toUpperCase()}
                                            </Typography>
                                            {account.info_link ? (
                                                <Button
                                                    component="a"
                                                    href={account.info_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    color="primary"
                                                    variant="text"
                                                    size="small"
                                                    endIcon={<LaunchIcon fontSize="small" />}
                                                    sx={{
                                                        p: 0,
                                                        minWidth: 'auto',
                                                        textTransform: 'none',
                                                        fontWeight: 'normal',
                                                        justifyContent: 'flex-start',
                                                        color: 'primary.main',
                                                        '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(account.info_link || '', '_blank', 'noopener,noreferrer');
                                                    }}
                                                >
                                                    {account.name_on_platform}
                                                </Button>
                                            ) : (
                                                <Typography variant="body2">
                                                    {account.name_on_platform}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Box>

                        <Box sx={{flex: {xs: '1 1 100%', md: '0 0 63.5%'}, height: {md: '750px'}}}>
                            <Card sx={{height: '100%', boxShadow: 3}}>
                                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                    <Tabs
                                        value={tabValue}
                                        onChange={handleTabChange}
                                        aria-label="player stats tabs"
                                        sx={{'& .MuiTab-root': {minWidth: 100}}}
                                    >
                                        <Tab label="Ranked" icon={<EmojiEventsIcon/>} iconPosition="start"/>
                                        <Tab label="Casual" icon={<GamepadIcon/>} iconPosition="start"/>
                                        <Tab label="Standard" icon={<BarChartIcon/>} iconPosition="start"/>
                                        {data.bans && data.bans.length > 0 && (
                                            <Tab
                                                label="Bans"
                                                icon={
                                                    <Badge badgeContent={data.bans.length} color="error">
                                                        <BlockIcon/>
                                                    </Badge>
                                                }
                                                iconPosition="start"
                                            />
                                        )}
                                    </Tabs>
                                </Box>

                                <TabPanel value={tabValue} index={0}>
                                    <StatsPanel stats={data.player.stats.ranked}/>
                                </TabPanel>

                                <TabPanel value={tabValue} index={1}>
                                    <StatsPanel stats={data.player.stats.casual}/>
                                </TabPanel>

                                <TabPanel value={tabValue} index={2}>
                                    <StatsPanel stats={data.player.stats.standard}/>
                                </TabPanel>

                                {data.bans && data.bans.length > 0 && (
                                    <TabPanel value={tabValue} index={3}>
                                        <Box>
                                            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                                                <WarningIcon color="error" sx={{fontSize: 32, mr: 2}}/>
                                                <Typography variant="h6" color="error">
                                                    Ban History
                                                </Typography>
                                            </Box>

                                            <TableContainer component={Paper} sx={{boxShadow: 2}}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow sx={{backgroundColor: 'background.default'}}>
                                                            <TableCell width="20%">Ban Date</TableCell>
                                                            <TableCell width="20%">Ban Reason</TableCell>
                                                            <TableCell width="20%">Platform</TableCell>
                                                            <TableCell width="40%">Status / Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {data.bans.map((ban, index) => {
                                                            // Convert ban reason code to readable text
                                                            const banReasonText = (() => {
                                                                switch (ban.ban_reason) {
                                                                    case 0:
                                                                        return "BattlEye";
                                                                    case 1:
                                                                        return "Toxicity";
                                                                    case 2:
                                                                        return "Boosting";
                                                                    case 3:
                                                                        return "DDoSing";
                                                                    case 4:
                                                                        return "Cheating";
                                                                    case 5:
                                                                        return "Botting";
                                                                    case 6:
                                                                        return "ToS Breach";
                                                                    default:
                                                                        return `Unknown (${ban.ban_reason})`;
                                                                }
                                                            })();

                                                            // Format date
                                                            const banDate = new Date(ban.created_at);
                                                            const formattedDate = banDate.toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            });

                                                            // Determine if ban is active or expired
                                                            const isActive = !ban.updated_at;

                                                            return (
                                                                <TableRow key={index} sx={{
                                                                    '&:nth-of-type(odd)': {backgroundColor: 'action.hover'},
                                                                    backgroundColor: isActive ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                                                                }}>
                                                                    <TableCell>{formattedDate}</TableCell>
                                                                    <TableCell>
                                                                        <Chip
                                                                            label={banReasonText}
                                                                            color={
                                                                                ban.ban_reason === 4 || ban.ban_reason === 3 || ban.ban_reason === 6 ? "error" :
                                                                                    ban.ban_reason === 1 ? "warning" :
                                                                                        "default"
                                                                            }
                                                                            size="small"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {ban.uplay && <Chip label="UPLAY" size="small" sx={{mr: 0.5}}/>}
                                                                        {ban.psn && <Chip label="PSN" size="small" sx={{mr: 0.5}}/>}
                                                                        {ban.xbl && <Chip label="XBOX" size="small"/>}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                            <Chip
                                                                                label={isActive ? "Active" : "Expired"}
                                                                                color={isActive ? "error" : "success"}
                                                                                size="small"
                                                                                sx={{mr: 1}}
                                                                            />
                                                                            <Button
                                                                                variant="outlined"
                                                                                size="small"
                                                                                onClick={() => fetchBanMetadata(ban.id)}
                                                                                disabled={!!loadingMetadata[ban.id]}
                                                                            >
                                                                                {loadingMetadata[ban.id] ? (
                                                                                    <>
                                                                                        <CircularProgress size={16} sx={{mr: 1}}/>
                                                                                        Loading...
                                                                                    </>
                                                                                ) : 'View Metadata'}
                                                                            </Button>
                                                                        </Box>

                                                                        {/* Display metadata if it exists for this ban */}
                                                                        {metadata[ban.id] && metadata[ban.id].length > 0 && (
                                                                            <Box sx={{
                                                                                mt: 2,
                                                                                p: 1,
                                                                                borderRadius: 1,
                                                                                bgcolor: 'background.paper',
                                                                                boxShadow: 1,
                                                                                width: '98%',
                                                                                ml: 1,
                                                                                fontSize: '0.9rem'
                                                                            }}>
                                                                                <Typography variant="subtitle2" gutterBottom
                                                                                            sx={{fontWeight: 'bold'}}>
                                                                                    Ban Metadata:
                                                                                </Typography>
                                                                                <TableContainer sx={{maxWidth: '100%'}}>
                                                                                    <Table size="small"
                                                                                           sx={{tableLayout: 'fixed', fontSize: '0.85rem'}}>
                                                                                        <TableHead>
                                                                                            <TableRow>
                                                                                                <TableCell width="30%" sx={{
                                                                                                    py: 0.5,
                                                                                                    fontWeight: 'bold'
                                                                                                }}>Property</TableCell>
                                                                                                <TableCell width="70%" sx={{
                                                                                                    py: 0.5,
                                                                                                    fontWeight: 'bold'
                                                                                                }}>Value</TableCell>
                                                                                            </TableRow>
                                                                                        </TableHead>
                                                                                        <TableBody>
                                                                                            {metadata[ban.id].map((meta, metaIndex) => (
                                                                                                <React.Fragment key={metaIndex}>
                                                                                                    <TableRow>
                                                                                                        <TableCell component="th" scope="row" sx={{py: 0.5}}>Source
                                                                                                            Application</TableCell>
                                                                                                        <TableCell sx={{
                                                                                                            wordBreak: 'break-word',
                                                                                                            py: 0.5
                                                                                                        }}>{meta.source_application_id}</TableCell>
                                                                                                    </TableRow>
                                                                                                    <TableRow>
                                                                                                        <TableCell component="th" scope="row" sx={{py: 0.5}}>Date
                                                                                                            Posted</TableCell>
                                                                                                        <TableCell sx={{py: 0.5}}>
                                                                                                            {new Date(meta.date_posted).toLocaleString()}</TableCell>
                                                                                                    </TableRow>
                                                                                                    <TableRow>
                                                                                                        <TableCell component="th" scope="row" sx={{py: 0.5}}>Notification
                                                                                                            Type</TableCell>
                                                                                                        <TableCell sx={{
                                                                                                            wordBreak: 'break-word',
                                                                                                            py: 0.5
                                                                                                        }}>{meta.notification_type}</TableCell>
                                                                                                    </TableRow>
                                                                                                    <TableRow>
                                                                                                        <TableCell component="th" scope="row" sx={{py: 0.5}}>Space
                                                                                                            ID</TableCell>
                                                                                                        <TableCell sx={{
                                                                                                            wordBreak: 'break-word',
                                                                                                            py: 0.5
                                                                                                        }}>{meta.space_id}</TableCell>
                                                                                                    </TableRow>
                                                                                                    <TableRow>
                                                                                                        <TableCell component="th" scope="row" sx={{py: 0.5}}>Created
                                                                                                            At</TableCell>
                                                                                                        <TableCell sx={{py: 0.5}}>
                                                                                                            {new Date(meta.created_at).toLocaleString()}</TableCell>
                                                                                                    </TableRow>
                                                                                                    <TableRow>
                                                                                                        <TableCell component="th" scope="row"
                                                                                                                   sx={{py: 0.5}}>ID</TableCell>
                                                                                                        <TableCell sx={{
                                                                                                            wordBreak: 'break-word',
                                                                                                            fontSize: '0.8rem',
                                                                                                            py: 0.5
                                                                                                        }}>{meta.id}</TableCell>
                                                                                                    </TableRow>
                                                                                                </React.Fragment>
                                                                                            ))}
                                                                                        </TableBody>
                                                                                    </Table>
                                                                                </TableContainer>
                                                                            </Box>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            <Box sx={{mt: 3}}>
                                                <Typography variant="body2" color="text.secondary">
                                                    This player has received {data.bans.length} ban(s) in total.
                                                    {data.bans.some(ban => !ban.updated_at) && (
                                                        <Typography component="span" color="error" sx={{fontWeight: 'bold', ml: 1}}>
                                                            One or more bans are currently active.
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TabPanel>
                                )}
                            </Card>
                        </Box>
                    </Box>
                )}
            </Box>
        </>
    );
}