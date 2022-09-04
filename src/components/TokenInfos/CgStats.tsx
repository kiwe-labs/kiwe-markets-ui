import React, { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import { useMarket } from '../../utils/markets';
import cgTokens from "../../config/cg_ids.json";
import TokenMints from "../../config/token-mints.json";
import TokenChart from "./TokenName";
import TokenStats from "./TokenStats";

export default function DestinationStats() {
  const { baseCurrency } = useMarket();

  const tokenMint = TokenMints.find(t => t.name === `${baseCurrency}`)
  const tokenInfo = tokenMint ? tokenMint.name : ''

  return <TokenGrid token={tokenInfo?.toLowerCase()} />
}

export function TokenGrid({ token, children }: { token?: string, children?: any }) {
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cgToken = cgTokens.find(cgToken => cgToken.symbol.toLowerCase() === token);

  useEffect(() => {
    if (cgToken) {
      setLoading(true);
      fetch(`https://api.coingecko.com/api/v3/coins/${cgToken.id}?tickers=false&community_data=false&developer_data=false&sparkline=true`)
        .then(response => response.json())
        .then(json => {
          setTokenDetails(json);
          setLoading(false);
        })
        .catch(e => {
          console.log('Error: ', e);
        });
    }
  }, [token])

  return (
    <>
      {cgToken ?
        tokenDetails &&
        <Grid container style={{ height: "340px", padding: "5% 10% 5% 5%" }}>
          <TokenChart token={tokenDetails} />
          <TokenStats token={tokenDetails}>
            {children}
          </TokenStats>
        </Grid>
        :
        <Grid container style={{ height: "340px", padding: "5% 10% 5% 5%", justifyContent: "center", alignItems: "center" }}>
          <div>No data available</div>
        </Grid>
      }
    </>
  );
}
