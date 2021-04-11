import React, {useEffect} from 'react';
import _ from 'lodash';
import {
  getParamValues
} from '../helpers';
export default function RedirectPage(props) {
  const {
    setExpiryTime,
    history,
    location
  } = props;
  useEffect(() => {
    try {
      if (_.isEmpty(location.hash)) {
        return history.push('/');
      }
      const access_token = getParamValues(location.hash);
      console.log(access_token);
      const expiryTime = new Date().getTime() + access_token.expires_in * 1000;
      localStorage.setItem('nifty_discord_params', JSON.stringify(access_token));
      localStorage.setItem('expiry_time', expiryTime);
      setExpiryTime(expiryTime);
      history.push('/yourcollectibles');
    } catch (error) {
      history.push('/');
    }
  }, [])

  return(
    <div>redirecting....</div>
  );

}
