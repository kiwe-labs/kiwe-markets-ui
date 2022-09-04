import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import CoinLogos from '../../config/logos.json';
import styled from 'styled-components';

const CoinLogo = styled.img({
  width: 80,
  height: 80,
  marginRight: 12,
});

export default function TokenChart({ token }: { token: any }) {

  return (
    <Grid container className="chart-wrapper">
      <Grid item sm={12} md={8}>
        <CoinLogo src={CoinLogos[token.symbol?.toUpperCase()]} alt={token.symbol?.toUpperCase()} />
        <h1 style={{ color: "#fff", fontSize: 20, lineHeight: "79px", marginBottom: 4 }}>
          {token.name}&nbsp;(<span style={{ color: "#fff" }}>{token.symbol?.toUpperCase()}</span>)
        </h1>
      </Grid>
    </Grid>
  );
}
