import React from 'react';
import { Menu } from 'antd';
import { Button } from 'antd';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  CloseOutlined,
  AreaChartOutlined,
  FileOutlined,
  HomeOutlined,
  ShopOutlined,
  TeamOutlined
} from '@ant-design/icons';
import WalletConnect from './WalletConnect';
import { useWallet } from '../utils/wallet';
import logo from '../assets/logo.png';

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    height: 34px;
    margin-right: 8px;
    margin-top: 4px;
  }
`;

const ConnectButton = styled(Button)({
  margin: '10px 0px 20px 0px',
  //background: 'linear-gradient(100.61deg, #C5EC53 0%, #92C119 100%)',
  background: '#C5EC53',
  border: '1px solid #8fc740 !important',
  color: '#0f1625',
  width: '100%',
  height: '60px',
  //borderRadius: 8,
  fontWeight: 600,
  fontSize: 16,
  '&:hover': {
    background: '#C5EC53',
    color:'#0f1625',
  },
  '&:focus': {
    background: '#C5EC53',
    color: '#0f1625',
  },
});

export default function LinkAddress({
  tradePageUrl,
  isMobileMenuActive,
  setIsMobileMenuActive,
  handleClick
}: {
  tradePageUrl: string;
  isMobileMenuActive: boolean;
  setIsMobileMenuActive: (a: boolean) => void;
  handleClick: any;
}) {
  const location = useLocation();
  const { wallet, connected, connect } = useWallet();

  const EXTERNAL_LINKS = {
    '/docs-kiwe': 'https://docs.kiwe.markets',
    '/dao-kiwe': 'https://dao.kiwe.markets'
  };

  return (
    <>
      {isMobileMenuActive &&
        <div className="kiwe_mobile-menu">

          <div className="kiwe_mobile-menu__header">
            <div className="kiwe_mobile-menu__header__actions">
              <LogoWrapper onClick={() => window.location.href = "https://kiwe.markets"}>
                <img src={logo} alt="" />
              </LogoWrapper>
              <Button
                className="kiwe_mobile-menu__trigger__btn"
                type="text"
                onClick={() => setIsMobileMenuActive(false)}
                icon={<CloseOutlined />}
              />
            </div>
            <div className="kiwe_mobile-menu__connect" onClick={handleClick}>
              {/*<WalletConnect />*/}
              <ConnectButton type="primary" size="large" onClick={connect}>Connect wallet</ConnectButton>
            </div>
          </div>
          <Menu
            mode="vertical"
            onClick={handleClick}
            selectedKeys={[location.pathname]}
          >
            <Menu.Item key={"/Overview"}>
              <HomeOutlined style={{ fontSize: '20px'}}/>Overview
            </Menu.Item>
            <Menu.Item key={"/Markets"}>
              <ShopOutlined style={{ fontSize: '20px'}}/>Markets
            </Menu.Item>
            <Menu.Item key={tradePageUrl}>
              <AreaChartOutlined style={{ fontSize: '20px'}}/>Trade
            </Menu.Item>
            <Menu.Item key="/docs-kiwe">
              <a
                href={EXTERNAL_LINKS['/docs-kiwe']}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileOutlined style={{ fontSize: '20px'}}/>Docs
              </a>
            </Menu.Item>

            <Menu.Item key="/dao-kiwe">
              <a
                href={EXTERNAL_LINKS['/dao-kiwe']}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TeamOutlined style={{ fontSize: '20px'}}/>DAO
              </a>
            </Menu.Item>
          </Menu>
        </div>
      }
    </>
  );
}
