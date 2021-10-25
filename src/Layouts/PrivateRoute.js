import React, { useState, useEffect } from 'react';
import { getCookie, removeCookie } from 'Utils/Helpers';
import { Route, Redirect } from 'react-router-dom';
import { LOGIN_URL, TOKEN_KEY, USER_ID, REFRESH_TOKEN } from 'GlobalConstants';
import { getUserID } from 'Api';
import { PrivateLayout } from './PrivateLayout';
import { useHistory } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

export const PrivateRoute = ({ component: Component, ...rest }) => {
  let history = useHistory();
  // const dataLogin = useSelector(state => state.loginReducer.dataLogin);

  const { pathname } = history.location;
  const [slugList, setSlugList] = useState([]);
  const [keyPermission, setKeyPermission] = useState([]);
  const [status, setStatus] = useState(true);

  useEffect(() => {
    initData();
  }, []);
  const initData = async () => {
    try {
      if (getCookie(USER_ID) !== '') {
        const userLogin = jwt_decode(getCookie(TOKEN_KEY)).id;
        const userId = getCookie(USER_ID);
        const { data } = await getUserID(userId);

        if (userLogin === userId) {
          let sluglist = [];
          let keypermission = [];

          data.permissions.map((item, index) => {
            keypermission.push(item.function.key);
            return item.function.slug?.map((it, i) => {
              return sluglist.push(it), keypermission;
            });
          });
          setKeyPermission(keypermission);
          setStatus(data.status);
          setSlugList(sluglist);
        } else {
          removeCookie(TOKEN_KEY);
          removeCookie(REFRESH_TOKEN);
          history.push('/login');
        }
      } else {
        setSlugList([]);
      }
    } catch (error) {
      removeCookie(TOKEN_KEY);
      removeCookie(REFRESH_TOKEN);
      history.push('/login');
      console.log(error);
    }
  };

  const checkPermission = (slug, key) => {
    let keyView = key.concat('-view');
    // if (key === 'content') keyView = 'package-view';

    if (status) {
      if (slugList.length) {
        if (keyPermission.includes(keyView)) {
          return slugList.includes(
            `/${slug.length > 4 ? slug[2].concat(`/${slug[3]}`) : slug[2]}`
          );
        } else {
          return false;
        }
      } else {
        if (jwt_decode(getCookie(TOKEN_KEY)).id === '') {
          return false;
        } else return 'null';
      }
    } else return false;
  };

  const setListKey = keyMain => {
    let key = keyMain;
    let listfunc = [];

    keyPermission.map((item, index) => {
      if (item.includes(key)) return listfunc.push(item);
    });
    return listfunc;
  };

  return (
    <Route
      {...rest}
      render={props =>
        getCookie(TOKEN_KEY) ? (
          <PrivateLayout>
            <Component
              {...props}
              permision={checkPermission(
                props.match.path.split('/'),
                props.match.path.split('/')[2]
              )}
              // listkey={setListKey(props.match.path.split('/')[2])}
              listkey={keyPermission}
            />
          </PrivateLayout>
        ) : (
          <Redirect
            to={{
              pathname: LOGIN_URL,
            }}
          />
        )
      }
    />
  );
};
