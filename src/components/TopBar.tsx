import {
  InfoCircleOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Button, Col, Menu, Popover, Row, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import styled from 'styled-components';
import { useWallet } from '../utils/wallet';
import { ENDPOINTS, useConnectionConfig } from '../utils/connection';
import Settings from './Settings';
import CustomClusterEndpointDialog from './CustomClusterEndpointDialog';
import { EndpointInfo } from '../utils/types';
import { notify } from '../utils/notifications';
import { Connection } from '@solana/web3.js';
import WalletConnect from './WalletConnect';
import MobileMenu from './MobileMenu';
import { getTradePageUrl } from '../utils/markets';


const Wrapper = styled.div`
  background-color: #0f1625;
  border-bottom: 1px solid #262C39;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0px 30px;
  flex-wrap: wrap;
`;
const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: #2abdd2;
  font-weight: bold;
  cursor: pointer;
  img {
    height: 50px;
    margin-right: 8px;
  }
`;

const EXTERNAL_LINKS = {
  '/docs-kiwe': 'https://docs.kiwe.markets',
  '/dao-kiwe': 'https://dao.kiwe.markets'
};

export default function TopBar() {
  const { connected, wallet } = useWallet();
  const {
    endpoint,
    endpointInfo,
    setEndpoint,
    availableEndpoints,
    setCustomEndpoints,
  } = useConnectionConfig();
  const [addEndpointVisible, setAddEndpointVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const [searchFocussed, setSearchFocussed] = useState(false);
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);


  const handleClick = useCallback(
    (e) => {
      document.body.classList.remove('mobile-menu--open');
      setIsMobileMenuActive(false);

      if (!(e.key in EXTERNAL_LINKS)) {
        history.push(e.key);
      }
    },
    [history],
  );

  const onAddCustomEndpoint = (info: EndpointInfo) => {
    const existingEndpoint = availableEndpoints.some(
      (e) => e.endpoint === info.endpoint,
    );
    if (existingEndpoint) {
      notify({
        message: `An endpoint with the given url already exists`,
        type: 'error',
      });
      return;
    }

    const handleError = (e) => {
      console.log(`Connection to ${info.endpoint} failed: ${e}`);
      notify({
        message: `Failed to connect to ${info.endpoint}`,
        type: 'error',
      });
    };

    try {
      const connection = new Connection(info.endpoint, 'recent');
      connection
        .getBlockTime(0)
        .then(() => {
          setTestingConnection(true);
          console.log(`testing connection to ${info.endpoint}`);
          const newCustomEndpoints = [
            ...availableEndpoints.filter((e) => e.custom),
            info,
          ];
          setEndpoint(info.endpoint);
          setCustomEndpoints(newCustomEndpoints);
        })
        .catch(handleError);
    } catch (e) {
      handleError(e);
    } finally {
      setTestingConnection(false);
    }
  };

  const endpointInfoCustom = endpointInfo && endpointInfo.custom;
  useEffect(() => {
    const handler = () => {
      if (endpointInfoCustom) {
        setEndpoint(ENDPOINTS[0].endpoint);
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [endpointInfoCustom, setEndpoint]);

  const tradePageUrl = location.pathname.startsWith('/market/')
    ? location.pathname
    : getTradePageUrl();

  const homePageUrl = "https://kiwe.markets";

  return (
    <>
      <CustomClusterEndpointDialog
        visible={addEndpointVisible}
        testingConnection={testingConnection}
        onAddCustomEndpoint={onAddCustomEndpoint}
        onClose={() => setAddEndpointVisible(false)}
      />
      <Wrapper> 
        <LogoWrapper onClick={() => window.location.href = homePageUrl}>
          <img src={logo} alt="" />
       
        </LogoWrapper>
        <Menu
          mode="horizontal"
          onClick={handleClick}
          selectedKeys={[location.pathname]}
          style={{
            borderBottom: 'none',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'flex-end',
            flex: 1,
          }}
        >
           <Menu.Item key="/overview" style={{ margin: '0 10px' }}>
            OVERVIEW
          </Menu.Item>

          <Menu.Item key="/markets" style={{ margin: '0 10px' }}>
            MARKETS
          </Menu.Item>

          <Menu.Item key={tradePageUrl} style={{ margin: '0 10px 0 10px' }}>
            TRADE
          </Menu.Item>
        
          {!searchFocussed && (
            <Menu.SubMenu
              title="MORE"
              onTitleClick={() =>
                window.open(EXTERNAL_LINKS['/more'], '_blank')
              }
              style={{ margin: '0 0px 0 10px' }}
            >
              <Menu.Item key="/docs-kiwe">
                <a
                  href={EXTERNAL_LINKS['/docs-kiwe']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DOCS
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
            </Menu.SubMenu>
          )}
          
        </Menu>
       <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: 5,
          }}
        >
         
        </div>
        <div>
          <Row
            align="middle"
            style={{ paddingLeft: 5, paddingRight: 5 }}
            gutter={16}
          >
            <Col>
              <PlusCircleOutlined
                style={{ color: '#2abdd2' }}
                onClick={() => setAddEndpointVisible(true)}
              />
            </Col>
            <Col>
              <Popover
                content={endpoint}
                placement="bottomRight"
                title="URL"
                trigger="hover"
              >
                <InfoCircleOutlined style={{ color: '#90ED0C' }} />
              </Popover>
            </Col>
            <Col>
              <Select
                onSelect={setEndpoint}
                value={endpoint}
                style={{ marginRight: 8, width: '150px' }}
              >
                {availableEndpoints.map(({ name, endpoint }) => (
                  <Select.Option value={endpoint} key={endpoint}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>
        {connected && (
          <div>
            <Popover
              content={<Settings autoApprove={wallet?.autoApprove} />}
              placement="bottomRight"
              title="Settings"
              trigger="click"
            >
              <Button style={{ marginRight: 8 }}>
                <SettingOutlined />
                Settings
              </Button>
            </Popover>
          </div>
        )}
        <div>
          <WalletConnect />
        </div>

        <div className="mobile-menu__trigger">
          <Button
            className="kiwe_mobile-menu__trigger__btn"
            type="text"
            onClick={() => {
              document.body.classList.add('mobile-menu--open');
              setIsMobileMenuActive(true);
            }}
            icon={<MenuOutlined />}
          />
        </div>
        {isMobileMenuActive &&
          <MobileMenu
            tradePageUrl={tradePageUrl}
            isMobileMenuActive={isMobileMenuActive}
            setIsMobileMenuActive={(a) => {
              document.body.classList.remove('mobile-menu--open');
              setIsMobileMenuActive(a);
            }}
            handleClick={handleClick}
          />
        }

      </Wrapper>
    </>
  );
}
