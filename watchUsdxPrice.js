

const { 
    getOtcPriceList, getMarketPrice, diff, logtable 
} = require('./utils')

async function watchUsdxPrice(list = []) {
    let retList = []
    for (let i = 0; i < list.length; i++) {
        let { from = 'usdt', to = 'ht', fund = 5000 } = list[i]
        const title = `${from}->${to}`
        // marketPrice += 0.003
        // console.log(title)
        const marketPrice = await getMarketPrice(to + from)

        const usdx = +((await getOtcPriceList(from, 'sell'))[0].price + 0.01).toFixed(2)
        const sell = (await getOtcPriceList(to, 'sell'))[1].price
        const buy = (await getOtcPriceList(to, 'buy'))[1].price
        const recieveQty = +(fund / usdx * (1 - 0.002) / marketPrice).toFixed(6)
        const recieve = +(recieveQty * sell).toFixed(2)
        const _diff = diff(fund, recieve)
        const cost = +(fund / recieveQty).toFixed(2)
        const ret = { title, fund, marketPrice, usdx, buy, sell, recieve, recieveQty, cost, diff: _diff }
        retList.push(ret)
        // console.log(JSON.stringify(ret))
        await delay(1000)
    }

    // retList.forEach(v => console.log(JSON.stringify(v)))
    logtable(retList)
    setInterval(async () => await watchUsdxPrice(list), 1.5e4)
    return retList
}

watchUsdxPrice([
    // 	{marketPrice: 3921, from:'usdt', to: 'btc'},
    // 	{marketPrice: 105, from:'usdt', to: 'eth'},
    { from: 'usdt' },
    { from: 'husd' },
    { from: 'usdt', to: 'eos' },
])