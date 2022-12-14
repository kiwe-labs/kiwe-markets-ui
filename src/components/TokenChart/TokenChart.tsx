import React, { useState } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { Sparklines, SparklinesLine } from "react-sparklines";

const LinearGradientFill = () => {
  return (
    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#96FF00" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#96FF00" stopOpacity="0" />
    </linearGradient>
  );
};

const useStyles = makeStyles((theme) => ({
  range: {
    color: "#fff",
    padding: 4,
    fontWeight: "bold",
    margin: "0 10px",
  },
  active: {
    color: "#96FF00",
  },
}));

export default function TokenChart({ token }: { token: any }) {
  const styles = useStyles();
  const [sparkRange, setSparkRange] = useState(168);

  return (
    <Grid container className="chart-wrapper">
      <Grid item xs={8} sm={6} md={8}>
        <h1 style={{ color: "#fff", fontSize: 24, lineHeight: "29px", marginBottom: 4 }}>
          {token.name}&nbsp;Price Chart
          
        </h1>
        <h2 style={{ color: "#FFFAF5", fontSize: 32, lineHeight: "68px", marginBottom: 4 }}>
          {token.market_data?.current_price?.["usd"] ?
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(token.market_data.current_price["usd"])
          : "-"}
        </h2>
        <div style={{ fontSize: 18, color: token.market_data?.price_change_24h >= 0 ?"#96FF00" : "red" }}>
          <span className={styles.range} style={{ color: "#FFFAF5", fontSize: 14, top: "-2px", position: "relative", marginRight: 10 }}>
            24h
          </span>
          {token.market_data?.price_change_24h &&
            ` ${token.market_data.price_change_percentage_24h}%`
           }
           
        </div>
      </Grid>
      <Grid item sm={12} md={6}>
        <a className={`${styles.range} ${sparkRange === 12 ? styles.active : ''}`} onClick={() => setSparkRange(12)}>12h</a>
        <a className={`${styles.range} ${sparkRange === 24 ? styles.active : ''}`} onClick={() => setSparkRange(24)}>1d</a>
        <a className={`${styles.range} ${sparkRange === 168 ? styles.active : ''}`} onClick={() => setSparkRange(168)}>7d</a>
      </Grid>
      <Grid item xs={12} style={{ marginTop: 16, marginLeft: 4 }}>
        {token.market_data.sparkline_7d &&
          <Sparklines data={token.market_data.sparkline_7d.price ? token.market_data.sparkline_7d.price.slice(168 - sparkRange) : 'no data'} height={280} width={688}>
            <defs>
              <LinearGradientFill />
            </defs>
            <SparklinesLine color="#96FF00" style={{ fillOpacity: "1", fill: "url(#gradient)", strokeWidth: "2" }} />
          </Sparklines>
        }
      </Grid>
    </Grid>
  );
}
