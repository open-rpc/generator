import React, { useEffect } from "react";
import { Grid, Typography, Box, Button } from "@material-ui/core";
import { Link as GatsbyLink } from "gatsby";
import Link from "@material-ui/core/Link";
import { grey } from "@material-ui/core/colors";

const MyApp: React.FC = () => {
  return (
    <>
      <Grid container alignContent="center" alignItems="center" justify="center" direction="column">
<img className="logo" alt="logo" src={"https://camo.githubusercontent.com/bc04ec4cd12a232ee902ce0c0344098ad854e80d/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f6d61782f313439322f312a337256307a30756654716b474334524a3376585177412e706e67"} style={{ paddingTop: "10%" }} />
        <br/>
        <Typography variant="h1">MySnap</Typography>
        <Typography gutterBottom style={{ paddingTop: "100px", paddingBottom: "20px" }} variant="inherit">
          
        </Typography>
        <br/>
        <Button variant="contained" color="primary" href="/api-documentation">
          Plugin Documentation
        </Button>
        <br />
        <br />
        <br />
      </Grid>
    </>
  );
};

export default MyApp;
