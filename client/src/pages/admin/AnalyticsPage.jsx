import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Divider,
  Select, MenuItem, FormControl, InputLabel, Tabs, Tab
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { useDashboard } from '../../contexts/DashboardContext';

// Mock data for demonstration
const generateMockData = (days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 100) + 10,
      activeUsers: Math.floor(Math.random() * 80) + 5,
      transactions: Math.floor(Math.random() * 500) + 50,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      revenue: Math.floor(Math.random() * 10000) + 1000,
    });
  }
  
  return data;
};

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState(0);
  const [chartData, setChartData] = useState([]);
  
  const { analytics, loading, fetchAnalytics } = useDashboard();

  useEffect(() => {
    // In a real app, you would fetch data based on the timeRange
    // fetchAnalytics(timeRange);
    // For now, we'll use mock data
    setChartData(generateMockData(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
  }, [timeRange, fetchAnalytics]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Calculate summary stats
  const summary = {
    totalUsers: chartData.reduce((sum, day) => sum + day.users, 0),
    activeUsers: Math.max(...chartData.map(day => day.activeUsers)),
    totalTransactions: chartData.reduce((sum, day) => sum + day.transactions, 0),
    totalVolume: chartData.reduce((sum, day) => sum + day.volume, 0),
    totalRevenue: chartData.reduce((sum, day) => sum + day.revenue, 0),
    avgDailyTransactions: Math.round(chartData.reduce((sum, day) => sum + day.transactions, 0) / chartData.length),
  };

  // Format data for charts
  const formatForChart = (data, xKey, yKey) => {
    return data.map(item => ({
      name: item[xKey],
      value: item[yKey]
    }));
  };

  // Data for pie chart (example: user distribution)
  const userDistributionData = [
    { name: 'Active Users', value: summary.activeUsers },
    { name: 'New Users', value: summary.totalUsers - summary.activeUsers },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Overview
        return (
          <Grid container spacing={3}>
            {/* Users Overview */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>User Growth</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" name="New Users" stroke="#8884d8" />
                    <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* User Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>User Distribution</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Transactions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Transaction Volume</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="transactions" name="Transactions" fill="#8884d8" />
                    <Bar dataKey="volume" name="Volume (USD)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        );
      
      case 1: // Users
        return (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>User Analytics</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="users" name="New Users" stroke="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="activeUsers" name="Active Users" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        );
      
      case 2: // Transactions
        return (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Transaction Analytics</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="transactions" name="Transactions" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="volume" name="Volume (USD)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        );
      
      case 3: // Revenue
        return (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Revenue Analytics</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Daily Revenue (USD)" stroke="#8884d8" />
                <Line type="monotone" dataKey="volume" name="Trading Volume (USD)" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1">System Analytics</Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            label="Time Range"
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Users</Typography>
              <Typography variant="h5">{summary.totalUsers.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Users</Typography>
              <Typography variant="h5">{summary.activeUsers.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Transactions</Typography>
              <Typography variant="h5">{summary.totalTransactions.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Avg. Daily Tx</Typography>
              <Typography variant="h5">{summary.avgDailyTransactions.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Volume</Typography>
              <Typography variant="h5">${(summary.totalVolume / 1000000).toFixed(2)}M</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Revenue</Typography>
              <Typography variant="h5">${(summary.totalRevenue / 1000).toFixed(1)}K</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Users" />
          <Tab label="Transactions" />
          <Tab label="Revenue" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {loading.analytics ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <Typography>Loading analytics data...</Typography>
        </Box>
      ) : (
        renderTabContent()
      )}
    </Box>
  );
};

export default AnalyticsPage;
