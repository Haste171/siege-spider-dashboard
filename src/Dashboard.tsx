import { useState } from 'react';
import {
  Container,
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
} from '@mui/material';
import {
  Person as PersonIcon,
  Gamepad as GamepadIcon,
  EmojiEvents as EmojiEventsIcon,
  Timer as TimerIcon,
  BarChart as BarChartIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

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
}

interface PlayerData {
  player: {
    name: string;
    profile_id: string;
    uuid: string;
    profile_pic_url: string;
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
                      src={`/src/assets/ranks/rank_${stats.rank_id}.png`}
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
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', minHeight: '220px' }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Win/Loss
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h4">{stats.wins}</Typography>
                    <Typography variant="body2" color="text.secondary">Wins</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4">{stats.losses}</Typography>
                    <Typography variant="body2" color="text.secondary">Losses</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4">{stats.abandons}</Typography>
                    <Typography variant="body2" color="text.secondary">Abandons</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Win Rate</Typography>
                  <Typography variant="body1" fontWeight="bold">
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
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', minHeight: '220px' }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Kill/Death
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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
          </Grid>
        </Grid>
      </Box>
  );
}

export default function Dashboard() {
  const [input, setInput] = useState('');
  const [type, setType] = useState<'uplay' | 'profile_id'>('uplay');
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  useTheme();
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  const handleTypeChange = (event: SelectChangeEvent) => {
    setType(event.target.value as 'uplay' | 'profile_id');
  };

  const fetchPlayer = async () => {
    if (!input) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lookup/${type}/${input}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
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
        <CssBaseline />
        <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: 'lg',
              p: 2
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GamepadIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
              <Typography variant="h4">Rainbow Six Siege Player Lookup</Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Enter a player's Uplay name or profile ID to view their stats
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3} md={3}>
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
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                    fullWidth
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={type === 'uplay' ? 'Enter Uplay Name' : 'Enter Profile ID'}
                    label={type === 'uplay' ? 'Uplay Name' : 'Profile ID'}
                    variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={3} md={3}>
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={fetchPlayer}
                    disabled={loading || !input}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Searching...' : 'Lookup Player'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {loading && (
              <Box sx={{ width: '100%', mb: 4 }}>
                <LinearProgress />
              </Box>
          )}

          {!loading && !data && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <GamepadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No player data to display
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter a Uplay username or Profile ID above to search for a player
                </Typography>
              </Box>
          )}

          {data && data.player && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '98%' }}>
                <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 35%' }, height: { md: '650px' } }}>
                  <Card sx={{ height: '100%', boxShadow: 3 }}>
                    <CardHeader
                        title="Player Profile"
                        avatar={<PersonIcon color="primary" />}
                        sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                            src={data.player.profile_pic_url}
                            alt={data.player.name}
                            sx={{ width: 80, height: 80, mr: 2, border: '2px solid', borderColor: 'primary.main' }}
                        />
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {data.player.name}
                          </Typography>
                          <Chip
                              label={`Level ${data.player.progress.level}`}
                              size="small"
                              color="primary"
                              sx={{ mr: 1, mb: 1 }}
                          />
                          {data.player.stats.ranked.rank !== 'Unranked' && (
                              <Chip
                                  label={data.player.stats.ranked.rank}
                                  size="small"
                                  color="secondary"
                                  sx={{ mb: 1 }}
                              />
                          )}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom color="primary">
                        <TimerIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Playtime
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">PvP</Typography>
                          <Typography variant="body1">
                            {formatTime(data.player.playtime.pvp_time_played)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">PvE</Typography>
                          <Typography variant="body1">
                            {formatTime(data.player.playtime.pve_time_played)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">Total</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {data.player.playtime.total_time_played_hours} hours
                          </Typography>
                        </Grid>
                      </Grid>

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
                              value={(data.player.progress.xp / (data.player.progress.xp + data.player.progress.xp_to_level_up)) * 100}
                              sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round((data.player.progress.xp / (data.player.progress.xp + data.player.progress.xp_to_level_up)) * 100)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {data.player.progress.xp.toLocaleString()} / {(data.player.progress.xp + data.player.progress.xp_to_level_up).toLocaleString()} XP to Level {data.player.progress.level + 1}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom color="primary">
                        <LinkIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Linked Accounts
                      </Typography>
                      {data.player.linked_accounts.map((account, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {account.platform_type.toUpperCase()}
                            </Typography>
                            <Typography variant="body2">
                              {account.name_on_platform}
                            </Typography>
                          </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 65%' }, height: { md: '650px' } }}>
                  <Card sx={{ height: '100%', boxShadow: 3 }}>
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
                      <StatsPanel stats={data.player.stats.ranked} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                      <StatsPanel stats={data.player.stats.casual} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                      <StatsPanel stats={data.player.stats.standard} />
                    </TabPanel>
                  </Card>
                </Box>
              </Box>
          )}
        </Box>
      </>
  );
}