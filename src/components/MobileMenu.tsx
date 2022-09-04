import React from 'react';
import { Menu } from 'antd';
import { Button } from 'antd';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  CloseOutlined
} from '@ant-design/icons';
import WalletConnect from './WalletConnect';
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
              <LogoWrapper onClick={() => window.location.href = "https://zalina.finance"}>
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
              <WalletConnect />
            </div>
          </div>
          <Menu
            mode="vertical"
            onClick={handleClick}
            selectedKeys={[location.pathname]}
          >
            <Menu.Item key={"/Overview"}>
              Overview
            </Menu.Item>
            <Menu.Item key={"/Markets"}>
              Markets
            </Menu.Item>
            <Menu.Item key={tradePageUrl}>
              Trade
            </Menu.Item>
            <Menu.Item key="/docs-kiwe">
              <a
                href={EXTERNAL_LINKS['/docs-kiwe']}
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
              </a>
            </Menu.Item>

            <Menu.Item key="/dao-kiwe">
              <a
                href={EXTERNAL_LINKS['/dao-kiwe']}
                target="_blank"
                rel="noopener noreferrer"
              >
                DAO
              </a>
            </Menu.Item>
          </Menu>
        </div>
      }
    </>
  );
}
