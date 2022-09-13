import { Button, Input, Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  useFeeDiscountKeys,
  useLocallyStoredFeeDiscountKey,
  useMarket,
  useMarkPrice,
  useSelectedBaseCurrencyAccount,
  useSelectedBaseCurrencyBalances,
  useSelectedOpenOrdersAccount,
  useSelectedQuoteCurrencyAccount,
  useSelectedQuoteCurrencyBalances,
} from '../utils/markets';
import { useWallet } from '../utils/wallet';
import { notify } from '../utils/notifications';
import { floorToDecimal, getDecimalCount, roundToDecimal, } from '../utils/utils';
import { useSendConnection } from '../utils/connection';
import FloatingElement from './layout/FloatingElement';
import { getUnixTs, placeOrder } from '../utils/send';
import { refreshCache } from '../utils/fetch-loop';
import CoinLogos from '../config/logos.json';
import tuple from 'immutable-tuple';
import { useIpAddress } from '../utils/useIpAddress';

const Wrapper = styled.div({
  padding: '10px 16px 16px',
  flex: 1,
});

const TradeSuffix = styled.span({
  fontSize: 12,
  background: '#2E3838',
  borderRadius: 4,
  width: 90,
  height: 'calc(100% + 8px)',
  marginRight: -11,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const TradeInput = styled(Input)({
  textAlign: 'left',
  paddingBottom: 8,
  '.ant-input-affix-wrapper': {
    borderRadius: 4,
    borderTopLeftRadius: '4px !important',
    borderBottomLeftRadius: '4px !important',
    

  },
  '.ant-input-group-addon': {
    background: '#121616',
  }
});

const InputSuffix = styled.div({
  width: '30px',
});

const CoinLogo = styled.img({
  width: 20,
  height: 20,
  marginRight: 6,
});

const TradeButton = styled(Button)({
  margin: '20px 0px 0px 0px',
  //background: 'transparent',
  background: (props) => props['buy-side'] ? '#8fc740' : '#D6002C',
  border: (props) => props['buy-side'] ? '#8fc740' : '2px solid #D6002C',
  color:(props) => props['buy-side'] ? '#0f1625' : '#0f1625',
  //color: '#fff',
  borderRadius: 8,
  fontWeight: 'bold',
  '&:hover': {
    background: (props) => props['buy-side'] ? '#8fc740' : '#FF0033',
    border: (props) => props['buy-side'] ? '2px solid #8fc740' : '2px solid #FF0033',
    color:(props) => props['buy-side'] ? '#0f1625' : '#0f1625',
  },
  '&:focus': {
    background: (props) => props['buy-side'] ? '#8fc740' : '#FF0033',
    border: (props) => props['buy-side'] ? '2px solid #8fc740)' : '2px solid #FF0033',
    color:(props) => props['buy-side'] ? '#0f1625' : '#0f1625',
  },
});

const ConnectButton = styled(Button)({
  margin: '20px 0px 0px 0px',
  background: 'linear-gradient(100.61deg, #C5EC53 0%, #92C119 100%)',
  border: '1px solid #8fc740 !important',
  color: '#0f1625',
  width: '100%',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 16,
  '&:hover': {
    background: 'linear-gradient(100.61deg, #C5EC53 0%, #92C119 100%)',
    color:'#0f1625',
  },
  '&:focus': {
    background: 'linear-gradient(100.61deg, #C5EC53 0%, #92C119 100%)',
    color: '#0f1625',
  },
});

const TradeRadioGroup = styled(Radio.Group)({
  width: '100%',
});

const BuyRadio = styled(Radio.Button)({
  lineHeight: '36px',
  height: 36,
  width: '50%',
  textAlign: 'center',
  color: (props) => props['data-active'] ? '#96FF00 !important' : '#none',
  background: 'none !important',
  border: 'none !important',
  borderBottom: (props) => props['data-active'] ? '2px solid #8fc740 !important' : 'none',
  '&:hover': {
    color: '#96FF00 !important',
  },
});

const SellRadio = styled(Radio.Button)({
  lineHeight: '36px',
  height: 36,
  width: '50%',
  textAlign: 'center',
  color: (props) => props['data-active'] ? '#FF0033 !important' : '#none',
  background: 'none !important',
  border: 'none !important',
  borderBottom: (props) => props['data-active'] ? '2px solid #FF0033 !important' : 'none',
  '&:hover': {
    color: '#FF0033 !important',
  },
});

export default function TradeForm({
  style,
  setChangeOrderRef,
}: {
  style?: any;
  setChangeOrderRef?: (
    ref: ({ size, price }: { size?: number; price?: number }) => void,
  ) => void;
}) {

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const baseCurrencyBalances = useSelectedBaseCurrencyBalances();
  const quoteCurrencyBalances = useSelectedQuoteCurrencyBalances();
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);
  const { wallet, connected, connect } = useWallet();
  const sendConnection = useSendConnection();
  const markPrice = useMarkPrice();
  useFeeDiscountKeys();
  const {
    storedFeeDiscountKey: feeDiscountKey,
  } = useLocallyStoredFeeDiscountKey();

  const { ipAllowed } = useIpAddress();
  const [postOnly, setPostOnly] = useState(false);
  const [ioc, setIoc] = useState(false);
  const [baseSize, setBaseSize] = useState<number | undefined>(undefined);
  const [quoteSize, setQuoteSize] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [sizeFraction, setSizeFraction] = useState(0);

  const availableQuote =
    openOrdersAccount && market
      ? market.quoteSplSizeToNumber(openOrdersAccount.quoteTokenFree)
      : 0;

  let quoteBalance = (quoteCurrencyBalances || 0) + (availableQuote || 0);
  let baseBalance = baseCurrencyBalances || 0;
  let sizeDecimalCount =
    market?.minOrderSize && getDecimalCount(market.minOrderSize);
  let priceDecimalCount = market?.tickSize && getDecimalCount(market.tickSize);

  const publicKey = wallet?.publicKey;

  useEffect(() => {
    setChangeOrderRef && setChangeOrderRef(doChangeOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChangeOrderRef]);

  useEffect(() => {
    baseSize && price && onSliderChange(sizeFraction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  useEffect(() => {
    updateSizeFraction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, baseSize]);

  useEffect(() => {
    const warmUpCache = async () => {
      try {
        if (!wallet || !publicKey || !market) {
          console.log(`Skipping refreshing accounts`);
          return;
        }
        const startTime = getUnixTs();
        console.log(`Refreshing accounts for ${market.address}`);
        await market?.findOpenOrdersAccountsForOwner(sendConnection, publicKey);
        await market?.findBestFeeDiscountKey(sendConnection, publicKey);
        const endTime = getUnixTs();
        console.log(
          `Finished refreshing accounts for ${market.address} after ${endTime - startTime
          }`,
        );
      } catch (e) {
        console.log(`Encountered error when refreshing trading accounts: ${e}`);
      }
    };
    warmUpCache();
    const id = setInterval(warmUpCache, 30_000);
    return () => clearInterval(id);
  }, [market, sendConnection, wallet, publicKey]);

  const onSetBaseSize = (baseSize: number | undefined) => {
    setBaseSize(baseSize);
    if (!baseSize) {
      setQuoteSize(undefined);
      return;
    }
    let usePrice = price || markPrice;
    if (!usePrice) {
      setQuoteSize(undefined);
      return;
    }
    const rawQuoteSize = baseSize * usePrice;
    const quoteSize =
      baseSize && roundToDecimal(rawQuoteSize, sizeDecimalCount);
    setQuoteSize(quoteSize);
  };

  const onSetQuoteSize = (quoteSize: number | undefined) => {
    setQuoteSize(quoteSize);
    if (!quoteSize) {
      setBaseSize(undefined);
      return;
    }
    let usePrice = price || markPrice;
    if (!usePrice) {
      setBaseSize(undefined);
      return;
    }
    const rawBaseSize = quoteSize / usePrice;
    const baseSize = quoteSize && roundToDecimal(rawBaseSize, sizeDecimalCount);
    setBaseSize(baseSize);
  };

  const doChangeOrder = ({
    size,
    price,
  }: {
    size?: number;
    price?: number;
  }) => {
    const formattedSize = size && roundToDecimal(size, sizeDecimalCount);
    const formattedPrice = price && roundToDecimal(price, priceDecimalCount);
    formattedSize && onSetBaseSize(formattedSize);
    formattedPrice && setPrice(formattedPrice);
  };

  const updateSizeFraction = () => {
    const rawMaxSize =
      side === 'buy' ? quoteBalance / (price || markPrice || 1) : baseBalance;
    const maxSize = floorToDecimal(rawMaxSize, sizeDecimalCount);
    const sizeFraction = Math.min(((baseSize || 0) / maxSize) * 100, 100);
    setSizeFraction(sizeFraction);
  };

  const onSliderChange = (value) => {
    if (!price && markPrice) {
      let formattedMarkPrice: number | string = priceDecimalCount
        ? markPrice.toFixed(priceDecimalCount)
        : markPrice;
      setPrice(
        typeof formattedMarkPrice === 'number'
          ? formattedMarkPrice
          : parseFloat(formattedMarkPrice),
      );
    }

    let newSize;
    if (side === 'buy') {
      if (price || markPrice) {
        newSize = (quoteBalance / (price || markPrice || 1)) * value;
      }
    } else {
      newSize = baseBalance * value;
    }

    // round down to minOrderSize increment
    let formatted = newSize;

    onSetBaseSize(formatted);
  };

  async function onSubmit() {
    if (!price) {
      console.warn('Missing price');
      notify({
        message: 'Missing price',
        type: 'error',
      });
      return;
    } else if (!baseSize) {
      console.warn('Missing size');
      notify({
        message: 'Missing size',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (!wallet) {
        return null;
      }

      await placeOrder({
        side,
        price,
        size: baseSize,
        orderType: ioc ? 'ioc' : postOnly ? 'postOnly' : 'limit',
        market,
        connection: sendConnection,
        wallet,
        baseCurrencyAccount: baseCurrencyAccount?.pubkey,
        quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
        feeDiscountPubkey: feeDiscountKey,
      });
      refreshCache(tuple('getTokenAccounts', wallet, connected));
      setPrice(undefined);
      onSetBaseSize(undefined);
    } catch (e) {
      console.warn(e);
      notify({
        message: 'Error placing order',
        description: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FloatingElement
      style={{ display: 'flex', flexDirection: 'column', padding: 0, minHeight: 299, ...style }}
    >
      <TradeRadioGroup
        onChange={(e) => setSide(e.target.value)}
        value={side}
        buttonStyle="solid"
      >
        <BuyRadio data-active={side === 'buy'} value="buy">Buy</BuyRadio>
        <SellRadio data-active={side === 'sell'} value="sell">Sell</SellRadio>
      </TradeRadioGroup>
      <Wrapper>
        <TradeInput
          addonBefore={<InputSuffix>Price</InputSuffix>}
          suffix={
            <TradeSuffix>
              {(quoteCurrency && CoinLogos[quoteCurrency]) &&
                <CoinLogo src={CoinLogos[quoteCurrency]} alt={quoteCurrency} />
              }
              {quoteCurrency}
            </TradeSuffix>
          }
          placeholder={"0.0000"}
          value={price}
          type="number"
          step={market?.tickSize || 1}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />

        <TradeInput
          addonBefore={<InputSuffix>Size</InputSuffix>}
          suffix={
            <TradeSuffix>
              {(baseCurrency && CoinLogos[baseCurrency]) &&
                <CoinLogo src={CoinLogos[baseCurrency]} alt={baseCurrency} />
              }
              {baseCurrency}
            </TradeSuffix>
          }
          placeholder={"0.0000"}
          value={baseSize}
          type="number"
          step={market?.minOrderSize || 1}
          onChange={(e) => onSetBaseSize(parseFloat(e.target.value))}
        />
        <TradeInput
          style={{ paddingBottom: 4 }}
          suffix={
            <TradeSuffix>
              {(quoteCurrency && CoinLogos[quoteCurrency]) &&
                <CoinLogo src={CoinLogos[quoteCurrency]} alt={quoteCurrency} />
              }
              {quoteCurrency}
            </TradeSuffix>
          }
          placeholder={"0.0000"}
          value={quoteSize}
          type="number"
          step={market?.minOrderSize || 1}
          onChange={(e) => onSetQuoteSize(parseFloat(e.target.value))}
        />

        {!connected ? (
          <ConnectButton type="primary" size="large" onClick={connect}>Connect wallet</ConnectButton>
        ) : (
          ipAllowed ? (
            <TradeButton
              disabled={!price || !baseSize}
              onClick={onSubmit}
              block
              type="primary"
              size="large"
              loading={submitting}
              buy-side={side === 'buy'}
            >
              {side === 'buy' ? 'Buy' : 'Sell'}
            </TradeButton>
          ) : ( 

            <TradeButton
              block
              size="large"
              loading={submitting}
              disabled
            >
              Country Not Allowed
            </TradeButton>)
        )}
      </Wrapper>
    </FloatingElement>
  );
}
