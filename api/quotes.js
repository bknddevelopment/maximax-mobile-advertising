/**
 * MaxiMax Mobile Advertising - Quote Calculation Engine
 * @version 3.0.0
 * @description Advanced pricing and quote generation API with AI-powered dynamic pricing
 */

import API_CONFIG from '../config/api.config.js';

/**
 * Quote API Class
 */
export class QuoteAPI {
  constructor() {
    this.quotes = new Map();
    this.priceModifiers = new Map();
    this.initializePriceModifiers();
  }

  /**
     * Initialize price modifiers based on various factors
     */
  initializePriceModifiers() {
    // Time-based modifiers
    this.priceModifiers.set('peakHours', {
      '7-9': 1.5, // Morning rush
      '11-13': 1.3, // Lunch hour
      '17-19': 1.5, // Evening rush
      '19-22': 1.2 // Prime evening
    });

    // Day-based modifiers
    this.priceModifiers.set('dayOfWeek', {
      monday: 1.0,
      tuesday: 1.0,
      wednesday: 1.0,
      thursday: 1.1,
      friday: 1.2,
      saturday: 1.25,
      sunday: 1.15
    });

    // Season-based modifiers
    this.priceModifiers.set('season', {
      spring: 1.1,
      summer: 1.2,
      fall: 1.0,
      winter: 0.9
    });

    // Location-based modifiers
    this.priceModifiers.set('location', {
      'south-beach': 1.5,
      'downtown-miami': 1.3,
      brickell: 1.4,
      wynwood: 1.2,
      aventura: 1.1,
      'coral-gables': 1.15,
      'miami-beach': 1.35,
      standard: 1.0
    });

    // Event-based modifiers
    this.priceModifiers.set('events', {
      'super-bowl': 3.0,
      'art-basel': 2.5,
      'miami-music-week': 2.0,
      'food-wine-festival': 1.8,
      marathon: 1.6,
      holiday: 1.5,
      standard: 1.0
    });
  }

