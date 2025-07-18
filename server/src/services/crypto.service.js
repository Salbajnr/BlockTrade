
import axios from 'axios';
import { ApiError } from '../middleware/error.middleware.js';
import { broadcastToAll } from './websocket.service.js';

class CryptoService {
  constructor() {
    this.prices = new Map();
    this.lastUpdate = null;
    this.updateInterval = 30000; // 30 seconds
    this.apiBaseUrl = 'https://api.coingecko.com/api/v3';
    
    // Start price updates
    this.startPriceUpdates();
  }

  /**
   * Get current prices for supported cryptocurrencies
   * @returns {Object} Current prices
   */
  async getCurrentPrices() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/simple/price`, {
        params: {
          ids: 'bitcoin,ethereum,litecoin,cardano,polkadot',
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        }
      });

      const prices = {};
      for (const [coin, data] of Object.entries(response.data)) {
        prices[coin.toUpperCase()] = {
          price: data.usd,
          change24h: data.usd_24h_change || 0,
          marketCap: data.usd_market_cap || 0,
          volume24h: data.usd_24h_vol || 0,
          lastUpdate: new Date()
        };
      }

      // Update internal cache
      this.prices = new Map(Object.entries(prices));
      this.lastUpdate = new Date();

      return prices;
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw new ApiError('Failed to fetch cryptocurrency prices', 500);
    }
  }

  /**
   * Get price for a specific cryptocurrency
   * @param {string} symbol - Cryptocurrency symbol (e.g., 'BTC')
   * @returns {Object} Price data
   */
  getPrice(symbol) {
    const price = this.prices.get(symbol.toUpperCase());
    if (!price) {
      throw new ApiError(`Price not found for ${symbol}`, 404);
    }
    return price;
  }

  /**
   * Get historical price data
   * @param {string} symbol - Cryptocurrency symbol
   * @param {number} days - Number of days to fetch
   * @returns {Array} Historical price data
   */
  async getHistoricalData(symbol, days = 7) {
    try {
      const coinId = this.getCoinId(symbol);
      const response = await axios.get(`${this.apiBaseUrl}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        }
      });

      return {
        prices: response.data.prices,
        market_caps: response.data.market_caps,
        total_volumes: response.data.total_volumes
      };
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new ApiError('Failed to fetch historical data', 500);
    }
  }

  /**
   * Get market data for all supported cryptocurrencies
   * @returns {Array} Market data
   */
  async getMarketData() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum,litecoin,cardano,polkadot',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      return response.data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        fully_diluted_valuation: coin.fully_diluted_valuation,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap_change_24h: coin.market_cap_change_24h,
        market_cap_change_percentage_24h: coin.market_cap_change_percentage_24h,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        last_updated: coin.last_updated
      }));
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw new ApiError('Failed to fetch market data', 500);
    }
  }

  /**
   * Start automatic price updates
   */
  startPriceUpdates() {
    setInterval(async () => {
      try {
        const prices = await this.getCurrentPrices();
        
        // Broadcast price updates to connected clients
        broadcastToAll({
          type: 'price_update',
          data: prices,
          timestamp: new Date()
        });
        
        console.log('Prices updated and broadcasted');
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, this.updateInterval);
  }

  /**
   * Get CoinGecko coin ID from symbol
   * @param {string} symbol - Cryptocurrency symbol
   * @returns {string} CoinGecko coin ID
   */
  getCoinId(symbol) {
    const symbolMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'LTC': 'litecoin',
      'ADA': 'cardano',
      'DOT': 'polkadot'
    };

    const coinId = symbolMap[symbol.toUpperCase()];
    if (!coinId) {
      throw new ApiError(`Unsupported cryptocurrency: ${symbol}`, 400);
    }

    return coinId;
  }

  /**
   * Convert between cryptocurrencies
   * @param {string} fromSymbol - Source cryptocurrency
   * @param {string} toSymbol - Target cryptocurrency
   * @param {number} amount - Amount to convert
   * @returns {Object} Conversion result
   */
  convertCurrency(fromSymbol, toSymbol, amount) {
    const fromPrice = this.getPrice(fromSymbol);
    const toPrice = this.getPrice(toSymbol);

    const usdValue = amount * fromPrice.price;
    const convertedAmount = usdValue / toPrice.price;

    return {
      from: {
        symbol: fromSymbol.toUpperCase(),
        amount: amount,
        price: fromPrice.price
      },
      to: {
        symbol: toSymbol.toUpperCase(),
        amount: convertedAmount,
        price: toPrice.price
      },
      usdValue: usdValue,
      rate: fromPrice.price / toPrice.price,
      timestamp: new Date()
    };
  }
}

const cryptoService = new CryptoService();

export const {
  getCurrentPrices,
  getPrice,
  getHistoricalData,
  getMarketData,
  convertCurrency
} = cryptoService;

export default cryptoService;
