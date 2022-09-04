import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Col, Popover, Row, Select, Typography } from 'antd';
import styled from 'styled-components';
import Orderbook from '../components/Orderbook';
import UserInfoTable from '../components/UserInfoTable';
import FloatingElement from '../components/layout/FloatingElement';
import StandaloneBalancesDisplay from '../components/StandaloneBalancesDisplay';
import {
  getMarketInfos,
  getTradePageUrl,
  MarketProvider,
  useMarket,
  useMarketsList,
  useUnmigratedDeprecatedMarkets,
} from '../utils/markets';
import TradeForm from '../components/TradeForm';
import TradesTable from '../components/TradesTable';
import LinkAddress from '../components/LinkAddress';
import DeprecatedMarketsInstructions from '../components/DeprecatedMarketsInstructions';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { notify } from '../utils/notifications';
import { useHistory, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Grid } from "@material-ui/core";
import CoinLogos from '../config/logos.json';
import ChartStats from "../components/TokenChart/ChartStats";
import CgStats from "../components/TokenInfos/CgStats";

const { Option, OptGroup } = Select;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 16px;
  .borderNone .ant-select-selector {
    border: none !important;
  }
`;

export default function TradePage() {
  const { marketAddress } = useParams();
  useEffect(() => {
    if (marketAddress) {
      localStorage.setItem('marketAddress', JSON.stringify(marketAddress));
    }
  }, [marketAddress]);
  const history = useHistory();
  function setMarketAddress(address) {
    history.push(getTradePageUrl(address));
  }

  return (
    <MarketProvider
      marketAddress={marketAddress}
      setMarketAddress={setMarketAddress}
    >
      <TradePageInner />
    </MarketProvider>
  );
}

function TradePageInner() {
  const {
    market,
    marketName,
    customMarkets,
    setCustomMarkets,
    setMarketAddress,
  } = useMarket();
  const markets = useMarketsList();
  const [handleDeprecated, setHandleDeprecated] = useState(false);
  const [addMarketVisible, setAddMarketVisible] = useState(false);
  const deprecatedMarkets = useUnmigratedDeprecatedMarkets();
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    document.title = 'Kiwe Markets';
  });

  const changeOrderRef = useRef<
    ({ size, price }: { size?: number; price?: number }) => void
  >();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const width = dimensions?.width;
  const componentProps = {
    onChangeOrderRef: (ref) => (changeOrderRef.current = ref),
    onPrice: useCallback(
      (price) => changeOrderRef.current && changeOrderRef.current({ price }),
      [],
    ),
    onSize: useCallback(
      (size) => changeOrderRef.current && changeOrderRef.current({ size }),
      [],
    ),
  };
  
  const component = (() => {
    if (handleDeprecated) {
      return (
        <DeprecatedMarketsPage
          switchToLiveMarkets={() => setHandleDeprecated(false)}
        />
      );
    } else if (width < 1000) {
      return <RenderSmaller {...componentProps} />;
    } else if (width < 1450) {
      return <RenderSmall {...componentProps} />;
    } else {
      return <RenderNormal {...componentProps} />;
    }
  })();

  const onAddCustomMarket = (customMarket) => {
    const marketInfo = getMarketInfos(customMarkets).some(
      (m) => m.address.toBase58() === customMarket.address,
    );
    if (marketInfo) {
      notify({
        message: `A market with the given ID already exists`,
        type: 'error',
      });
      return;
    }
    const newCustomMarkets = [...customMarkets, customMarket];
    setCustomMarkets(newCustomMarkets);
    setMarketAddress(customMarket.address);
  };

  const onDeleteCustomMarket = (address) => {
    const newCustomMarkets = customMarkets.filter((m) => m.address !== address);
    setCustomMarkets(newCustomMarkets);
  };

  return (
    <>
      <Wrapper>
        <Row
          align="middle"
          style={{ paddingLeft: 5, paddingRight: 5 }}
          gutter={16}
        >
          <Col>
            <MarketSelector
              markets={markets}
              setHandleDeprecated={setHandleDeprecated}
              placeholder={'Select market'}
              customMarkets={customMarkets}
              onDeleteCustomMarket={onDeleteCustomMarket}
            />
          </Col>
          {market ? (
            <Col>
              <Popover
                content={<LinkAddress address={market.publicKey.toBase58()} />}
                placement="bottomRight"
                title="Market address"
                trigger="click"
              >
                <InfoCircleOutlined style={{ fontSize: "25px", color: '#96FF00' }} />
              </Popover>
            </Col>
          ) : null}
         
          {deprecatedMarkets && deprecatedMarkets.length > 0 && (
            <React.Fragment>
              <Col>
                <Typography>
                  You have unsettled funds on old markets! Please go through
                  them to claim your funds.
                </Typography>
              </Col>
              <Col>
                <Button onClick={() => setHandleDeprecated(!handleDeprecated)}>
                  {handleDeprecated ? 'View new markets' : 'Handle old markets'}
                </Button>
              </Col>
            </React.Fragment>
          )}
        </Row>
        {component}
      </Wrapper>
    </>
  );
}

function MarketSelector({
  markets,
  placeholder,
  setHandleDeprecated,
  customMarkets,
  onDeleteCustomMarket,
}) {
  const { market, setMarketAddress } = useMarket();

  const onSetMarketAddress = (marketAddress) => {
    setHandleDeprecated(false);
    setMarketAddress(marketAddress);
  };

  const extractBase = (a) => a.split('/')[0];
  const extractQuote = (a) => a.split('/')[1];

  const selectedMarket = getMarketInfos(customMarkets)
    .find(
      (proposedMarket) =>
        market?.address && proposedMarket.address.equals(market.address),
    )
    ?.address?.toBase58();

  const marketName = markets.find(m => m.address == selectedMarket)?.name

  return (
    <div style={{ position: 'relative' }}>

    <Select
      showSearch
      size={'large'}
      style={{ width: 200 }}
      placeholder={placeholder || 'Select a market'}
      optionFilterProp="name"
      onSelect={onSetMarketAddress}
      listHeight={400}
      value={selectedMarket}
      filterOption={(input, option) =>
        option?.name?.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      
      <OptGroup label="Markets">
        {markets
          .sort((a, b) =>
            extractQuote(a.name) === 'USDT' && extractQuote(b.name) !== 'USDT'
              ? -1
              : extractQuote(a.name) !== 'USDT' &&
                extractQuote(b.name) === 'USDT'
              ? 1
              : 0,
          )
          .sort((a, b) =>
            extractBase(a.name) < extractBase(b.name)
              ? -1
              : extractBase(a.name) > extractBase(b.name)
              ? 1
              : 0,
          )
          .map(({ address, name, deprecated }, i) => (
            <Option
              value={address.toBase58()}
              key={nanoid()}
              name={name}
              style={{
                padding: '10px',
                // @ts-ignore
                backgroundColor: i % 2 === 0 ? '#1C2222' : '#121616',
              }}
            >
              
              {1 &&
                  <div className="market-logos">
                    {name.split('/').map(market => (
                      CoinLogos[market] && <img key={market} src={CoinLogos[market]} />
                    ))}
                  </div>
                }
                <span>
                  {name.split('/')[0]} / {name.split('/')[1]} {deprecated ? ' (Deprecated)' : null}
                </span>
            </Option>
          ))}
      </OptGroup>
    </Select>
    </div>
  );
}

const DeprecatedMarketsPage = ({ switchToLiveMarkets }) => {
  return (
    <>
      <Row>
        <Col flex="auto">
          <DeprecatedMarketsInstructions
            switchToLiveMarkets={switchToLiveMarkets}
          />
        </Col>
      </Row>
    </>
  );
};

const RenderNormal = ({ onChangeOrderRef, onPrice, onSize }) => {
  return (
    <>
      <Row
        style={{
          minHeight: '650px',
          flexWrap: 'nowrap',
        }}
      >
      
        <Col flex={'400px'} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Orderbook smallScreen={false} onPrice={onPrice} onSize={onSize} />
        </Col>
        <Col
          flex="auto"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <FloatingElement style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <CgStats />
            </Grid>
          </FloatingElement>  
    
            <Row style={{ height: '100%' }}>
              <Col
                flex="auto"
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <TradeForm setChangeOrderRef={onChangeOrderRef} />

              </Col>
            </Row>
        </Col>

        <Col
          flex="700px"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <FloatingElement style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <ChartStats />
            </Grid>
          </FloatingElement>
        </Col>
      </Row>
      <Row style={{ height: '100%' }}>
        <UserInfoTable />
      </Row>
    </>
  );
};

const RenderSmall = ({ onChangeOrderRef, onPrice, onSize }) => {
  return (
    <>
      <Row
        style={{
          minHeight: '200px',
          flexWrap: 'nowrap',
        }}
      >
        <Col flex="1" style={{ height: '100%', display: 'flex' }}>
          <FloatingElement style={{ flex: 2, padding: 0, overflow: 'hidden'  }}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <CgStats />
            </Grid>
          </FloatingElement>
        </Col>
      </Row>
      <Row
        style={{
          minHeight: '200px',
          flexWrap: 'nowrap',
        }}
      >
        <Col
          flex="auto"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
           <FloatingElement style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <ChartStats />
            </Grid>
          </FloatingElement>
        </Col>
      </Row>
      <Row
        style={{
          minHeight: '200px',
          flexWrap: 'nowrap',
        }}
      >
        <Col
          flex="auto"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
         <TradeForm setChangeOrderRef={onChangeOrderRef} />

        </Col>
      </Row>
      <Row>
        <Col flex="auto" style={{ height: '100%', display: 'flex' }}>
          <Orderbook
            smallScreen={true}
            depth={13}
            onPrice={onPrice}
            onSize={onSize}
          />
        </Col>
      </Row>
      
      <Row>
        <Col flex="auto">
          <UserInfoTable />
        </Col>
      </Row>
    </>
  );
};

const RenderSmaller = ({ onChangeOrderRef, onPrice, onSize }) => {
  return (
    <>
      <Row
        style={{
          minHeight: '200px',
          flexWrap: 'nowrap',
        }}
      >
        <Col flex="1" style={{ height: '100%', display: 'flex' }}>
          <FloatingElement style={{ flex: 2, minHeight: '500px', padding: 0, overflow: 'hidden'  }}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <CgStats />
            </Grid>
          </FloatingElement>
        </Col>
      </Row>
      <Row
        style={{
          minHeight: '200px',
          flexWrap: 'nowrap',
        }}
      >
        <Col
          flex="auto"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <FloatingElement style={{ flex: 2, minHeight: '450px', padding: 0, overflow: 'hidden'  }}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <ChartStats />
            </Grid>
          </FloatingElement>
        </Col>
      </Row>
      <Row
        style={{
          minHeight: '200px',
          flexWrap: 'nowrap',
        }}
      >
        <Col
          flex="auto"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <TradeForm setChangeOrderRef={onChangeOrderRef} />

        </Col>
      </Row>
      <Row>
        <Col flex="auto" style={{ height: '100%', display: 'flex' }}>
          <Orderbook
            smallScreen={true}
            depth={13}
            onPrice={onPrice}
            onSize={onSize}
          />
        </Col>
      </Row>
      
      <Row>
        <Col flex="auto">
          <UserInfoTable />
        </Col>
      </Row>
    </>
  );
};
