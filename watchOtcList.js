const chalk = require('chalk');

const { 
    getBasePriceList, clearScreen,
    getBasePrice, getOtcPriceList, getMarketPrice, diff, logtable,
} = require('./utils')

async function watchOtcList(watchList) {

    const priceList = await getBasePriceList()

    const list = await Promise.all(watchList.map(({symbol, action}) => getOtcPriceList(symbol, action)))

    clearScreen()

    list.forEach((userList, i) => {
        const {action, symbol} = watchList[i]
        console.log(`\n${action}_${symbol}`)

        const basePrice = getBasePrice(priceList, symbol)
        
        userList.forEach(({userName, price, maxTradeLimit}) => {
            if (userName === '诚信兜兜') {
                userName = chalk.magenta(userName)
            }
            console.log(`${diff(basePrice, price)}  ${price}  ${maxTradeLimit}  ${userName}`)    
        })
    })

}

watchOtcList([
    {symbol:'ht', action: 'buy'},
    {symbol:'ht', action: 'sell'},
    {symbol:'eos', action: 'buy'},
    {symbol:'eos', action: 'sell'},
])