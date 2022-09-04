import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Grid, makeStyles, Typography } from "@material-ui/core";
import styled from 'styled-components';
import { useLocalStorageState } from '../utils/utils';
import { Sparklines, SparklinesLine } from "react-sparklines";
import FloatingElementMarket from '../components/layout/FloatingElementMarket';
import { useConnection } from '../utils/connection';
import { PublicKey } from '@solana/web3.js';
import TokenMints from "../config/token-mints.json"
import Markets from "../config/markets.json"
import Logos from "../config/logos.json"
import cgToken from "../config/last-coins.json"
import {
  TokenListProvider,
  TokenInfo
} from "@solana/spl-token-registry";
import TokenIcon from "../components/common/TokenIcon";
import SearchBar from "../components/common/SearchBar";
import { Table, Button, Skeleton } from 'antd';
import { getAllToken } from '../utils/tokenApi';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

const { Column } = Table;
const useStyles = makeStyles(_ => ({
  root: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    textAlign: "center",
    alignItems: "center"
  },
  marketHeader: {
    backgroundColor: '#0f1625',
    width: "100%",
    justifyContent: "center",
  },
  mainTitle: {
    marginTop: "40px",
    marginBottom: "16px",
    fontFamily: "Inter",
    fontStyle: "normal",
    fontWeight: 600,
    fontSize: "32px",
    lineHeight: "48px"
  },
  filters: {
    display: "flex",
    marginBottom: 24,
    justifyContent: "center"
  },
  search: {
    position: 'relative',
    borderRadius: 8,
    marginTop: 25,
    height: 64,
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
  },
  favoritesToggle: {
    backgroundColor: '#121616',
    borderRadius: 8,
    padding: 8
  },
  toggleButton: {
    borderRadius: 8
  },
  tableRoot: {
    width: '100%',
    padding: "0 25px",
  },
  tableRootMob: {
    width: '100%',
  },
  nameColumn: {
    display: "flex",
    alignItems: "center"
  },
  tokenName: {
    display: "flex",
    flexDirection: "column",
    color: "#ffffff",
    marginLeft: 16,
    float: "left"
  },
  tokenNameMob: {
    display: "flex",
    flexDirection: "column",
    color: "#ffffff",
    marginLeft: 4,
    textAlign: "center",
    alignItems: 'center',
    fontSize: "12px",
  },
  row: {
    height: 72
  },
  col: {
    height: 72,
    padding: '14px !important',
    borderBottom: "1px solid #262C39 !important",
    fontSize: 16,
    width: '18%',

    '.ant-table-thead > tr > &': {
      backgroundColor: '#0f1625',
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 600,

      '&::before': {
        display: 'none'
      }
    },
  },
  colMob: {
    height: 72,
    fontSize: 12,
    borderBottom: "1px solid #262C39 !important",

    '.ant-table-thead > tr > &': {
      backgroundColor: '#0f1625',
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 600,

      '&::before': {
        display: 'none'
      }
    },
  },
  oddRow: {
    height: 72,
    backgroundColor: "#0f1625"
  },
  evenRow: {
    height: 72,
    backgroundColor: "#0f1625"
  },
  alignRight: {
    textAlign: 'right',

    '.ant-table-thead &': {
      textAlign: 'right'
    }
  },
  deltaPositive: {
    color: "#96FF00",
    display: "flex",
    justifyContent: "end"
  },
  deltaNegative: {
    color: "#FF0033",
    display: "flex",
    justifyContent: "end"
  },
  dataDailyIndicator: {
    color: '#FFFFFF',
    
    borderRadius: 2,
    padding: "2px 3px",
    marginRight: "6px"
  },
  deltaPositiveMob: {
    color: "#96FF00",
    display: "flex",
    //justifyContent: "end"
  },
  deltaNegativeMob: {
    color: "#FF0033",
    display: "flex",
    //justifyContent: "end"
  },
  dataDailyIndicatorMob: {
    color: '#FFFFFF',
    //borderRadius: 2,
    //padding: "2px 3px",
    //marginRight: "6px"
  }
}));

interface Market {
  key: String;
  baseToken: TokenInfo;
  pair: String;
  price: String | null;
  delta: String | null;
  volume: String | null;
  marketCap: Number | null;
}

const currencyConfig = {
  style: 'currency',
  currency: 'USD',
  useGrouping: true,
};
const currencyFormat = new Intl.NumberFormat('en-US', currencyConfig);
const longCurrencyFormat = new Intl.NumberFormat('en-US', {
  ...currencyConfig,
  minimumFractionDigits: 6,
});

