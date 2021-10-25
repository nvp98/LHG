import React from 'react';
import { Router, Switch } from 'react-router-dom';
import './App.scss';
import { PrivateRoute, PublicRoute } from './Layouts/';
import routes from './routes';
import { history } from './Utils';

function App() {
  const renderContent = routes => {
    let result = null;
    if (routes.length > 0) {
      result = routes.map(route => {
        return route.isPrivate ? (
          <PrivateRoute
            key={route.path}
            path={route.path}
            exact={route.exact}
            component={route.component}
          />
        ) : (
          <PublicRoute
            key={route.path}
            path={route.path}
            exact={route.exact}
            component={route.component}
          />
        );
      });
    }
    return <Switch>{result}</Switch>;
  };

  return <Router history={history}>{renderContent(routes)}</Router>;
}

export default App;