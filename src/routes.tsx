import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import Overview from './pages/Overview';
import Markets from './pages/Markets';
import TradePage from './pages/TradePage';
import React from 'react';
import BasicLayout from './components/BasicLayout';
import { getTradePageUrl } from './utils/markets';

export function Routes() {
  return (
    <>
      <HashRouter basename={'/'}>
        <BasicLayout>
          <Switch>
            <Route exact path="/">
              <Redirect to="/overview"/>
            </Route>
            <Route exact path="/market/:marketAddress">
              <TradePage />
            </Route>
            <Route exact path="/overview" component={Overview} />
            <Route exact path="/markets" component={Markets} />
          </Switch>
        </BasicLayout>
      </HashRouter>
    </>
  );
}
