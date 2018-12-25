const chalk = require('chalk');
const moment = require('moment')

const { 
    getBasePriceList, clearScreen,
    getBasePrice, getOtcPriceList, getMarketPrice, diff, logtable,
    getRateCny,
} = require('./utils')

async function watchOtcList(watchList) {

    const priceList = await getBasePriceList()
    
    const list = await Promise.all(watchList.map(({symbol, action}) => getOtcPriceList(symbol, action)))
    const marketPriceList = await Promise.all(watchList.map(({symbol, action}) => getMarketPrice(`${symbol}usdt`)));
    const rateCny =  await getRateCny()

    clearScreen()

    list.forEach((userList, i) => {
        const {action, symbol} = watchList[i]

        const basePrice = getBasePrice(priceList, symbol)
        const marketPrice = (marketPriceList[i] * rateCny).toFixed(2)

        console.log('|')
        console.log(`${action}_${symbol}  ${basePrice} ${marketPrice} ${diff(basePrice, marketPrice)}%`)
        
        userList.forEach(({userName, price, maxTradeLimit}, j) => {
            if (userName === '诚信兜兜') {
                userName = chalk.magenta(`【${userName}】`)
            }
            if (j >= 8) return

            console.log(`${diff(basePrice, price)}  ${price}  ${maxTradeLimit}  ${userName}`)    
        })
    })

    console.log('|')
    console.log(moment().format('YYYY-MM-DD HH:mm:ss'))
}

watchOtcList([
    {symbol:'ht', action: 'buy'},
    {symbol:'ht', action: 'sell'},
    {symbol:'eos', action: 'buy'},
    {symbol:'eos', action: 'sell'},
])