  /**
     * Generate instant quote
     */
  async generateQuote(params) {
    try {
      const {
        campaignType = 'standard',
        duration,
        durationUnit = 'hours',
        trucks = 1,
        routes = [],
        startDate,
        endDate,
        targetImpressions,
        specialRequests = [],
        clientInfo = {}
      } = params;

      // Validate input
      const validation = this.validateQuoteParams(params);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Calculate base price
      const basePrice = this.calculateBasePrice(duration, durationUnit, trucks);

      // Apply modifiers
      const modifiers = this.calculateModifiers(params);
      const adjustedPrice = basePrice * modifiers.total;

      // Calculate estimated impressions
      const impressions = this.calculateImpressions(params);

      // Calculate CPM (Cost Per Thousand Impressions)
      const cpm = (adjustedPrice / impressions.total) * 1000;

      // Generate quote ID
      const quoteId = this.generateQuoteId();

      // Create quote object
      const quote = {
        id: quoteId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days

        campaign: {
          type: campaignType,
          duration,
          durationUnit,
          trucks,
          routes,
          startDate,
          endDate,
          specialRequests
        },

        pricing: {
          basePrice: Math.round(basePrice * 100) / 100,
          modifiers: modifiers.breakdown,
          modifierTotal: Math.round(modifiers.total * 100) / 100,
          subtotal: Math.round(adjustedPrice * 100) / 100,
          tax: Math.round(adjustedPrice * 0.07 * 100) / 100, // 7% tax
          total: Math.round(adjustedPrice * 1.07 * 100) / 100,
          currency: API_CONFIG.pricing.currency,

          breakdown: {
            perTruck: Math.round((adjustedPrice / trucks) * 100) / 100,
            perHour: Math.round((adjustedPrice / this.convertToHours(duration, durationUnit)) * 100) / 100,
            perDay: Math.round((adjustedPrice / this.convertToDays(duration, durationUnit)) * 100) / 100
          }
        },

        metrics: {
          estimatedImpressions: impressions.total,
          impressionsBreakdown: impressions.breakdown,
          cpm: Math.round(cpm * 100) / 100,
          reachEstimate: Math.round(impressions.total * 0.7), // Unique reach
          engagementRate: this.estimateEngagementRate(campaignType)
        },

        roi: {
          estimatedValue: Math.round(impressions.total * 0.002 * 100) / 100, // $0.002 per impression value
          projectedROI: Math.round(((impressions.total * 0.002 - adjustedPrice) / adjustedPrice) * 100),
          comparisonToStatic: this.compareToStaticBillboard(adjustedPrice, impressions.total),
          comparisonToDigital: this.compareToDigitalAds(adjustedPrice, impressions.total)
        },

        client: clientInfo,

        savings: this.calculateSavings(params, adjustedPrice),

        addons: this.getAvailableAddons(campaignType),

        terms: {
          deposit: Math.round(adjustedPrice * 0.5 * 100) / 100, // 50% deposit
          cancellationPolicy: '48 hours notice required for full refund',
          paymentTerms: 'Net 30',
          insurance: 'Fully insured up to $1M'
        }
      };

      // Store quote
      this.quotes.set(quoteId, quote);

      return {
        success: true,
        data: quote
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QUOTE_GENERATION_FAILED',
          message: error.message
        }
      };
    }
  }

  /**
     * Validate quote parameters
     */
  validateQuoteParams(params) {
    const { duration, durationUnit, trucks, startDate } = params;

    if (!duration || duration <= 0) {
      return {
        valid: false,
        error: 'Duration must be greater than 0'
      };
    }

    if (!['hours', 'days', 'weeks', 'months'].includes(durationUnit)) {
      return {
        valid: false,
        error: 'Invalid duration unit'
      };
    }

    if (!trucks || trucks < 1 || trucks > 20) {
      return {
        valid: false,
        error: 'Number of trucks must be between 1 and 20'
      };
    }

    if (startDate && new Date(startDate) < new Date()) {
      return {
        valid: false,
        error: 'Start date cannot be in the past'
      };
    }

    return { valid: true };
  }

  /**
     * Calculate base price
     */
  calculateBasePrice(duration, durationUnit, trucks) {
    const hourlyRate = API_CONFIG.pricing.baseRates.hourly;
    const hours = this.convertToHours(duration, durationUnit);

    let basePrice = hourlyRate * hours * trucks;

    // Apply volume discounts for multiple trucks
    if (trucks >= 10) {
      basePrice *= (1 - API_CONFIG.pricing.discounts.volume[10]);
    } else if (trucks >= 5) {
      basePrice *= (1 - API_CONFIG.pricing.discounts.volume[5]);
    } else if (trucks >= 3) {
      basePrice *= (1 - API_CONFIG.pricing.discounts.volume[3]);
    }

    // Apply long-term discounts
    const days = this.convertToDays(duration, durationUnit);
    if (days >= 30) {
      basePrice *= (1 - API_CONFIG.pricing.discounts.longTerm[30]);
    } else if (days >= 14) {
      basePrice *= (1 - API_CONFIG.pricing.discounts.longTerm[14]);
    } else if (days >= 7) {
      basePrice *= (1 - API_CONFIG.pricing.discounts.longTerm[7]);
    }

    return basePrice;
  }

  /**
     * Calculate price modifiers
     */
  calculateModifiers(params) {
    const { startDate, routes = [], campaignType, specialRequests = [] } = params;
    const modifiers = { total: 1.0, breakdown: {} };

    // Time-based modifier
    if (startDate) {
      const date = new Date(startDate);
      const hour = date.getHours();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      // Peak hour modifier
      const peakHours = this.priceModifiers.get('peakHours');
      for (const [range, modifier] of Object.entries(peakHours)) {
        const [start, end] = range.split('-').map(Number);
        if (hour >= start && hour <= end) {
          modifiers.breakdown.peakHour = modifier;
          modifiers.total *= modifier;
          break;
        }
      }

      // Day of week modifier
      const dayModifiers = this.priceModifiers.get('dayOfWeek');
      if (dayModifiers[dayName]) {
        modifiers.breakdown.dayOfWeek = dayModifiers[dayName];
        modifiers.total *= dayModifiers[dayName];
      }

      // Season modifier
      const season = this.getSeason(date);
      const seasonModifiers = this.priceModifiers.get('season');
      if (seasonModifiers[season]) {
        modifiers.breakdown.season = seasonModifiers[season];
        modifiers.total *= seasonModifiers[season];
      }
    }

    // Location-based modifier
    if (routes.length > 0) {
      const locationModifiers = this.priceModifiers.get('location');
      let locationModifier = 1.0;

      routes.forEach(route => {
        const routeModifier = locationModifiers[route.toLowerCase().replace(/\s+/g, '-')] || 1.0;
        locationModifier = Math.max(locationModifier, routeModifier);
      });

      modifiers.breakdown.location = locationModifier;
      modifiers.total *= locationModifier;
    }

    // Campaign type modifier
    const campaignModifiers = {
      premium: 1.5,
      standard: 1.0,
      basic: 0.8,
      rush: 1.75,
      event: 2.0
    };

    if (campaignModifiers[campaignType]) {
      modifiers.breakdown.campaignType = campaignModifiers[campaignType];
      modifiers.total *= campaignModifiers[campaignType];
    }

    // Special requests modifier
    specialRequests.forEach(request => {
      if (request === 'exclusive-route') {
        modifiers.breakdown.exclusiveRoute = 1.5;
        modifiers.total *= 1.5;
      } else if (request === 'custom-wrap') {
        modifiers.breakdown.customWrap = 1.3;
        modifiers.total *= 1.3;
      } else if (request === 'night-display') {
        modifiers.breakdown.nightDisplay = 1.2;
        modifiers.total *= 1.2;
      }
    });

    return modifiers;
  }

  /**
     * Calculate estimated impressions
     */
  calculateImpressions(params) {
    const { duration, durationUnit, trucks, routes = [], campaignType } = params;
    const hours = this.convertToHours(duration, durationUnit);

    // Base impressions per hour per truck
    let baseImpressionsPerHour = 8000;

    // Adjust based on campaign type
    const campaignMultipliers = {
      premium: 1.5,
      standard: 1.0,
      basic: 0.7,
      event: 2.0,
      rush: 1.3
    };

    baseImpressionsPerHour *= campaignMultipliers[campaignType] || 1.0;

    // Adjust based on routes
    const routeMultipliers = {
      'south-beach': 1.5,
      'downtown-miami': 1.3,
      brickell: 1.4,
      wynwood: 1.2,
      aventura: 1.1,
      'coral-gables': 1.0,
      'miami-beach': 1.35
    };

    let routeMultiplier = 1.0;
    routes.forEach(route => {
      const multiplier = routeMultipliers[route.toLowerCase().replace(/\s+/g, '-')] || 1.0;
      routeMultiplier = Math.max(routeMultiplier, multiplier);
    });

    baseImpressionsPerHour *= routeMultiplier;

    // Calculate total impressions
    const totalImpressions = Math.round(baseImpressionsPerHour * hours * trucks);

    // Calculate breakdown
    const breakdown = {
      perHour: Math.round(baseImpressionsPerHour * trucks),
      perDay: Math.round(baseImpressionsPerHour * 8 * trucks), // Assuming 8 operational hours per day
      perTruck: Math.round(baseImpressionsPerHour * hours),

      byTimeOfDay: {
        morning: Math.round(totalImpressions * 0.25),
        afternoon: Math.round(totalImpressions * 0.35),
        evening: Math.round(totalImpressions * 0.30),
        night: Math.round(totalImpressions * 0.10)
      },

      byDemographic: {
        '18-24': Math.round(totalImpressions * 0.22),
        '25-34': Math.round(totalImpressions * 0.28),
        '35-44': Math.round(totalImpressions * 0.25),
        '45-54': Math.round(totalImpressions * 0.15),
        '55+': Math.round(totalImpressions * 0.10)
      }
    };

    return {
      total: totalImpressions,
      breakdown
    };
  }

  /**
     * Estimate engagement rate
     */
  estimateEngagementRate(campaignType) {
    const rates = {
      premium: 0.045,
      standard: 0.035,
      basic: 0.025,
      event: 0.055,
      rush: 0.040
    };

    return (rates[campaignType] || 0.035) * 100; // Return as percentage
  }

  /**
     * Compare to static billboard
     */
  compareToStaticBillboard(mobileCost, mobileImpressions) {
    const staticMonthlyC = 5000; // Average static billboard cost
    const staticMonthlyImpressions = 500000; // Average static billboard impressions

    const mobileCPM = (mobileCost / mobileImpressions) * 1000;
    const staticCPM = (staticMonthlyCost / staticMonthlyImpressions) * 1000;

    return {
      mobileCPM: Math.round(mobileCPM * 100) / 100,
      staticCPM: Math.round(staticCPM * 100) / 100,
      savings: Math.round(((staticCPM - mobileCPM) / staticCPM) * 100),
      flexibilityScore: 95, // Mobile billboards are much more flexible
      targetingScore: 90 // Better targeting with mobile
    };
  }

  /**
     * Compare to digital ads
     */
  compareToDigitalAds(mobileCost, mobileImpressions) {
    const digitalCPM = 25; // Average digital display CPM
    const mobileCPM = (mobileCost / mobileImpressions) * 1000;

    return {
      mobileCPM: Math.round(mobileCPM * 100) / 100,
      digitalCPM,
      difference: Math.round(((mobileCPM - digitalCPM) / digitalCPM) * 100),
      advantages: [
        '100% viewability',
        'No ad blockers',
        'Physical presence',
        'Higher recall rate'
      ]
    };
  }

  /**
     * Calculate savings
     */
  calculateSavings(params, basePrice) {
    const savings = [];
    const { duration, durationUnit, trucks } = params;

    // Volume discount
    if (trucks >= 3) {
      const discount = trucks >= 10 ? 0.15 : trucks >= 5 ? 0.10 : 0.05;
      savings.push({
        type: 'Volume Discount',
        amount: Math.round(basePrice * discount / (1 - discount) * 100) / 100,
        description: `${discount * 100}% off for ${trucks} trucks`
      });
    }

    // Long-term discount
    const days = this.convertToDays(duration, durationUnit);
    if (days >= 7) {
      const discount = days >= 30 ? 0.15 : days >= 14 ? 0.10 : 0.05;
      savings.push({
        type: 'Long-term Discount',
        amount: Math.round(basePrice * discount / (1 - discount) * 100) / 100,
        description: `${discount * 100}% off for ${days} days`
      });
    }

    // Early bird discount (booking 2+ weeks in advance)
    if (params.startDate) {
      const daysUntilStart = Math.floor((new Date(params.startDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilStart >= 14) {
        const earlyBirdDiscount = 0.10;
        savings.push({
          type: 'Early Bird Discount',
          amount: Math.round(basePrice * earlyBirdDiscount * 100) / 100,
          description: '10% off for booking 2+ weeks in advance'
        });
      }
    }

    const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

    return {
      items: savings,
      total: Math.round(totalSavings * 100) / 100
    };
  }

  /**
     * Get available addons
     */
  getAvailableAddons(campaignType) {
    const addons = [
      {
        id: 'gps-tracking',
        name: 'Real-time GPS Tracking',
        description: 'Track your campaign trucks in real-time',
        price: 50,
        unit: 'per truck per day'
      },
      {
        id: 'analytics-dashboard',
        name: 'Advanced Analytics Dashboard',
        description: 'Detailed campaign metrics and insights',
        price: 200,
        unit: 'per campaign'
      },
      {
        id: 'custom-wrap',
        name: 'Custom Vehicle Wrap',
        description: 'Full custom design and wrap installation',
        price: 2500,
        unit: 'per truck'
      },
      {
        id: 'photographer',
        name: 'Campaign Photography',
        description: 'Professional photos of your campaign in action',
        price: 500,
        unit: 'per session'
      },
      {
        id: 'social-media',
        name: 'Social Media Package',
        description: 'Social media content creation and posting',
        price: 750,
        unit: 'per campaign'
      }
    ];

    // Filter based on campaign type
    if (campaignType === 'basic') {
      return addons.filter(a => ['gps-tracking', 'analytics-dashboard'].includes(a.id));
    }

    return addons;
  }

  /**
     * Get quote by ID
     */
  async getQuote(quoteId) {
    const quote = this.quotes.get(quoteId);

    if (!quote) {
      return {
        success: false,
        error: {
          code: 'QUOTE_NOT_FOUND',
          message: `Quote ${quoteId} not found`
        }
      };
    }

    // Check if quote has expired
    if (new Date(quote.expiresAt) < new Date()) {
      quote.status = 'expired';
    }

    return {
      success: true,
      data: quote
    };
  }

  /**
     * Update quote
     */
  async updateQuote(quoteId, updates) {
    const quote = this.quotes.get(quoteId);

    if (!quote) {
      return {
        success: false,
        error: {
          code: 'QUOTE_NOT_FOUND',
          message: `Quote ${quoteId} not found`
        }
      };
    }

    // Recalculate if campaign params changed
    if (updates.campaign) {
      const newParams = { ...quote.campaign, ...updates.campaign };
      const newQuote = await this.generateQuote(newParams);

      if (newQuote.success) {
        newQuote.data.id = quoteId; // Keep the same ID
        this.quotes.set(quoteId, newQuote.data);
        return newQuote;
      }
    }

    // Update status
    if (updates.status) {
      quote.status = updates.status;
      quote.updatedAt = new Date().toISOString();
    }

    // Update client info
    if (updates.client) {
      quote.client = { ...quote.client, ...updates.client };
    }

    this.quotes.set(quoteId, quote);

    return {
      success: true,
      data: quote
    };
  }

  /**
     * Accept quote
     */
  async acceptQuote(quoteId, paymentInfo) {
    const quote = this.quotes.get(quoteId);

    if (!quote) {
      return {
        success: false,
        error: {
          code: 'QUOTE_NOT_FOUND',
          message: `Quote ${quoteId} not found`
        }
      };
    }

    if (quote.status !== 'pending') {
      return {
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Quote is not in pending status'
        }
      };
    }

    quote.status = 'accepted';
    quote.acceptedAt = new Date().toISOString();
    quote.paymentInfo = paymentInfo;
    quote.contractId = this.generateContractId();

    this.quotes.set(quoteId, quote);

    // In production, this would trigger contract generation and payment processing

    return {
      success: true,
      data: {
        quote,
        nextSteps: [
          'Contract will be sent to your email',
          'Please submit 50% deposit within 48 hours',
          'Campaign coordinator will contact you within 24 hours'
        ]
      }
    };
  }

  /**
     * Helper functions
     */
  convertToHours(duration, unit) {
    switch (unit) {
      case 'hours': return duration;
      case 'days': return duration * 8; // 8 operational hours per day
      case 'weeks': return duration * 40; // 5 days * 8 hours
      case 'months': return duration * 160; // 20 days * 8 hours
      default: return duration;
    }
  }

  convertToDays(duration, unit) {
    switch (unit) {
      case 'hours': return duration / 8;
      case 'days': return duration;
      case 'weeks': return duration * 5;
      case 'months': return duration * 20;
      default: return duration;
    }
  }

  getSeason(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) {
      return 'spring';
    }
    if (month >= 5 && month <= 7) {
      return 'summer';
    }
    if (month >= 8 && month <= 10) {
      return 'fall';
    }
    return 'winter';
  }

  generateQuoteId() {
    return `Q${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;
  }

  generateContractId() {
    return `C${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;
  }
}

// Export singleton instance
const quoteAPI = new QuoteAPI();
export default quoteAPI;