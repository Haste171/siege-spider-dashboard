import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    LinearProgress,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    CssBaseline,
    Tooltip,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Grid,
    Tab,
    Tabs,
    Popover,
    Badge,
} from '@mui/material';
import {
    Gamepad as GamepadIcon,
    EmojiEvents as EmojiEventsIcon,
    Person as PersonIcon,
    Launch as LaunchIcon,
    Group as GroupIcon,
    Close as CloseIcon,
    Info as InfoIcon,
    Timer as TimerIcon,
    BarChart as BarChartIcon,
    Link as LinkIcon,
    Videocam as VideocamIcon, // Added for Twitch streaming
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { fetchWithAuth } from './utils/api';

interface LinkedAccount {
    profile_id: string;
    user_id: string;
    platform_type: string;
    id_on_platform: string;
    name_on_platform: string;
    info_link: string | null;
}

// Add Twitch stream interface
interface TwitchStream {
    id: string;
    title: string;
    game: {
        id: string;
        name: string;
    };
}

// Add Twitch user interface
interface TwitchUser {
    id: string;
    channel: {
        id: string;
        name: string;
        chatters: {
            count: number;
        };
    };
    stream: TwitchStream | null;
    isPartner: boolean;
}

// Add Twitch info interface
interface TwitchInfo {
    data: {
        user: TwitchUser;
    };
    extensions: {
        durationMilliseconds: number;
        operationName: string;
        requestID: string;
    };
}

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
    risk_score: number;
}

