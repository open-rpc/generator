import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link } from 'gatsby';
import 'monaco-editor/esm/vs/language/json/json.worker.js';

// Import needed for Monaco editor workers
/*
if (typeof window !== 'undefined') {
 // import('monaco-editor/esm/vs/language/json/json.worker.js');
}
*/

const IndexPage = () => {
  // For SSR, we need a simpler version
  if (typeof window === 'undefined') {
    return (
      <Grid container alignItems="center" justifyContent="center" direction="column">
        <Typography variant="h1">Minimal OpenRPC Example</Typography>
        <Typography>Loading...</Typography>
      </Grid>
    );
  }

  // For client-side rendering, we show the full content
  return (
    <Grid container alignItems="center" justifyContent="center" direction="column">
      <img
        className="logo"
        alt="logo"
        src={
          'https://raw.githubusercontent.com/open-rpc/design/master/icons/open-rpc-logo-noText/open-rpc-logo-noText%20(PNG)/256x256.png'
        }
        style={{ paddingTop: '10%' }}
      />
      <Typography variant="h1">Minimal OpenRPC Example</Typography>
      <Box sx={{ paddingTop: '100px', paddingBottom: '20px' }}>
        <Button variant="contained" color="primary" component={Link} to="/api-documentation">
          API Reference Documentation
        </Button>
      </Box>
    </Grid>
  );
};

export default IndexPage;
