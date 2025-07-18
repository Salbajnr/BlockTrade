import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Skeleton,
  Divider,
  Alert,
  IconButton,
  Stack
} from '@mui/material';
import { FiUser, FiMail, FiLock, FiArrowRight, FiStar } from 'react-icons/fi';

export default function StyleGuide() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Typography Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h1" gutterBottom>Typography</Typography>
        <Typography variant="h2" gutterBottom>Heading 2</Typography>
        <Typography variant="h3" gutterBottom>Heading 3</Typography>
        <Typography variant="h4" gutterBottom>Heading 4</Typography>
        <Typography variant="h5" gutterBottom>Heading 5</Typography>
        <Typography variant="h6" gutterBottom>Heading 6</Typography>
        <Typography variant="body1" gutterBottom>
          Body 1 - The quick brown fox jumps over the lazy dog
        </Typography>
        <Typography variant="body2" gutterBottom>
          Body 2 - The quick brown fox jumps over the lazy dog
        </Typography>
      </Paper>

      {/* Colors Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" gutterBottom>Colors</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Primary Colors</Typography>
            <Stack direction="row" spacing={2}>
              <Box sx={{ width: 100, height: 100, bgcolor: 'primary.main', borderRadius: 1 }} />
              <Box sx={{ width: 100, height: 100, bgcolor: 'primary.light', borderRadius: 1 }} />
              <Box sx={{ width: 100, height: 100, bgcolor: 'primary.dark', borderRadius: 1 }} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Secondary Colors</Typography>
            <Stack direction="row" spacing={2}>
              <Box sx={{ width: 100, height: 100, bgcolor: 'secondary.main', borderRadius: 1 }} />
              <Box sx={{ width: 100, height: 100, bgcolor: 'secondary.light', borderRadius: 1 }} />
              <Box sx={{ width: 100, height: 100, bgcolor: 'secondary.dark', borderRadius: 1 }} />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Status Colors</Typography>
            <Stack direction="row" spacing={2}>
              <Box sx={{ width: 100, height: 100, bgcolor: 'success.main', borderRadius: 1 }} />
              <Box sx={{ width: 100, height: 100, bgcolor: 'warning.main', borderRadius: 1 }} />
              <Box sx={{ width: 100, height: 100, bgcolor: 'error.main', borderRadius: 1 }} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Buttons Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" gutterBottom>Buttons</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="contained">Contained Button</Button>
          <Button variant="outlined">Outlined Button</Button>
          <Button variant="text">Text Button</Button>
          <Button variant="contained" disabled>Disabled</Button>
          <Button variant="contained" startIcon={<FiStar />}>With Icon</Button>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="contained" color="success">Success</Button>
          <Button variant="contained" color="warning">Warning</Button>
          <Button variant="contained" color="error">Error</Button>
        </Stack>
      </Paper>

      {/* Form Elements Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" gutterBottom>Form Elements</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Input"
              placeholder="Enter text here"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="With Icon"
              placeholder="Enter email"
              InputProps={{
                startAdornment: <FiMail style={{ marginRight: 8 }} />,
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Error State"
              error
              helperText="This field is required"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Disabled"
              disabled
              value="Disabled input"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Alert severity="success">This is a success message</Alert>
              <Alert severity="info">This is an info message</Alert>
              <Alert severity="warning">This is a warning message</Alert>
              <Alert severity="error">This is an error message</Alert>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Cards Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" gutterBottom>Cards</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Card Title</Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a sample card with some content. Cards can contain various types of content.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
                <Button size="small" color="primary">Action</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Interactive Card</Typography>
                <Typography variant="body2" color="text.secondary">
                  This card has hover effects and interactive elements.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip label="Tag 1" size="small" />
                  <Chip label="Tag 2" size="small" color="primary" />
                </Stack>
              </CardContent>
              <CardActions>
                <IconButton size="small">
                  <FiStar />
                </IconButton>
                <IconButton size="small">
                  <FiArrowRight />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>Loading Card</Typography>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
                <Box sx={{ mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" gutterBottom>Tables</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>john@example.com</TableCell>
                <TableCell>
                  <Chip label="Active" color="success" size="small" />
                </TableCell>
                <TableCell>
                  <Button size="small">Edit</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>jane@example.com</TableCell>
                <TableCell>
                  <Chip label="Pending" color="warning" size="small" />
                </TableCell>
                <TableCell>
                  <Button size="small">Edit</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
} 