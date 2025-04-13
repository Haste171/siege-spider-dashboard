import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Pagination,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardHeader,
    SelectChangeEvent,
    Tooltip,
    CssBaseline,
} from '@mui/material';
import {
    Block as BlockIcon,
    FilterList as FilterListIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';

interface SiegeBan {
    id: string;
    uplay: string;
    psn: string | null;
    xbl: string | null;
    ban_reason: number;
    updated_at: string | null;
    profile_id: string;
    created_at: string;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface BansResponse {
    bans: SiegeBan[];
    pagination: PaginationInfo;
}

export default function Bans() {
    const [bans, setBans] = useState<SiegeBan[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        page: 1,
        limit: 25,
        pages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState<number>(25);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filterReason, setFilterReason] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const fetchBans = async (page: number = 1, limit: number = 25) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/bans?page=${page}&limit=${limit}`
            );
            const data: BansResponse = await response.json();
            setBans(data.bans);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching bans:', error);
            alert('Failed to fetch bans data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBans(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
        setPageSize(event.target.value as number);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleFilterReason = (event: SelectChangeEvent) => {
        setFilterReason(event.target.value);
    };

    const handleFilterStatus = (event: SelectChangeEvent) => {
        setFilterStatus(event.target.value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const applyFilters = () => {
        // Note: In a real implementation, you'd pass these filters to the API
        // For now, we'll just refetch the data
        fetchBans(1, pageSize);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilterReason('all');
        setFilterStatus('all');
        setSearchQuery('');
        fetchBans(1, pageSize);
        setCurrentPage(1);
    };

    const getBanReasonText = (banReason: number): string => {
        switch (banReason) {
            case 0:
                return 'BattlEye';
            case 1:
                return 'Toxicity';
            case 2:
                return 'Boosting';
            case 3:
                return 'DDoSing';
            case 4:
                return 'Cheating';
            case 5:
                return 'Botting';
            case 6:
                return 'ToS Breach';
            default:
                return `Unknown (${banReason})`;
        }
    };

    const getBanReasonColor = (banReason: number) => {
        switch (banReason) {
            case 0:
                return 'default';
            case 1:
                return 'warning';
            case 2:
                return 'secondary';
            case 3:
                return 'error';
            case 4:
                return 'error';
            case 5:
                return 'info';
            case 6:
                return 'error';
            default:
                return 'default';
        }
    };

    const isActive = (ban: SiegeBan): boolean => {
        return !ban.updated_at;
    };

    return (
        <>
            <CssBaseline />
            <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, pb: 4 }}>
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
                        <BlockIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
                        <Typography variant="h4">Rainbow Six Siege Ban Database</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        Browse all recorded bans and filter by reason or status
                    </Typography>
                </Paper>

                <Card sx={{ mb: 3 }}>
                    <CardHeader
                        title="Filters"
                        avatar={<FilterListIcon />}
                        sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}
                    />
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <FormControl fullWidth size="small">
                                <InputLabel id="filter-reason-label">Ban Reason</InputLabel>
                                <Select
                                    labelId="filter-reason-label"
                                    value={filterReason}
                                    label="Ban Reason"
                                    onChange={handleFilterReason}
                                >
                                    <MenuItem value="all">All Reasons</MenuItem>
                                    <MenuItem value="0">BattlEye</MenuItem>
                                    <MenuItem value="1">Toxicity</MenuItem>
                                    <MenuItem value="2">Boosting</MenuItem>
                                    <MenuItem value="3">DDoSing</MenuItem>
                                    <MenuItem value="4">Cheating</MenuItem>
                                    <MenuItem value="5">Botting</MenuItem>
                                    <MenuItem value="6">ToS Breach</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel id="filter-status-label">Status</InputLabel>
                                <Select
                                    labelId="filter-status-label"
                                    value={filterStatus}
                                    label="Status"
                                    onChange={handleFilterStatus}
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="expired">Expired</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                size="small"
                                label="Search by Uplay Name"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={applyFilters}
                                disabled={loading}
                            >
                                Filter
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={resetFilters}
                                startIcon={<RefreshIcon />}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                        </Grid>
                    </CardContent>
                </Card>

                {loading && (
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <LinearProgress />
                    </Box>
                )}

                <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'background.default' }}>
                                    <TableCell>Ban Date</TableCell>
                                    <TableCell>Uplay Name</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell>Platform</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Profile ID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bans.length > 0 ? (
                                    bans.map((ban) => {
                                        const banDate = new Date(ban.created_at);
                                        const formattedDate = banDate.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        });

                                        const expiredDate = ban.updated_at ? new Date(ban.updated_at) : null;
                                        const formattedExpiredDate = expiredDate
                                            ? expiredDate.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })
                                            : null;

                                        return (
                                            <TableRow
                                                key={ban.id}
                                                sx={{
                                                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                                                    backgroundColor: isActive(ban) ? 'rgba(255, 0, 0, 0.05)' : 'inherit',
                                                }}
                                            >
                                                <TableCell>{formattedDate}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {ban.uplay}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getBanReasonText(ban.ban_reason)}
                                                        color={getBanReasonColor(ban.ban_reason) as never}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        {ban.uplay && <Chip label="UPLAY" size="small" />}
                                                        {ban.psn && <Chip label="PSN" size="small" />}
                                                        {ban.xbl && <Chip label="XBOX" size="small" />}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {isActive(ban) ? (
                                                        <Chip
                                                            icon={<WarningIcon />}
                                                            label="Active"
                                                            color="error"
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <Tooltip title={`Expired on ${formattedExpiredDate}`}>
                                                            <Chip label="Expired" color="success" size="small" />
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                        {ban.profile_id}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No bans found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            Rows per page:
                        </Typography>
                        <FormControl size="small" variant="outlined" sx={{ minWidth: 80 }}>
                            <Select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                sx={{ height: 32 }}
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                            </Select>
                        </FormControl>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            {`${(pagination.page - 1) * pagination.limit + 1}-${
                                Math.min(pagination.page * pagination.limit, pagination.total)
                            } of ${pagination.total}`}
                        </Typography>
                    </Box>
                    <Pagination
                        count={pagination.pages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            </Box>
        </>
    );
}