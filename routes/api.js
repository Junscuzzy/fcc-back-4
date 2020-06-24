'use strict'

/*
Entities
Stock: { stock: 'GOOG', price: 123 }
Like: { ip: '127.0.0.1', like: true, symbol: 'goog }
*/

const axios = require('axios')

async function getLikes(db, symbol) {
  const likes = await db
    .collection('likes')
    .find({ symbol: symbol, like: true })
    .toArray()
  return likes
}

async function getStocks(symbol) {
  const url = `https://repeated-alpaca.glitch.me/v1/stock/${symbol}/quote`
  const response = await axios.get(url)

  if (!response.data || response.data === 'Not found') {
    throw new Error('Stock not found')
  }

  return response.data
}

module.exports = function (app, db) {
  app.route('/api/stock-prices').get(async (req, res) => {
    try {
      const { stock, like } = req.query

      let symbol1, symbol2

      // Test if stock exists
      if (typeof stock !== 'undefined') {
        // Stock is array or string ?
        if (typeof stock === 'string') {
          symbol1 = stock
        } else {
          symbol1 = stock[0]
          symbol2 = stock[1]
        }
      } else {
        return res.status(200).json({ message: 'Missing Stock' })
      }

      // Fetch like
      let likes = await getLikes(db, symbol1)

      // Increment like if possible
      if (like) {
        const clientIp =
          req.headers['x-forwarded-for'] || req.connection.remoteAddress

        // Check if has already like
        const matchLikes = likes.filter(
          ({ like, ip, symbol }) =>
            ip === clientIp && symbol === symbol1 && like,
        )
        const hasLike = matchLikes.length !== 0

        // insert if don't exists
        if (!hasLike) {
          await db.collection('likes').insertOne({
            like: true,
            ip: clientIp,
            symbol: symbol1,
          })

          // get updated likes list
          likes = await getLikes(db, symbol1)
        }
      }

      // Get stockData
      const stockData1 = await getStocks(symbol1)
      let stockData = {
        stock: stockData1.symbol,
        price: stockData1.latestPrice,
        like: likes.length || 0,
      }

      if (symbol2) {
        const likes2 = await getLikes(db, symbol2)
        const stockData2 = await getStocks(symbol2)
        stockData = [
          {
            stock: stockData1.symbol,
            price: stockData1.latestPrice,
            like: likes.length || 0,
          },
          {
            stock: stockData2.symbol,
            price: stockData2.latestPrice,
            like: likes2.length || 0,
          },
        ]
      }

      // Return data
      return res.status(200).json({
        stockData,
      })
    } catch (error) {
      // Fetch error
      console.log(error)
      return res.status(200).json({ message: 'Something wrong' })
    }
  })
}
