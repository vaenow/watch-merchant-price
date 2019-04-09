const chalk = require('chalk');
const moment = require('moment')
const _ = require('lodash')

const {
  getBasePriceList, clearScreen,
  getBasePrice, getOtcPriceList, getMarketPrice, diff, logtable,
  getRateCny,
} = require('./utils')

const {
  URL_DING,
  WATCH_LIST,
} = process.env

async function watchOtcList(watchList) {

  const priceList = await getBasePriceList()

  const list = await Promise.all(watchList.map(({ symbol, action }) => getOtcPriceList(symbol, action)))
  const marketPriceList = await Promise.all(watchList.map(({ symbol, action }) => getMarketPrice(`${symbol}usdt`)));
  const rateCny = await getRateCny()

  clearScreen()

  await notifyList(list, watchList)

  list.forEach((userList, i) => {
    const { action, symbol } = watchList[i]

    const basePrice = getBasePrice(priceList, symbol)
    const marketPrice = (marketPriceList[i] * rateCny).toFixed(2)

    console.log('|')
    console.log(`${action}_${symbol}  ${basePrice} ${marketPrice} ${diff(basePrice, marketPrice)}%`)

    userList.forEach(({ id, userName, price, maxTradeLimit }, j) => {
      if (userName === '诚信兜兜') {
        userName = chalk.magenta(`【${userName}】`)
      }
      if (j >= 8) return

      console.log(`${diff(basePrice, price)}  ${price}  ${maxTradeLimit}  ${id}  ${userName}`)
    })
  })

  console.log('|')
  console.log(moment().format('YYYY-MM-DD HH:mm:ss'))
}

const notifyList = async (list, watchList) => {
  for (let i = 0; i < list.length; i += 2) {
    const { symbol } = watchList[i]
    const sell = list[i]
    const buy = list[i + 1]
    if (buy.price > sell.price) {
      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss')
      await ding(`[WATCH]${timestamp} ${symbol}
B  ${buy.price} ${buy.tradeCount}  
S  ${sell.price} ${sell.tradeCount}`)
    }
  }
}

async function ding(content) {
  try {
    return axios.post(URL_DING, {
      msgtype: 'text',
      text: {
        content
      },
      at: {
        atMobiles: [],
        isAtAll: false,
      }
    })
  } catch (e) {
    console.log('ERR dingding')
  }
}

watchOtcList(_.orderBy(
  JSON.parse(WATCH_LIST)
    // [{ symbol: 'btc', action: 'sell' },
    // { symbol: 'btc', action: 'buy' },
    // { symbol: 'eth', action: 'sell' },
    // { symbol: 'eth', action: 'buy' },
    // { symbol: 'usdt', action: 'sell' },
    // { symbol: 'usdt', action: 'buy' }]
  , ['symbol', 'action'], ['asc', 'desc']))