interface PlayerInfo {
    name: string;
    profile_id: string;
    uuid: string;
    profile_pic_url: string;
    locker_link: string;
    statscc_link: string;
    linked_accounts: LinkedAccount[];
    twitch_info?: TwitchInfo[]; // Added twitch_info field
    current_platform_info?: {
        platform: string;
    }; // Added current platform info
    persona: {
        tag: string | null;
        enabled: boolean;
        nickname: string | null;
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
}

interface PlayerData {
    player: PlayerInfo;
    team: number;
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
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

// Helper function to check if a player has Twitch info
function hasTwitchInfo(playerInfo: PlayerInfo): boolean {
    try {
        return Boolean(
            playerInfo.twitch_info &&
            playerInfo.twitch_info.length > 0 &&
            playerInfo.twitch_info[0]?.data?.user?.channel?.name
        );
    } catch (e) {
        console.error("Error checking Twitch info:", e);
        return false;
    }
}

// Helper function to check if a player is live on Twitch
function isLiveOnTwitch(playerInfo: PlayerInfo): boolean {
    try {
        if (!hasTwitchInfo(playerInfo)) return false;
        return Boolean(playerInfo.twitch_info?.[0]?.data?.user?.stream);
    } catch (e) {
        console.error("Error checking if player is live on Twitch:", e);
        return false;
    }
}

// Helper function to get Twitch channel name
function getTwitchChannelName(playerInfo: PlayerInfo): string | null {
    try {
        if (!hasTwitchInfo(playerInfo)) return null;
        return playerInfo.twitch_info?.[0]?.data?.user?.channel?.name || null;
    } catch (e) {
        console.error("Error getting Twitch channel name:", e);
        return null;
    }
}

// Helper function to get Twitch stream title
function getTwitchStreamTitle(playerInfo: PlayerInfo): string | null {
    try {
        if (!isLiveOnTwitch(playerInfo)) return null;
        return playerInfo.twitch_info?.[0]?.data?.user?.stream?.title || null;
    } catch (e) {
        console.error("Error getting Twitch stream title:", e);
        return null;
    }
}

// Helper function to determine if risk score data exists
function hasRiskData(stats: PlayerStats): boolean {
    return stats.risk_score !== undefined && stats.risk_score !== null;
}

// Helper function to determine risk color based on score
function getRiskProgressColor(score: number | undefined | null): "success" | "warning" | "error" | "info" {
    if (score === undefined || score === null) return "info";
    if (score < 30) return "success";
    if (score < 60) return "warning";
    return "error";
}

// Helper function to get platform icon based on platform name
function getPlatformIcon(platform: string | undefined) {
    if (!platform) return null;

    switch (platform.toLowerCase()) {
        case 'uplay':
            return <img src="/assets/platforms/windows.png" alt="PC" style={{ width: '16px', height: '16px', marginRight: '4px' }} />;
        case 'ps4':
        case 'ps5':
            return <img src="/assets/platforms/psn.png" alt="PlayStation" style={{ width: '16px', height: '16px', marginRight: '4px' }} />;
        case 'xbox_one':
        case 'xbox_scarlett':
            return <img src="/assets/platforms/xbox.png" alt="Xbox" style={{ width: '16px', height: '16px', marginRight: '4px' }} />;
        default:
            return null;
    }
}

function getRiskTextColor(score: number | undefined | null): string {
    if (score === undefined || score === null) return "text.secondary";
    if (score < 30) return "success.main";
    if (score < 60) return "warning.main";
    return "error.main";
}

// Helper function to get risk label
function getRiskLabel(score: number | undefined | null): string {
    if (score === undefined || score === null) return "No Data Available";
    if (score === 0) return "Minimum Risk";

    if (score < 20) return "Low Risk";
    if (score < 40) return "Moderate Risk";
    if (score < 60) return "Medium Risk";
    if (score < 80) return "High Risk";
    return "Very High Risk";
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
                                style={{ width: '60px', height: '60px' }}
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
                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Win/Loss
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                            sx={{ height: 8, borderRadius: 5, mt: 1 }}
                        />
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Kill/Death
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                                <Typography variant="h6">{stats.kills}</Typography>
                                <Typography variant="body2" color="text.secondary">Kills</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6">{stats.deaths}</Typography>
                                <Typography variant="body2" color="text.secondary">Deaths</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6">{stats.kill_death_ratio.toFixed(2)}</Typography>
                                <Typography variant="body2" color="text.secondary">K/D Ratio</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">K/D Comparison</Typography>
                            <Typography variant="body1" fontWeight="bold">
                                {stats.kill_death_ratio >= 1 ? 'Positive' : 'Negative'}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(stats.kill_death_ratio * 50, 100)}
                            color={stats.kill_death_ratio >= 1 ? "success" : "warning"}
                            sx={{ height: 8, borderRadius: 5, mt: 1 }}
                        />
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            Risk Analysis
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                                <Typography variant="h6">{stats.risk_score || 0}</Typography>
                                <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6">{getRiskLabel(stats.risk_score)}</Typography>
                                <Typography variant="caption" color="text.secondary">Assessment</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Risk Level</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={stats.risk_score || 0}
                            color={getRiskProgressColor(stats.risk_score)}
                            sx={{ height: 8, borderRadius: 5, mt: 1 }}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Box>
    );
}

