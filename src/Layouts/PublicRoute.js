import React from 'react';
import { Route } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';

export const PublicRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => (
        <PublicLayout>
          <Component {...props} />
        </PublicLayout>
      )}
    ></Route>
  );
};
