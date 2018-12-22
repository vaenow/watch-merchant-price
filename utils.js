const axios  = require('axios')
var Table = require('cli-table2')

const TRADE_MARKET = 'https://otc-api.hbg.com/v1/data/trade-market?country=37&currency=CURRENCY&payMethod=0&currPage=1&coinId=COIN_ID&tradeType=ACTION&blockType=general&online=1'
const CONFIG_LIST = 'https://otc-api.huobi.pro/v1/data/config-list?type=price,time'
const MARKET_DATA = 'https://api.huobipro.com/market/detail/merged?symbol=SYMBOL_PAIR'
const SYMBOL = {
    BTC: { i: 0, currency: 1, coinId: 1},
    EOS: { i: 75, currency: 1, coinId: 5},
    ETH: { i: 25, currency: 1, coinId: 3},
    HT: { i: 100, currency: 1, coinId: 4},
    USDT: { i: 50, currency: 1, coinId: 2},
    HUSD: { i: 125, currency: 1, coinId: 6},
}

// let lastFetchTime = 0
// let priceList = []
// async function getBasePrice(symbolList = 'BTC') {
//     if (Date.now() - lastFetchTime > 5e3) {
//         priceList = (await axios.get(CONFIG_LIST)).data.data.price
//     }
//     return +priceList[SYMBOL[symbol.toUpperCase()]['i']].price
// }
async function getBasePriceList() {
    return (await axios.get(CONFIG_LIST)).data.data.price
}

function getBasePrice(priceList, symbol = 'BTC') {
    return +priceList[SYMBOL[symbol.toUpperCase()]['i']].price
}

// otc价格表
async function getOtcPriceList(symbol, action) {
    const symbolInfo = SYMBOL[symbol.toUpperCase()]
    const url = TRADE_MARKET
        .replace(/CURRENCY/, symbolInfo.currency)
        .replace(/COIN_ID/, symbolInfo.coinId)
        .replace(/ACTION/, action)
    // const ret = await $.getJSON(url)
    const ret = (await axios.get(url)).data
    return ret.data
}

async function getMarketPrice(symbolPair) {
    const url = MARKET_DATA.replace(/SYMBOL_PAIR/, symbolPair.toLowerCase())
    const ret = (await axios.get(url)).data
    return ret.tick.ask[0]
}

// 百分比
function diff(s, e, {precision=2, prefix=0} = {}) {
    return +(((+e - +s) / +s) * 100).toFixed(precision) + prefix
}

// 延迟
function delay(timeout = 2 * 1000) {
    return new Promise((yes) => {
        setTimeout(yes, timeout)
    })
}

function logtable(list) {
    
    const head = Object.keys(list[0])
    // instantiate
    var table = new Table({
        head
        , colWidths: '100,'.repeat(head.length).split(',')
    });

    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    list.forEach(li => table.push(Object.values(li)))

    // clear console
    console.log('\033[2J');
    console.log(table.toString());
}

function logTable(list, cols) {
    const table = new Table({
        chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        head: cols
    });

    list.forEach(li => {
        let vals = [];
        cols.forEach(c => vals.push(li[c]));
        table.push(vals)
    });
    console.log(table.toString())
}

function clearScreen() {
    process.stdout.write('\033c');
};

module.exports = {
    diff,
    delay,
    logtable,
    clearScreen,
    getBasePrice,
    getBasePriceList,
    getMarketPrice,
    getOtcPriceList,
}