// Player Info Dialog Component
function PlayerInfoDialog({ open, handleClose, playerData }: {
    open: boolean,
    handleClose: () => void,
    playerData: PlayerData | null
}) {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    if (!playerData) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                        Player Details: {playerData.player.name}
                    </Typography>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ color: (theme) => theme.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Player Info Section */}
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                    src={playerData.player.profile_pic_url}
                                    alt={playerData.player.name}
                                    sx={{ width: 80, height: 80, mr: 2, border: '2px solid', borderColor: 'primary.main' }}
                                />
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {/* Platform Icon */}
                                        {getPlatformIcon(playerData.player.current_platform_info?.platform)}

                                        <Typography variant="h6">
                                            {playerData.player.name}
                                        </Typography>

                                        {/* Add Twitch Live Stream Icon */}
                                        {hasTwitchInfo(playerData.player) && getTwitchChannelName(playerData.player) && (
                                            <Tooltip title={
                                                isLiveOnTwitch(playerData.player)
                                                    ? `Live on Twitch: ${getTwitchStreamTitle(playerData.player) || 'Streaming'}`
                                                    : `Twitch: ${getTwitchChannelName(playerData.player)}`
                                            }>
                                                <IconButton
                                                    component="a"
                                                    href={`https://twitch.tv/${getTwitchChannelName(playerData.player)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    size="small"
                                                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        window.open(`https://twitch.tv/${getTwitchChannelName(playerData.player)}`, '_blank', 'noopener,noreferrer');
                                                    }}
                                                    sx={{
                                                        p: 0.5,
                                                        color: isLiveOnTwitch(playerData.player) ? 'error.main' : 'text.secondary',
                                                    }}
                                                >
                                                    <VideocamIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>

                                    {playerData.player.persona.enabled && (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            {playerData.player.persona.nickname}
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                                        <Chip
                                            label={`Level ${playerData.player.progress.level}`}
                                            size="small"
                                            color="primary"
                                        />
                                        <Chip
                                            label={`Team ${playerData.team}`}
                                            size="small"
                                            color={playerData.team === 1 ? "primary" : "secondary"}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom color="primary">
                                <TimerIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Playtime
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">PvP</Typography>
                                    <Typography variant="body1">
                                        {formatTime(playerData.player.playtime.pvp_time_played)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">PvE</Typography>
                                    <Typography variant="body1">
                                        {formatTime(playerData.player.playtime.pve_time_played)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Total</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {playerData.player.playtime.total_time_played_hours} hours
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom color="primary">
                                <BarChartIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Progress
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Level Progress</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(playerData.player.progress.xp / (playerData.player.progress.xp + playerData.player.progress.xp_to_level_up)) * 100}
                                        sx={{ height: 8, borderRadius: 5 }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {Math.round((playerData.player.progress.xp / (playerData.player.progress.xp + playerData.player.progress.xp_to_level_up)) * 100)}%
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                {playerData.player.progress.xp.toLocaleString()} / {(playerData.player.progress.xp + playerData.player.progress.xp_to_level_up).toLocaleString()} XP
                                to Level {playerData.player.progress.level + 1}
                            </Typography>

                            {/* Twitch Info Section */}
                            {hasTwitchInfo(playerData.player) && getTwitchChannelName(playerData.player) && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom color="primary">
                                        <VideocamIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                        Twitch Channel
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Channel</Typography>
                                        <Button
                                            component="a"
                                            href={`https://twitch.tv/${getTwitchChannelName(playerData.player)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="text"
                                            color="primary"
                                            endIcon={<LaunchIcon fontSize="small" />}
                                            sx={{
                                                textTransform: 'none',
                                            }}
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                window.open(`https://twitch.tv/${getTwitchChannelName(playerData.player)}`, '_blank', 'noopener,noreferrer');
                                            }}
                                        >
                                            {getTwitchChannelName(playerData.player)}
                                        </Button>
                                    </Box>
                                    {isLiveOnTwitch(playerData.player) && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">Status</Typography>
                                            <Chip
                                                label="Live Now"
                                                color="error"
                                                size="small"
                                                icon={<VideocamIcon />}
                                                sx={{ mt: 0.5 }}
                                            />
                                            {getTwitchStreamTitle(playerData.player) && (
                                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                                    {getTwitchStreamTitle(playerData.player)}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </>
                            )}

                            {playerData.player.linked_accounts.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle2" gutterBottom color="primary">
                                        <LinkIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                        Linked Accounts
                                    </Typography>

                                    {playerData.player.linked_accounts.map((account: LinkedAccount, index: number) => (
                                        <Box key={index} sx={{ mb: 1 }}>
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
                                                    onClick={(e: React.MouseEvent) => {
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
                                </>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Button
                                component="a"
                                variant="contained"
                                color="primary"
                                fullWidth
                                startIcon={<LaunchIcon />}
                                href={playerData.player.locker_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    window.open(playerData.player.locker_link, '_blank', 'noopener,noreferrer');
                                }}
                            >
                                View Locker
                            </Button>

                            <Button
                                component="a"
                                variant="outlined"
                                color="primary"
                                fullWidth
                                startIcon={<PersonIcon />}
                                href={`/lookup?type=profile_id&id=${playerData.player.profile_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ mt: 1 }}
                            >
                                View Full Profile (with Bans)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Stats Section */}
                    <Card sx={{ height: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                aria-label="player stats tabs"
                                sx={{ '& .MuiTab-root': { minWidth: 100 } }}
                            >
                                <Tab label="Ranked" icon={<EmojiEventsIcon />} iconPosition="start" />
                                <Tab label="Casual" icon={<GamepadIcon />} iconPosition="start" />
                                <Tab label="Standard" icon={<BarChartIcon />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        <TabPanel value={tabValue} index={0}>
                            <StatsPanel stats={playerData.player.stats.ranked} />
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            <StatsPanel stats={playerData.player.stats.casual} />
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                            <StatsPanel stats={playerData.player.stats.standard} />
                        </TabPanel>
                    </Card>
                </Grid>
            </DialogContent>
        </Dialog>
    );
}

export default function Match() {
    const [matchData, setMatchData] = useState<PlayerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    // Remove unused navigate variable
    // Add a ref to track if we've already fetched data
    const dataFetchedRef = useRef<boolean>(false);

    // State for player info dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);

    // State for linked accounts popover
    const [linkedAccountsAnchorEl, setLinkedAccountsAnchorEl] = useState<HTMLElement | null>(null);
    const [linkedAccountsPlayer, setLinkedAccountsPlayer] = useState<PlayerData | null>(null);
    const linkedAccountsOpen = Boolean(linkedAccountsAnchorEl);

    // Handle opening player info dialog
    const handleOpenPlayerInfo = (playerData: PlayerData) => {
        setSelectedPlayer(playerData);
        setDialogOpen(true);
    };

    // Handle closing player info dialog
    const handleClosePlayerInfo = () => {
        setDialogOpen(false);
    };

    // Handle opening linked accounts popover
    const handleOpenLinkedAccounts = (event: React.MouseEvent<HTMLElement>, playerData: PlayerData) => {
        event.stopPropagation(); // Prevent the row click event
        setLinkedAccountsAnchorEl(event.currentTarget);
        setLinkedAccountsPlayer(playerData);
    };

    // Handle closing linked accounts popover
    const handleCloseLinkedAccounts = () => {
        setLinkedAccountsAnchorEl(null);
        setLinkedAccountsPlayer(null);
    };

    // Parse the match identifiers from the URL
    const parseMatchIdentifiers = () => {
        const searchParams = new URLSearchParams(location.search);
        const identifiersParam = searchParams.get('identifiers');

        if (!identifiersParam) {
            setError('No match identifiers provided in URL');
            setLoading(false);
            return null;
        }

        try {
            // The URL format should be something like: ?identifiers=[{"profile_id1":1},{"profile_id2":1},...]
            return JSON.parse(decodeURIComponent(identifiersParam));
        } catch {
            setError('Invalid match identifiers format');
            setLoading(false);
            return null;
        }
    };

    // Fetch match data from API
    const fetchMatchData = async () => {
        setLoading(true);
        setError(null);

        const identifiers = parseMatchIdentifiers();
        if (!identifiers) return;

        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/lookup/match`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifiers }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setMatchData(data);
        } catch (err) {
            console.error('Error fetching match data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount or URL change
    useEffect(() => {
        // Use a ref to prevent duplicate API calls
        if (dataFetchedRef.current === false && location.search) {
            dataFetchedRef.current = true;
            fetchMatchData();
        } else if (dataFetchedRef.current === true && !location.search) {
            // Reset the ref if the search parameter is empty
            dataFetchedRef.current = false;
        }
    }, [location.search]);

    // Group players by team
    const team1Players = matchData.filter(player => player.team === 1);
    const team0Players = matchData.filter(player => player.team === 0);

    // Function to render player cell with linked accounts icon
    const renderPlayerCell = (playerData: PlayerData) => (
        <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                    src={playerData.player.profile_pic_url}
                    alt={playerData.player.name}
                    sx={{ width: 40, height: 40, mr: 2 }}
                />
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Platform Icon */}
                            {getPlatformIcon(playerData.player.current_platform_info?.platform)}

                            <Typography variant="body1">
                                {playerData.player.name}
                            </Typography>

                            {/* Add Twitch Live Stream Icon */}
                            {hasTwitchInfo(playerData.player) && getTwitchChannelName(playerData.player) && (
                                <Tooltip title={
                                    isLiveOnTwitch(playerData.player)
                                        ? `Live on Twitch: ${getTwitchStreamTitle(playerData.player) || 'Streaming'}`
                                        : `Twitch: ${getTwitchChannelName(playerData.player)}`
                                }>
                                    <IconButton
                                        component="a"
                                        href={`https://twitch.tv/${getTwitchChannelName(playerData.player)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            window.open(`https://twitch.tv/${getTwitchChannelName(playerData.player)}`, '_blank', 'noopener,noreferrer');
                                        }}
                                        sx={{
                                            p: 0.5,
                                            color: isLiveOnTwitch(playerData.player) ? 'error.main' : 'text.secondary',
                                        }}
                                    >
                                        <VideocamIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {/* Linked accounts icon */}
                            {playerData.player.linked_accounts &&
                                playerData.player.linked_accounts.length > 0 && (
                                    <Badge
                                        badgeContent={playerData.player.linked_accounts.length}
                                        color={playerData.team === 1 ? "primary" : "secondary"}
                                        sx={{
                                            ml: 1,
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.7rem',
                                                minWidth: '20px',
                                                height: '20px'
                                            }
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={(e: React.MouseEvent<HTMLElement>) => handleOpenLinkedAccounts(e, playerData)}
                                            sx={{
                                                border: `2px solid ${playerData.team === 1 ? 'primary.main' : 'secondary.main'}`,
                                                p: 0.5,
                                                backgroundColor: 'rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <LinkIcon
                                                sx={{
                                                    fontSize: '1.2rem',
                                                    color: playerData.team === 1 ? 'primary.main' : 'secondary.main'
                                                }}
                                            />
                                        </IconButton>
                                    </Badge>
                                )}
                        </Box>
                    </Box>
                    {playerData.player.persona.enabled && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {playerData.player.persona.nickname}
                        </Typography>
                    )}
                </Box>
            </Box>
        </TableCell>
    );

    return (
        <>
            <CssBaseline />
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
                        <GroupIcon sx={{fontSize: 32, mr: 2, color: 'primary.main'}}/>
                        <Typography variant="h4">Rainbow Six Siege Match Leaderboard</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        View all players in the current match grouped by team
                    </Typography>
                </Paper>

                {loading && (
                    <Box sx={{width: '100%', mb: 4}}>
                        <LinearProgress />
                    </Box>
                )}

                {error && !loading && (
                    <Paper sx={{p: 3, mb: 4, borderRadius: 2, bgcolor: 'error.light'}}>
                        <Typography variant="h6" color="error.dark">Error Loading Match Data</Typography>
                        <Typography variant="body1">{error}</Typography>
                    </Paper>
                )}

                {!loading && !error && matchData.length === 0 && (
                    <Box sx={{textAlign: 'center', py: 8}}>
                        <GamepadIcon sx={{fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.3}}/>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No match data available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            The match data could not be found or has not been loaded correctly
                        </Typography>
                    </Box>
                )}

                {!loading && !error && matchData.length > 0 && (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
                        {/* Team 1 (User's team) */}
                        {team1Players.length > 0 && (
                            <Card sx={{boxShadow: 3}}>
                                <CardHeader
                                    title="Team 1"
                                    avatar={<EmojiEventsIcon color="primary"/>}
                                    sx={{borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.dark', color: 'primary.contrastText'}}
                                />
                                <CardContent>
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Player</TableCell>
                                                    <TableCell align="center">Level</TableCell>
                                                    <TableCell align="center">Rank</TableCell>
                                                    <TableCell align="center">W/L Ratio</TableCell>
                                                    <TableCell align="center">K/D Ratio</TableCell>
                                                    <TableCell align="center">Risk Score</TableCell>
                                                    <TableCell align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {team1Players.map((playerData: PlayerData, index: number) => (
                                                    <TableRow
                                                        key={index}
                                                        sx={{
                                                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                                            cursor: 'pointer',
                                                            '&:hover': { backgroundColor: 'action.selected' },
                                                        }}
                                                        onClick={() => handleOpenPlayerInfo(playerData)}
                                                    >
                                                        {renderPlayerCell(playerData)}
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={playerData.player.progress.level}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {playerData.player.stats.ranked.rank_id > 0 ? (
                                                                <Tooltip title={playerData.player.stats.ranked.rank}>
                                                                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                                        <img
                                                                            src={`/assets/ranks/rank_${playerData.player.stats.ranked.rank_id}.png`}
                                                                            alt={playerData.player.stats.ranked.rank}
                                                                            style={{width: '40px', height: '40px'}}
                                                                        />
                                                                    </Box>
                                                                </Tooltip>
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Unranked
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                variant="body2"
                                                                color={playerData.player.stats.ranked.win_loss_ratio >= 1 ? 'success.main' : 'warning.main'}
                                                                fontWeight="bold"
                                                            >
                                                                {playerData.player.stats.ranked.win_loss_ratio.toFixed(2)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ({playerData.player.stats.ranked.wins}W - {playerData.player.stats.ranked.losses}L)
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                variant="body2"
                                                                color={playerData.player.stats.ranked.kill_death_ratio >= 1 ? 'success.main' : 'warning.main'}
                                                                fontWeight="bold"
                                                            >
                                                                {playerData.player.stats.ranked.kill_death_ratio.toFixed(2)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ({playerData.player.stats.ranked.kills}K - {playerData.player.stats.ranked.deaths}D)
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {hasRiskData(playerData.player.stats.ranked) ? (
                                                                <Tooltip title={getRiskLabel(playerData.player.stats.ranked.risk_score)}>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color={getRiskTextColor(playerData.player.stats.ranked.risk_score)}
                                                                            fontWeight="bold"
                                                                        >
                                                                            {playerData.player.stats.ranked.risk_score}
                                                                        </Typography>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={playerData.player.stats.ranked.risk_score}
                                                                            color={getRiskProgressColor(playerData.player.stats.ranked.risk_score)}
                                                                            sx={{ height: 6, width: '80%', borderRadius: 3, mt: 0.5 }}
                                                                        />
                                                                    </Box>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip title="No risk assessment data available">
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            N/A
                                                                        </Typography>
                                                                        <LinearProgress
                                                                            variant="indeterminate"
                                                                            color="inherit"
                                                                            sx={{ height: 6, width: '80%', borderRadius: 3, mt: 0.5, opacity: 0.3 }}
                                                                        />
                                                                    </Box>
                                                                </Tooltip>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<InfoIcon />}
                                                                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                                                                        e.stopPropagation();
                                                                        handleOpenPlayerInfo(playerData);
                                                                    }}
                                                                >
                                                                    Info
                                                                </Button>
                                                                <Button
                                                                    component="a"
                                                                    href={`/lookup?type=profile_id&id=${playerData.player.profile_id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PersonIcon />}
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    Bans
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<LaunchIcon />}
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        window.open(playerData.player.locker_link, '_blank', 'noopener,noreferrer');
                                                                    }}
                                                                >
                                                                    Locker
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<LaunchIcon />}
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        window.open(playerData.player.statscc_link, '_blank', 'noopener,noreferrer');
                                                                    }}
                                                                >
                                                                    stats.cc
                                                                </Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Team 0 (Opponent team) */}
                        {team0Players.length > 0 && (
                            <Card sx={{boxShadow: 3}}>
                                <CardHeader
                                    title="Team 0"
                                    avatar={<GamepadIcon color="secondary"/>}
                                    sx={{borderBottom: 1, borderColor: 'divider', bgcolor: 'secondary.dark', color: 'secondary.contrastText'}}
                                />
                                <CardContent>
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Player</TableCell>
                                                    <TableCell align="center">Level</TableCell>
                                                    <TableCell align="center">Rank</TableCell>
                                                    <TableCell align="center">W/L Ratio</TableCell>
                                                    <TableCell align="center">K/D Ratio</TableCell>
                                                    <TableCell align="center">Risk Score</TableCell>
                                                    <TableCell align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {team0Players.map((playerData: PlayerData, index: number) => (
                                                    <TableRow
                                                        key={index}
                                                        sx={{
                                                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                                            cursor: 'pointer',
                                                            '&:hover': { backgroundColor: 'action.selected' },
                                                        }}
                                                        onClick={() => handleOpenPlayerInfo(playerData)}
                                                    >
                                                        {renderPlayerCell(playerData)}
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={playerData.player.progress.level}
                                                                color="secondary"
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {playerData.player.stats.ranked.rank_id > 0 ? (
                                                                <Tooltip title={playerData.player.stats.ranked.rank}>
                                                                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                                        <img
                                                                            src={`/assets/ranks/rank_${playerData.player.stats.ranked.rank_id}.png`}
                                                                            alt={playerData.player.stats.ranked.rank}
                                                                            style={{width: '40px', height: '40px'}}
                                                                        />
                                                                    </Box>
                                                                </Tooltip>
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Unranked
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                variant="body2"
                                                                color={playerData.player.stats.ranked.win_loss_ratio >= 1 ? 'success.main' : 'warning.main'}
                                                                fontWeight="bold"
                                                            >
                                                                {playerData.player.stats.ranked.win_loss_ratio.toFixed(2)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ({playerData.player.stats.ranked.wins}W - {playerData.player.stats.ranked.losses}L)
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                variant="body2"
                                                                color={playerData.player.stats.ranked.kill_death_ratio >= 1 ? 'success.main' : 'warning.main'}
                                                                fontWeight="bold"
                                                            >
                                                                {playerData.player.stats.ranked.kill_death_ratio.toFixed(2)}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ({playerData.player.stats.ranked.kills}K - {playerData.player.stats.ranked.deaths}D)
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {hasRiskData(playerData.player.stats.ranked) ? (
                                                                <Tooltip title={getRiskLabel(playerData.player.stats.ranked.risk_score)}>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            color={getRiskTextColor(playerData.player.stats.ranked.risk_score)}
                                                                            fontWeight="bold"
                                                                        >
                                                                            {playerData.player.stats.ranked.risk_score}
                                                                        </Typography>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={playerData.player.stats.ranked.risk_score}
                                                                            color={getRiskProgressColor(playerData.player.stats.ranked.risk_score)}
                                                                            sx={{ height: 6, width: '80%', borderRadius: 3, mt: 0.5 }}
                                                                        />
                                                                    </Box>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip title="No risk assessment data available">
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            N/A
                                                                        </Typography>
                                                                        <LinearProgress
                                                                            variant="indeterminate"
                                                                            color="inherit"
                                                                            sx={{ height: 6, width: '80%', borderRadius: 3, mt: 0.5, opacity: 0.3 }}
                                                                        />
                                                                    </Box>
                                                                </Tooltip>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{display: 'flex', gap: 1, justifyContent: 'center'}}>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<InfoIcon />}
                                                                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                                                                        e.stopPropagation();
                                                                        handleOpenPlayerInfo(playerData);
                                                                    }}
                                                                >
                                                                    Info
                                                                </Button>
                                                                <Button
                                                                    component="a"
                                                                    href={`/lookup?type=profile_id&id=${playerData.player.profile_id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<PersonIcon />}
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    Bans
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<LaunchIcon />}
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        window.open(playerData.player.locker_link, '_blank', 'noopener,noreferrer');
                                                                    }}
                                                                >
                                                                    Locker
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<LaunchIcon />}
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.stopPropagation();
                                                                        window.open(playerData.player.statscc_link, '_blank', 'noopener,noreferrer');
                                                                    }}
                                                                >
                                                                    stats.cc
                                                                </Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Match Summary Card */}
                        <Card sx={{boxShadow: 3}}>
                            <CardHeader
                                title="Match Summary"
                                avatar={<EmojiEventsIcon />}
                                sx={{borderBottom: 1, borderColor: 'divider'}}
                            />
                            <CardContent>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                    <Typography variant="body1">
                                        Total Players: <strong>{matchData.length}</strong>
                                    </Typography>
                                    <Typography variant="body1">
                                        Team 1 Players: <strong>{team1Players.length}</strong>
                                    </Typography>
                                    <Typography variant="body1">
                                        Team 0 Players: <strong>{team0Players.length}</strong>
                                    </Typography>
                                </Box>

                                <Divider sx={{my: 2}} />

                                <Typography variant="subtitle1" gutterBottom>
                                    Average Ranks
                                </Typography>
                                <Box sx={{display: 'flex', gap: 4}}>
                                    <Box>
                                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                                            Team 1 Average MMR:
                                        </Typography>
                                        <Typography variant="body1">
                                            {team1Players.length > 0
                                                ? Math.round(team1Players.reduce((sum, player) =>
                                                    sum + player.player.stats.ranked.rank_points, 0) / team1Players.length)
                                                : 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="secondary.main" fontWeight="bold">
                                            Team 0 Average MMR:
                                        </Typography>
                                        <Typography variant="body1">
                                            {team0Players.length > 0
                                                ? Math.round(team0Players.reduce((sum, player) =>
                                                    sum + player.player.stats.ranked.rank_points, 0) / team0Players.length)
                                                : 'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Player Info Dialog */}
                <PlayerInfoDialog
                    open={dialogOpen}
                    handleClose={handleClosePlayerInfo}
                    playerData={selectedPlayer}
                />

                {/* Linked Accounts Popover */}
                <Popover
                    open={linkedAccountsOpen}
                    anchorEl={linkedAccountsAnchorEl}
                    onClose={handleCloseLinkedAccounts}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    PaperProps={{
                        sx: {
                            p: 2,
                            maxWidth: 300,
                            bgcolor: 'background.paper',
                            boxShadow: 4,
                            borderRadius: 1
                        }
                    }}
                >
                    {linkedAccountsPlayer && (
                        <Box>
                            <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <LinkIcon fontSize="small" sx={{ mr: 1 }} />
                                Linked Accounts
                            </Typography>

                            {linkedAccountsPlayer.player.linked_accounts &&
                            linkedAccountsPlayer.player.linked_accounts.length > 0 ? (
                                linkedAccountsPlayer.player.linked_accounts.map((account: LinkedAccount, index: number) => (
                                    <Box key={index} sx={{ mb: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
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
                                            >
                                                {account.name_on_platform}
                                            </Button>
                                        ) : (
                                            <Typography variant="body2">
                                                {account.name_on_platform}
                                            </Typography>
                                        )}
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No linked accounts found.
                                </Typography>
                            )}
                        </Box>
                    )}
                </Popover>
            </Box>
        </>
    );
}