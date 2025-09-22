import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

function Footer() {
    return (
        <Box component="footer" sx={{ marginTop: 'auto', flexGrow: 1, px: 2, py: 1 }} >
            <Divider sx={{ my: 2 }} />
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                textAlign: 'center',
                marginBottom: 4,
            }}>
                <Typography variant="caption" color="text.secondary">
                    &copy; 2025{' '}
                    <Link href="http://github.com/theonlyasdk" color="inherit" underline="hover">
                        theonlyasdk
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default Footer;