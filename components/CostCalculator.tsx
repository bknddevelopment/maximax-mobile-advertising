import React, { useState, useEffect, useCallback } from 'react';

interface PricingFactors {
  baseRate: number;
  routeMultiplier: number;
  timeMultiplier: number;
  seasonalMultiplier: number;
  designComplexity: number;
  urgencyFactor: number;
}

interface CampaignDetails {
  duration: number;
  routes: string[];
  designType: 'provided' | 'basic' | 'premium' | 'custom';
  trucks: number;
  timeSlots: string[];
  startDate: string;
  urgency: 'standard' | 'rush' | 'urgent';
}

interface ComparisonData {
  type: string;
  cost: number;
  impressions: number;
  cpm: number;
  advantages: string[];
}

const CostCalculator: React.FC = () => {
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails>({
    duration: 7,
    routes: ['miami-beach'],
    designType: 'basic',
    trucks: 1,
    timeSlots: ['peak'],
    startDate: '',
    urgency: 'standard'
  });

  const [totalCost, setTotalCost] = useState(0);
  const [estimatedImpressions, setEstimatedImpressions] = useState(0);
  const [costPerImpression, setCostPerImpression] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [comparisonMode, setComparisonMode] = useState(false);

  const routeOptions = {
    'miami-beach': { name: 'Miami Beach Circuit', impressions: 75000, multiplier: 1.3 },
    'downtown': { name: 'Downtown Business District', impressions: 95000, multiplier: 1.5 },
    'wynwood': { name: 'Wynwood Arts District', impressions: 65000, multiplier: 1.2 },
    'aventura': { name: 'Aventura Shopping Zone', impressions: 85000, multiplier: 1.4 },
    'brickell': { name: 'Brickell Financial District', impressions: 90000, multiplier: 1.45 },
    'coral-gables': { name: 'Coral Gables Premium', impressions: 70000, multiplier: 1.35 }
  };

  const timeSlotOptions = {
    'morning': { name: 'Morning Rush (6AM-10AM)', multiplier: 1.2 },
    'midday': { name: 'Midday (10AM-2PM)', multiplier: 0.9 },
    'afternoon': { name: 'Afternoon (2PM-6PM)', multiplier: 1.1 },
    'peak': { name: 'Evening Peak (6PM-10PM)', multiplier: 1.4 },
    'late': { name: 'Late Night (10PM-2AM)', multiplier: 0.8 },
    'weekend': { name: 'Weekend Special', multiplier: 1.3 }
  };

  const designOptions = {
    'provided': { name: 'Customer Provided', cost: 0 },
    'basic': { name: 'Basic Design', cost: 500 },
    'premium': { name: 'Premium Design', cost: 1500 },
    'custom': { name: 'Custom Animation', cost: 3000 }
  };

  const calculateAIPricing = useCallback(() => {
    const baseRate = 1200; // Base daily rate per truck
    
    // Calculate route multiplier
    const routeMultiplier = campaignDetails.routes.reduce((acc, route) => {
      return acc + (routeOptions[route as keyof typeof routeOptions]?.multiplier || 1);
    }, 0) / campaignDetails.routes.length;

    // Calculate time slot multiplier
    const timeMultiplier = campaignDetails.timeSlots.reduce((acc, slot) => {
      return acc + (timeSlotOptions[slot as keyof typeof timeSlotOptions]?.multiplier || 1);
    }, 0) / campaignDetails.timeSlots.length;

    // Seasonal adjustment (AI-based on historical data)
    const month = new Date(campaignDetails.startDate || Date.now()).getMonth();
    const seasonalFactors = [0.9, 0.95, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.1, 1.15, 1.25, 1.35];
    const seasonalMultiplier = seasonalFactors[month] || 1;

    // Duration discount
    let durationDiscount = 1;
    if (campaignDetails.duration >= 30) durationDiscount = 0.8;
    else if (campaignDetails.duration >= 14) durationDiscount = 0.9;
    else if (campaignDetails.duration >= 7) durationDiscount = 0.95;

    // Urgency factor
    const urgencyFactors = {
      'standard': 1,
      'rush': 1.25,
      'urgent': 1.5
    };
    const urgencyMultiplier = urgencyFactors[campaignDetails.urgency];

    // Fleet discount
    let fleetDiscount = 1;
    if (campaignDetails.trucks >= 5) fleetDiscount = 0.85;
    else if (campaignDetails.trucks >= 3) fleetDiscount = 0.92;

    // Calculate base cost
    let baseCost = baseRate * 
                   campaignDetails.duration * 
                   campaignDetails.trucks * 
                   routeMultiplier * 
                   timeMultiplier * 
                   seasonalMultiplier * 
                   durationDiscount * 
                   urgencyMultiplier * 
                   fleetDiscount;

    // Add design cost
    const designCost = designOptions[campaignDetails.designType].cost;
    const total = baseCost + designCost;

    // Calculate impressions
    const dailyImpressions = campaignDetails.routes.reduce((acc, route) => {
      return acc + (routeOptions[route as keyof typeof routeOptions]?.impressions || 50000);
    }, 0);
    
    const totalImpressions = dailyImpressions * campaignDetails.duration * campaignDetails.trucks;
    
    // Calculate CPM (Cost Per Thousand Impressions)
    const cpm = (total / totalImpressions) * 1000;

    // Calculate savings compared to traditional billboard
    const traditionalCost = totalImpressions * 0.005; // $5 CPM for traditional
    const savings = traditionalCost - total;

    // AI Recommendation
    const recommendation = generateAIRecommendation(
      campaignDetails,
      total,
      totalImpressions,
      cpm
    );

    setTotalCost(total);
    setEstimatedImpressions(totalImpressions);
    setCostPerImpression(cpm);
    setSavingsAmount(savings);
    setAiRecommendation(recommendation);
  }, [campaignDetails]);

  const generateAIRecommendation = (
    details: CampaignDetails,
    cost: number,
    impressions: number,
    cpm: number
  ): string => {
    const recommendations = [];

    // Route optimization
    if (details.routes.length === 1) {
      recommendations.push('Consider adding multiple routes to increase reach and diversity');
    }

    // Time slot optimization
    if (!details.timeSlots.includes('peak')) {
      recommendations.push('Adding evening peak hours could increase visibility by 40%');
    }

    // Duration optimization
    if (details.duration < 7) {
      recommendations.push('Campaigns of 7+ days see 25% better brand recall');
    }

    // Fleet optimization
    if (details.trucks === 1 && impressions < 500000) {
      recommendations.push('Adding a second truck could double your impressions for only 85% more cost');
    }

    // Cost efficiency
    if (cpm > 3) {
      recommendations.push('Your CPM is higher than average. Consider extending duration for better rates');
    }

    // Seasonal optimization
    const month = new Date(details.startDate || Date.now()).getMonth();
    if ([11, 0, 1].includes(month)) {
      recommendations.push('Holiday season campaigns see 35% higher engagement rates');
    }

    return recommendations.length > 0 
      ? recommendations[0]
      : 'Your campaign is well-optimized! Current configuration offers excellent value.';
  };

  useEffect(() => {
    calculateAIPricing();
  }, [calculateAIPricing]);

  const handleDetailChange = (field: keyof CampaignDetails, value: any) => {
    setCampaignDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleRoute = (route: string) => {
    setCampaignDetails(prev => ({
      ...prev,
      routes: prev.routes.includes(route)
        ? prev.routes.filter(r => r !== route)
        : [...prev.routes, route]
    }));
  };

  const toggleTimeSlot = (slot: string) => {
    setCampaignDetails(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot]
    }));
  };

  const getComparisonData = (): ComparisonData[] => {
    return [
      {
        type: 'Mobile Billboard (MaxiMax)',
        cost: totalCost,
        impressions: estimatedImpressions,
        cpm: costPerImpression,
        advantages: [
          'Targeted routes',
          'Flexible scheduling',
          'Real-time tracking',
          'Weather resistant'
        ]
      },
      {
        type: 'Traditional Billboard',
        cost: estimatedImpressions * 0.005,
        impressions: estimatedImpressions * 0.3,
        cpm: 5,
        advantages: [
          'Fixed location',
          'Long-term presence',
          'No fuel costs',
          'Simple setup'
        ]
      },
      {
        type: 'Digital Billboard',
        cost: estimatedImpressions * 0.008,
        impressions: estimatedImpressions * 0.5,
        cpm: 8,
        advantages: [
          'Dynamic content',
          'Multiple advertisers',
          'High visibility',
          'Premium locations'
        ]
      },
      {
        type: 'Social Media Ads',
        cost: estimatedImpressions * 0.002,
        impressions: estimatedImpressions * 2,
        cpm: 2,
        advantages: [
          'Precise targeting',
          'Engagement metrics',
          'A/B testing',
          'Global reach'
        ]
      }
    ];
  };

  return (
    <div className="cost-calculator">
      <div className="calculator-header">
        <h2>Interactive Cost Calculator</h2>
        <p>AI-powered pricing engine with real-time optimization recommendations</p>
      </div>

      <div className="calculator-container">
        <div className="input-section">
          <div className="input-group">
            <h3>Campaign Duration</h3>
            <div className="duration-slider">
              <input
                type="range"
                min="1"
                max="90"
                value={campaignDetails.duration}
                onChange={(e) => handleDetailChange('duration', parseInt(e.target.value))}
              />
              <div className="duration-display">
                <span className="duration-value">{campaignDetails.duration}</span>
                <span className="duration-label">Days</span>
              </div>
            </div>
            <div className="duration-presets">
              <button onClick={() => handleDetailChange('duration', 7)}>1 Week</button>
              <button onClick={() => handleDetailChange('duration', 14)}>2 Weeks</button>
              <button onClick={() => handleDetailChange('duration', 30)}>1 Month</button>
              <button onClick={() => handleDetailChange('duration', 90)}>3 Months</button>
            </div>
          </div>

          <div className="input-group">
            <h3>Select Routes</h3>
            <div className="route-grid">
              {Object.entries(routeOptions).map(([key, route]) => (
                <div
                  key={key}
                  className={`route-card ${campaignDetails.routes.includes(key) ? 'selected' : ''}`}
                  onClick={() => toggleRoute(key)}
                >
                  <div className="route-name">{route.name}</div>
                  <div className="route-stats">
                    <span className="impressions">{route.impressions.toLocaleString()} daily views</span>
                    <span className="multiplier">×{route.multiplier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="input-group">
            <h3>Time Slots</h3>
            <div className="time-slots">
              {Object.entries(timeSlotOptions).map(([key, slot]) => (
                <label key={key} className="time-slot-option">
                  <input
                    type="checkbox"
                    checked={campaignDetails.timeSlots.includes(key)}
                    onChange={() => toggleTimeSlot(key)}
                  />
                  <div className="slot-info">
                    <span className="slot-name">{slot.name}</span>
                    <span className="slot-multiplier">×{slot.multiplier}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="input-group">
            <h3>Fleet Size</h3>
            <div className="fleet-selector">
              <button
                className="fleet-btn minus"
                onClick={() => handleDetailChange('trucks', Math.max(1, campaignDetails.trucks - 1))}
              >
                -
              </button>
              <div className="fleet-display">
                <span className="fleet-number">{campaignDetails.trucks}</span>
                <span className="fleet-label">Truck{campaignDetails.trucks > 1 ? 's' : ''}</span>
              </div>
              <button
                className="fleet-btn plus"
                onClick={() => handleDetailChange('trucks', Math.min(10, campaignDetails.trucks + 1))}
              >
                +
              </button>
            </div>
            {campaignDetails.trucks >= 3 && (
              <div className="fleet-discount">Fleet discount applied!</div>
            )}
          </div>

          <div className="input-group">
            <h3>Design Service</h3>
            <div className="design-options">
              {Object.entries(designOptions).map(([key, option]) => (
                <label key={key} className="design-option">
                  <input
                    type="radio"
                    name="design"
                    value={key}
                    checked={campaignDetails.designType === key}
                    onChange={(e) => handleDetailChange('designType', e.target.value)}
                  />
                  <div className="option-content">
                    <span className="option-name">{option.name}</span>
                    <span className="option-cost">
                      {option.cost === 0 ? 'Free' : `+$${option.cost}`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="input-group">
            <h3>Campaign Urgency</h3>
            <div className="urgency-options">
              <button
                className={`urgency-btn ${campaignDetails.urgency === 'standard' ? 'active' : ''}`}
                onClick={() => handleDetailChange('urgency', 'standard')}
              >
                Standard (7+ days)
              </button>
              <button
                className={`urgency-btn ${campaignDetails.urgency === 'rush' ? 'active' : ''}`}
                onClick={() => handleDetailChange('urgency', 'rush')}
              >
                Rush (3-7 days)
              </button>
              <button
                className={`urgency-btn ${campaignDetails.urgency === 'urgent' ? 'active' : ''}`}
                onClick={() => handleDetailChange('urgency', 'urgent')}
              >
                Urgent (< 3 days)
              </button>
            </div>
          </div>
        </div>

        <div className="results-section">
          <div className="price-display">
            <div className="total-cost">
              <span className="cost-label">Total Campaign Cost</span>
              <span className="cost-value">${totalCost.toLocaleString()}</span>
            </div>
            
            <div className="metrics-grid">
              <div className="metric">
                <span className="metric-value">{(estimatedImpressions / 1000000).toFixed(1)}M</span>
                <span className="metric-label">Est. Impressions</span>
              </div>
              <div className="metric">
                <span className="metric-value">${costPerImpression.toFixed(2)}</span>
                <span className="metric-label">CPM</span>
              </div>
              <div className="metric savings">
                <span className="metric-value">${savingsAmount.toLocaleString()}</span>
                <span className="metric-label">Saved vs Traditional</span>
              </div>
            </div>
          </div>

          <div className="ai-recommendation">
            <div className="recommendation-header">
              <span className="ai-icon">🤖</span>
              <h4>AI Optimization Tip</h4>
            </div>
            <p>{aiRecommendation}</p>
          </div>

          <button 
            className="breakdown-toggle"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? 'Hide' : 'Show'} Cost Breakdown
          </button>

          {showBreakdown && (
            <div className="cost-breakdown">
              <h4>Detailed Breakdown</h4>
              <div className="breakdown-items">
                <div className="breakdown-item">
                  <span>Base Rate</span>
                  <span>$1,200/day/truck</span>
                </div>
                <div className="breakdown-item">
                  <span>Duration ({campaignDetails.duration} days)</span>
                  <span>×{campaignDetails.duration}</span>
                </div>
                <div className="breakdown-item">
                  <span>Fleet Size ({campaignDetails.trucks} trucks)</span>
                  <span>×{campaignDetails.trucks}</span>
                </div>
                <div className="breakdown-item">
                  <span>Route Premium</span>
                  <span>
                    ×{(campaignDetails.routes.reduce((acc, route) => 
                      acc + (routeOptions[route as keyof typeof routeOptions]?.multiplier || 1), 0
                    ) / campaignDetails.routes.length).toFixed(2)}
                  </span>
                </div>
                <div className="breakdown-item">
                  <span>Time Slot Adjustment</span>
                  <span>
                    ×{(campaignDetails.timeSlots.reduce((acc, slot) => 
                      acc + (timeSlotOptions[slot as keyof typeof timeSlotOptions]?.multiplier || 1), 0
                    ) / campaignDetails.timeSlots.length).toFixed(2)}
                  </span>
                </div>
                <div className="breakdown-item">
                  <span>Design Service</span>
                  <span>+${designOptions[campaignDetails.designType].cost}</span>
                </div>
                {campaignDetails.urgency !== 'standard' && (
                  <div className="breakdown-item urgent">
                    <span>Urgency Surcharge</span>
                    <span>×{campaignDetails.urgency === 'rush' ? '1.25' : '1.5'}</span>
                  </div>
                )}
                {campaignDetails.trucks >= 3 && (
                  <div className="breakdown-item discount">
                    <span>Fleet Discount</span>
                    <span>-{campaignDetails.trucks >= 5 ? '15%' : '8%'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            className="comparison-toggle"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            Compare with Other Media
          </button>

          {comparisonMode && (
            <div className="comparison-section">
              <h4>Media Comparison</h4>
              <div className="comparison-grid">
                {getComparisonData().map((media) => (
                  <div 
                    key={media.type} 
                    className={`comparison-card ${media.type.includes('MaxiMax') ? 'highlighted' : ''}`}
                  >
                    <h5>{media.type}</h5>
                    <div className="comparison-metrics">
                      <div className="comparison-metric">
                        <span className="metric-label">Cost</span>
                        <span className="metric-value">${media.cost.toLocaleString()}</span>
                      </div>
                      <div className="comparison-metric">
                        <span className="metric-label">Impressions</span>
                        <span className="metric-value">
                          {(media.impressions / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="comparison-metric">
                        <span className="metric-label">CPM</span>
                        <span className="metric-value">${media.cpm.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="advantages">
                      <h6>Advantages:</h6>
                      <ul>
                        {media.advantages.map((advantage, index) => (
                          <li key={index}>{advantage}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="save-quote-btn">
              Save Quote
            </button>
            <button className="get-started-btn">
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cost-calculator {
          background: linear-gradient(135deg, #F8F9FA, #E9ECEF);
          border-radius: 20px;
          padding: 30px;
          margin: 20px 0;
        }

        .calculator-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .calculator-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .calculator-header p {
          color: #6B7280;
          font-size: 1.125rem;
        }

        .calculator-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .input-section {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .input-group h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 15px;
        }

        .duration-slider {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 15px;
        }

        .duration-slider input[type="range"] {
          flex: 1;
          -webkit-appearance: none;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right, #EC008C 0%, #EC008C ${campaignDetails.duration}%, #E5E7EB ${campaignDetails.duration}%, #E5E7EB 100%);
          outline: none;
        }

        .duration-slider input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .duration-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 80px;
        }

        .duration-value {
          font-size: 2rem;
          font-weight: 800;
          color: #EC008C;
        }

        .duration-label {
          font-size: 0.875rem;
          color: #6B7280;
        }

        .duration-presets {
          display: flex;
          gap: 10px;
        }

        .duration-presets button {
          padding: 8px 16px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .duration-presets button:hover {
          border-color: #EC008C;
          color: #EC008C;
        }

        .route-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .route-card {
          padding: 15px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .route-card:hover {
          border-color: #00AEEF;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 174, 239, 0.2);
        }

        .route-card.selected {
          background: linear-gradient(135deg, #EC008C10, #00AEEF10);
          border-color: #EC008C;
        }

        .route-name {
          font-weight: 600;
          color: #374151;
          margin-bottom: 5px;
        }

        .route-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .impressions {
          color: #6B7280;
        }

        .multiplier {
          color: #EC008C;
          font-weight: 600;
        }

        .time-slots {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .time-slot-option {
          display: flex;
          align-items: center;
          padding: 12px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .time-slot-option:hover {
          border-color: #00AEEF;
        }

        .time-slot-option input[type="checkbox"] {
          margin-right: 12px;
        }

        .slot-info {
          display: flex;
          justify-content: space-between;
          flex: 1;
        }

        .slot-name {
          color: #374151;
          font-weight: 500;
        }

        .slot-multiplier {
          color: #EC008C;
          font-weight: 600;
        }

        .fleet-selector {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .fleet-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          color: white;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .fleet-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(236, 0, 140, 0.3);
        }

        .fleet-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .fleet-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #EC008C;
        }

        .fleet-label {
          font-size: 0.875rem;
          color: #6B7280;
        }

        .fleet-discount {
          padding: 8px 16px;
          background: linear-gradient(135deg, #10B98120, #05966920);
          border-radius: 8px;
          color: #10B981;
          font-weight: 600;
          text-align: center;
          margin-top: 10px;
        }

        .design-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .design-option {
          display: flex;
          align-items: center;
          padding: 12px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .design-option:hover {
          border-color: #EC008C;
        }

        .design-option input[type="radio"] {
          margin-right: 12px;
        }

        .option-content {
          display: flex;
          justify-content: space-between;
          flex: 1;
        }

        .option-name {
          color: #374151;
          font-weight: 500;
        }

        .option-cost {
          color: #EC008C;
          font-weight: 600;
        }

        .urgency-options {
          display: flex;
          gap: 10px;
        }

        .urgency-btn {
          flex: 1;
          padding: 12px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .urgency-btn:hover {
          border-color: #00AEEF;
        }

        .urgency-btn.active {
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          color: white;
          border-color: transparent;
        }

        .results-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .price-display {
          background: linear-gradient(135deg, #EC008C10, #00AEEF10);
          border-radius: 15px;
          padding: 25px;
          border: 2px solid #EC008C30;
        }

        .total-cost {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .cost-label {
          font-size: 1rem;
          color: #6B7280;
          margin-bottom: 5px;
        }

        .cost-value {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          background: white;
          border-radius: 10px;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #6B7280;
          text-transform: uppercase;
        }

        .metric.savings .metric-value {
          color: #10B981;
        }

        .ai-recommendation {
          background: linear-gradient(135deg, #7209B710, #3A0CA310);
          border: 2px solid #7209B730;
          border-radius: 12px;
          padding: 20px;
        }

        .recommendation-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .ai-icon {
          font-size: 1.5rem;
        }

        .recommendation-header h4 {
          font-size: 1.125rem;
          color: #7209B7;
          margin: 0;
        }

        .ai-recommendation p {
          color: #374151;
          line-height: 1.6;
        }

        .breakdown-toggle,
        .comparison-toggle {
          padding: 12px 24px;
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          color: #6B7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .breakdown-toggle:hover,
        .comparison-toggle:hover {
          border-color: #EC008C;
          color: #EC008C;
        }

        .cost-breakdown {
          background: #F8F9FA;
          border-radius: 12px;
          padding: 20px;
        }

        .cost-breakdown h4 {
          font-size: 1.125rem;
          color: #374151;
          margin-bottom: 15px;
        }

        .breakdown-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: white;
          border-radius: 6px;
        }

        .breakdown-item.urgent {
          background: #FEF2F2;
          color: #EF4444;
        }

        .breakdown-item.discount {
          background: #F0FDF4;
          color: #10B981;
        }

        .comparison-section {
          background: #F8F9FA;
          border-radius: 12px;
          padding: 20px;
        }

        .comparison-section h4 {
          font-size: 1.125rem;
          color: #374151;
          margin-bottom: 15px;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .comparison-card {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 10px;
          padding: 15px;
        }

        .comparison-card.highlighted {
          background: linear-gradient(135deg, #EC008C10, #00AEEF10);
          border-color: #EC008C;
        }

        .comparison-card h5 {
          font-size: 1rem;
          color: #374151;
          margin-bottom: 10px;
        }

        .comparison-metrics {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
        }

        .comparison-metric {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .advantages h6 {
          font-size: 0.875rem;
          color: #6B7280;
          margin-bottom: 5px;
        }

        .advantages ul {
          list-style: none;
          padding: 0;
        }

        .advantages li {
          font-size: 0.75rem;
          color: #9CA3AF;
          padding: 2px 0;
        }

        .advantages li::before {
          content: '✓ ';
          color: #10B981;
          font-weight: bold;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .save-quote-btn,
        .get-started-btn {
          flex: 1;
          padding: 15px;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-quote-btn {
          background: white;
          border: 2px solid #EC008C;
          color: #EC008C;
        }

        .save-quote-btn:hover {
          background: #EC008C10;
        }

        .get-started-btn {
          background: linear-gradient(135deg, #EC008C, #00AEEF);
          color: white;
        }

        .get-started-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(236, 0, 140, 0.3);
        }

        @media (max-width: 1024px) {
          .calculator-container {
            grid-template-columns: 1fr;
          }

          .route-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
          }

          .urgency-options {
            flex-direction: column;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default CostCalculator;