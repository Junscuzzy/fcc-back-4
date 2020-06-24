const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')
const { expect } = require('chai')

chai.use(chaiHttp)

suite('Functional Tests', function () {
  suite('GET /api/stock-prices => stockData object', function () {
    test('missing stock', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({})
        .end(function (err, res) {
          if (err) throw err

          assert.equal(res.status, 200)
          assert.equal(res.body.message, 'Missing Stock')

          done()
        })
    })

    test('1 stock', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function (err, res) {
          if (err) throw err

          assert.equal(res.status, 200)
          assert.equal(res.body.stockData.stock, 'GOOG')
          assert.isNumber(res.body.stockData.price)

          done()
        })
    })

    test('un-existing stock', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'cool' })
        .end(function (err, res) {
          if (err) throw err

          assert.equal(res.status, 200)
          assert.equal(res.body.message, 'Something wrong')

          done()
        })
    })

    test('1 stock with like', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end(function (err, res) {
          if (err) throw err

          assert.equal(res.status, 200)
          assert.isNumber(res.body.stockData.like)

          done()
        })
    })

    test('1 stock with like again (ensure likes arent double counted)', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end(function (err, res) {
          if (err) throw err

          assert.equal(res.status, 200)
          assert.equal(res.body.stockData.like, 1)

          done()
        })
    })

    test('2 stocks', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'] })
        .end(function (err, res) {
          if (err) throw err

          assert.equal(res.status, 200)
          assert.lengthOf(res.body.stockData, 2)

          done()
        })
    })

    test('2 stocks with like', function (done) {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'] })
        .end(function (err, res) {
          if (err) throw err

          assert.equal(res.status, 200)
          assert.equal(res.body.stockData[0].like, 1)
          assert.equal(res.body.stockData[1].like, 0)

          done()
        })
    })
  })
})
