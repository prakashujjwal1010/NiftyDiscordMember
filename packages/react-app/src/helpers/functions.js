import axios from 'axios';
export function getParamValues(url){
  return url
    //.slice(1)
    .split('&')
    .reduce((prev, curr) => {
      const [title, value] = curr.split('=');
      prev[title] = value;
      return prev;
    }, {});
};

export const setAuthHeader = () => {
  try {
    const params = JSON.parse(localStorage.getItem('nifty_discord_params'));
    if (params) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${params.access_token}`;
    }
  } catch (error) {
    console.log('Error setting auth', error);
  }
};

export const setAuthHeaderBot = () => {
  try {
    const params = JSON.parse(localStorage.getItem('nifty_discord_params'));
    if (params) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bot ${params.access_token}`;

    }
  } catch (error) {
    console.log('Error setting auth', error);
  }
};