const LinearGradientFill = () => {
  return (
    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#96FF00" stopOpacity="1" />
      <stop offset="0%" stopColor="#96FF00" stopOpacity="0" />
    </linearGradient>
  );
};

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .borderNone .ant-select-selector {
    border: none !important;
  }
`;

export default function MarketsPage() {

  return (
    <MarketsPageInner />
  );
}

function MarketsPageInner() {

  const styles = useStyles();
  const [tokens, setTokens] = useState({});
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [markets, setMarkets] = useState(Array<Market>());
  const [filterText, setFilterText] = useState('');

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const connection = useConnection();

  const width = dimensions?.width;

  useEffect(() => {
    (async function getTokenData() {

      let tokenList = await new TokenListProvider().resolve();

      const serumTokens = {}
      tokenList.getList().forEach(t => {
        serumTokens[t.name] = t
      })

      let fullTokenList = new Map<String, TokenInfo>()

      //tokens
      TokenMints.forEach(t => {
      
        const usdcMarket = Markets.find(m => m.name === `${t.name}/USDC` && !m.deprecated)

        const usdtMarket = Markets.find(m => m.name === `${t.name}/USDT` && !m.deprecated)

        fullTokenList[t.name] = {
          name: t.fullname,
          address: t.address,
          decimals: 9,
          chainId: 101,
          symbol: t.name,
          logoURI: Logos[t.name],
          extensions: {
            serumV3Usdc: usdcMarket ? usdcMarket.address : undefined,
            serumV3Usdt: usdtMarket ? usdtMarket.address : undefined
          }
        }
      })

      setTokens(fullTokenList)

      const allMarkets = new Array<Market>()

      await Markets.forEach(m => {
        const assets = m.name.split("/")
        const baseTokenSymbol = assets[0]
        const baseTokenInfo = fullTokenList[baseTokenSymbol] || {}
        baseTokenInfo.parentMarket = m.address

        if (allMarkets.find((market: any) => market.key === m.name)) {
          return
        }

        let market = {
          key: m.name,
          baseToken: baseTokenInfo,
          pair: m.name,
          price: null,
          high_24h: null,
          low_24h: null,
          delta: null,
          sparkline: null,
          volume: null,
          marketCap: null
        }

        allMarkets.push(market);
      })

      let allMarketsIds = allMarkets.map(am => {
        let coinSymbol = am.baseToken.symbol;
        let [filteredCgToken] = cgToken.filter(cgt => {
          return cgt.symbol === (coinSymbol && coinSymbol.toLowerCase())
        });
        if (filteredCgToken) {
          
          return filteredCgToken.id;
        }
      });

      let allTokensInfo;
      try {
        allTokensInfo = await getAllToken(allMarketsIds);
      } catch (e) {
        console.log(e);
        return
      }

      let allMarketsUpdate = new Array<Market>();
      let failedCoinsList = new Array<Market>();

      Markets.map(async m => {
        const assets = m.name.split("/");
        const baseTokenSymbol = assets[0];
        
        if (assets[1] !== "USDC") {
          return;
        }
        
        const baseTokenInfo = fullTokenList[baseTokenSymbol] || {};
        baseTokenInfo.parentMarket = m.address;
        if (allMarketsUpdate.find((market: any) => market.key === m.name)) {
          return
        }

        //CoinGecko data
        let coinAddress = baseTokenInfo.address;

        let [filteredCgToken] = cgToken.filter(cgt => {
          return cgt.platforms.solana === coinAddress
        });

        if (!filteredCgToken) {
          return;
        }

        let market;
        let [tokenInfo] = allTokensInfo.filter(at => at.id === filteredCgToken.id);

        try {
          if (
            !tokenInfo.current_price ||
            !tokenInfo.high_24h ||
            !tokenInfo.low_24h ||
            !tokenInfo.price_change_percentage_24h ||
            !tokenInfo.sparkline_in_7d.price ||
            !tokenInfo.total_volume
          ) {
            throw new Error('ERROR: missing data in API response for this coin.')
          }

          market = {
            key: m.name,
            baseToken: baseTokenInfo,
            pair: m.name,
            price: tokenInfo.current_price,
            high_24h: tokenInfo.high_24h,
            low_24h: tokenInfo.low_24h,
            delta: tokenInfo.price_change_percentage_24h,
            sparkline: tokenInfo.sparkline_in_7d.price,
            volume: tokenInfo.total_volume,
            marketCap: tokenInfo.market_cap || 0
          }


          if (tokenInfo.market_cap === 0) {
            failedCoinsList.push(market);
          }
        } catch (e) {
          return;
        }

        allMarketsUpdate.push(market)
      });

      setMarkets(allMarketsUpdate);
      setIsDataLoading(false);

      //@ts-ignore
      let failedCoinsAddresses = failedCoinsList.map(fc => {
        return new PublicKey(fc.baseToken.address);
      });

      let updateList: any = [];

      await failedCoinsAddresses.reduce(async (promise, failed, index) => {
        await promise;

        let mintinfo = await connection.getTokenSupply(failed);
        // console.log('mintinfo.value: ', mintinfo.value);
        //@ts-ignore
        let supply = parseInt(mintinfo.value.amount) / 10 ** mintinfo.value.decimals;
        //@ts-ignore
        let marketCap = supply * failedCoinsList[index].price;

        let indexOf = allMarketsUpdate.findIndex(amu => {
          return amu.baseToken.address === failed.toBase58()
        });
        updateList.push([
          indexOf,
          marketCap
        ])
      }, Promise.resolve())

      setMarkets(localMarkets => {
        let items = [...localMarkets];

        updateList.forEach(([indexOf, marketCap]) => {
          let item = {
            ...items[indexOf],
            marketCap
          }
          items[indexOf] = item;
        });

        return items;
      });
    })();

    //console.log('end');

  }, []);

  let filteredMarkets = filterText !== ''
    ? markets.filter(m => {
      return (m.baseToken.name || '').toLowerCase().includes(filterText) || (m.pair || '').toLowerCase().includes(filterText)
    })
    : markets;

  const defaultSortOrder: "descend" | "ascend" | null | undefined = "descend";

  /*
  const COLORS = {
    GREEN: '#25f383',
    RED: '#FF0033',
  }
  */

  const RenderNormal = (() => {
    return (
      <FloatingElementMarket style={{ flex: 1, overflow: 'hidden' }}>
        <Grid
          container
          justifyContent="flex-start"
          alignItems="flex-start"
          className={styles.root}
        >
         
          <Grid item xs={12} style={{ width: '100%' }}>
            <div className={styles.tableRoot}>
              {markets &&
                <Table
                  loading={isDataLoading}
                  dataSource={filteredMarkets}
                  pagination={{ pageSize: (10), position: ['bottomRight'] }}
                  rowClassName={(_, index) => {
                    return index % 2 === 0 ? styles.evenRow : styles.oddRow
                  }}
                >
                
                  <Column
                    title="Name"
                    dataIndex="baseToken"
                    key="baseToken"
                    className={styles.col}
                    render={(baseToken) => {

                      return (
                        <div className={styles.nameColumn}>
                          <a href={`/#/market/${baseToken.parentMarket}`}>
                            <TokenIcon symbol={baseToken.symbol} />
                          </a>
                          <div className={styles.tokenName}>
                            <a href={`/#/market/${baseToken.parentMarket}`}>
                              <Typography className={styles.tokenName}>{baseToken.name}</Typography>
                            </a>
                          </div>
                        </div>
                      )
                    }}
                  />
                
                  <Column
                    title="Pair"
                    dataIndex="baseToken"
                    key="baseToken"
                    className={styles.col}
                    render={(baseToken) => {
                     
                      return (
                        <div className={styles.nameColumn}>
                          <div className={styles.tokenName}>
                            <a href={`/#/market/${baseToken.parentMarket}`}>
                              <Typography className={styles.tokenName}><b>{baseToken.symbol} / USDC</b></Typography>
                            </a>

                          </div>
                        </div>
                      )
                    }}
                  />

                  <Column
                    title="Price"
                    dataIndex="price"
                    key="price"
                    align="right"
                    sorter={(a: any, b: any) => a.price - b.price}
                    className={[styles.col].join(" ")}
                    render={(price) => {
                      if (price) {
                        return longCurrencyFormat.format(price)
                      } else {
                        return <Skeleton />
                      }
                    }} 
                  />

                  <Column
                    title={() => <>Change <span className={styles.dataDailyIndicator}>24h</span></>}
                    dataIndex="delta"
                    key="delta"
                    align="right"
                    sorter={(a: any, b: any) => a.delta - b.delta}
                    className={[styles.col].join(" ")}
                    render={(delta) => {
                      if (delta >= 0) {
                        return (
                          <>
                            {delta &&
                              <span className={styles.deltaPositive}>
                                <ArrowDropUpIcon /> {delta.toFixed(2)} %
                              </span>
                            }
                            {!delta &&
                              <Skeleton />
                            }
                          </>
                        )
                      } else {
                        return (
                          <>
                            {delta &&
                              <span className={styles.deltaNegative}>
                                <ArrowDropDownIcon /> {delta.toFixed(2)} %
                              </span>
                            }
                            {!delta &&
                              <Skeleton />
                            }
                          </>
                        )
                      }
                    }} 
                  />

                  <Column
                    title={() => <>Volume <span className={styles.dataDailyIndicator}>24h</span></>}
                    dataIndex="volume"
                    key="volume"
                    align="right"
                    sorter={(a: any, b: any) => a.volume - b.volume}
                    className={[styles.col].join(" ")}
                    render={(price) => {
                      if (price) {
                        return currencyFormat.format(price)
                      } else {
                        return <Skeleton />
                      }
                    }} 
                  />

                  <Column
                    title="Movement"
                    dataIndex="sparkline"
                    key="movement"
                    className={styles.col}
                    render={(baseToken) => {
                      return (
                        <>
                          {baseToken &&
                            <Sparklines data={baseToken} height={44} width={192}>
                              <defs>
                                <LinearGradientFill />
                              </defs>
                              <SparklinesLine color="#96FF00" style={{ fillOpacity: "1", fill: "url(#gradient)", strokeWidth: "2" }} />
                            </Sparklines>
                          }
                          {!baseToken &&
                            <Skeleton />
                          }
                        </>
                      )
                    }} 
                  />
                </Table>
              }
            </div>
          </Grid>
        </Grid>
      </FloatingElementMarket>
    )
  });


  const RenderSmaller = (() => {
    return (
      <FloatingElementMarket style={{ flex: 1, overflow: 'hidden' }}>
        <Grid
          container
          justifyContent="flex-start"
          alignItems="flex-start"
          className={styles.root}
        >
         
          <Grid item xs={12} style={{ width: '100%' }}>
            <div className={styles.tableRootMob}>
              {markets &&
                <Table
                  loading={isDataLoading}
                  dataSource={filteredMarkets}
                  pagination={{ pageSize: (10), position: ['bottomRight'] }}
                  rowClassName={(_, index) => {
                    return index % 2 === 0 ? styles.evenRow : styles.oddRow
                  }}
                >
                
                  <Column
                    title="Market"
                    dataIndex="baseToken"
                    key="baseToken"
                    className={styles.colMob}
                    render={(baseToken) => {

                      return (
                        <div className={styles.nameColumn}>
                          <a href={`/#/market/${baseToken.parentMarket}`}>
                            <TokenIcon symbol={baseToken.symbol} />
                          </a>
                          <div className={styles.tokenNameMob}>
                            <a href={`/#/market/${baseToken.parentMarket}`}>
                              <Typography className={styles.tokenNameMob}><b>{baseToken.symbol}/USDC</b></Typography>
                            </a>
                          </div>
                        </div>
                      )
                    }}
                  />

                   <Column
                    title={() => <><span className={styles.dataDailyIndicatorMob}>24h</span></>}
                    dataIndex="delta"
                    key="delta"
                    align="right"
                    sorter={(a: any, b: any) => a.delta - b.delta}
                    className={[styles.colMob].join(" ")}
                    render={(delta) => {
                      if (delta >= 0) {
                        return (
                          <>
                            {delta &&
                              <span className={styles.deltaPositiveMob}>
                                <b>{delta.toFixed(2)}%</b>
                              </span>
                            }
                            {!delta &&
                              <Skeleton />
                            }
                          </>
                        )
                      } else {
                        return (
                          <>
                            {delta &&
                              <span className={styles.deltaNegativeMob}>
                                <b>{delta.toFixed(2)}%</b>
                              </span>
                            }
                            {!delta &&
                              <Skeleton />
                            }
                          </>
                        )
                      }
                    }} 
                  />

                  <Column
                    title="Movement"
                    dataIndex="sparkline"
                    key="movement"
                    className={styles.colMob}
                    render={(baseToken) => {
                      return (
                        <>
                          {baseToken &&
                            <Sparklines data={baseToken} height={44} width={192}>
                              <defs>
                                <LinearGradientFill />
                              </defs>
                              <SparklinesLine color="#96FF00" style={{ fillOpacity: "1", fill: "url(#gradient)", strokeWidth: "2" }} />
                            </Sparklines>
                          }
                          {!baseToken &&
                            <Skeleton />
                          }
                        </>
                      )
                    }} 
                  />

                </Table>
              }
            </div>
          </Grid>
        </Grid>
      </FloatingElementMarket>
    )
  });

  const component = (() => {
    if (width < 1000) {
      return <RenderSmaller />;
    } else {
      return <RenderNormal />;
    }
  })();

  return (
    <>
      <Wrapper>
        {component}
      </Wrapper>
    </>
  );
}