const axios = require('axios');

const headers = token => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
});

const getFriendTrades = async () => {
    const res = await axios.get('https://api.sharekhan.com/orders', {
        headers: headers(process.env.FRIEND_API_KEY)
    });
    return res.data;
};

const placeTrade = async trade => {
    const res = await axios.post('https://api.sharekhan.com/orders', trade, {
        headers: headers(process.env.MY_API_KEY)
    });
    return res.data;
};

const getBalance = async () => {
    const res = await axios.get('https://api.sharekhan.com/user/balance', {
        headers: headers(process.env.MY_API_KEY)
    });
    return res.data;
};

module.exports = { getFriendTrades, placeTrade, getBalance };
