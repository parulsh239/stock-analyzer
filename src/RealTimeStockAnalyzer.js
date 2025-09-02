import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Activity, Volume2, Target,
  BarChart3, Zap, Eye, Clock, Star, ChevronDown, ChevronRight,
  AlertCircle, BookOpen, Lightbulb, Search, Calculator,
  DollarSign, PieChart, Shield, Award, Brain, RefreshCw,
  Plus, Minus, Bell, BellOff, Wallet, X, CheckCircle
} from 'lucide-react';
import { stockAPI } from '../services/stockAPI';

const RealTimeStockAnalyzer = () => {
  const [activeCategory, setActiveCategory] = useState('analyzer');
  const [expandedIndicator, setExpandedIndicator] = useState(null);
  const [stockSymbol, setStockSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [analysisTab, setAnalysisTab] = useState('technical');
  const [portfolio, setPortfolio] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Color mapping for dynamic Tailwind classes
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      borderL: 'border-l-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      borderL: 'border-l-green-500'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      icon: 'text-purple-600',
      borderL: 'border-l-purple-500'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: 'text-orange-600',
      borderL: 'border-l-orange-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      borderL: 'border-l-red-500'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-800',
      icon: 'text-indigo-600',
      borderL: 'border-l-indigo-500'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: 'text-emerald-600',
      borderL: 'border-l-emerald-500'
    }
  };

  // Load portfolio and alerts from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('stockPortfolio');
    const savedAlerts = localStorage.getItem('stockAlerts');
    
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  // Save portfolio and alerts to localStorage
  useEffect(() => {
    localStorage.setItem('stockPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('stockAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Fetch stock data
  const fetchStockData = async (symbol) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await stockAPI.getStockData(symbol);
      setStockData(data);
    } catch (err) {
      setError('Failed to fetch stock data. Using demo data for display.');
      console.error('Error fetching stock data:', err);
      // Still show demo data on error
      const data = await stockAPI.getStockData(symbol);
      setStockData(data);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchStockData(stockSymbol);
  }, []);

  const handleAnalyze = () => {
    if (stockSymbol.trim()) {
      fetchStockData(stockSymbol.trim().toUpperCase());
    }
  };

  // Enhanced analysis with more indicators
  const getComprehensiveAnalysis = () => {
    if (!stockData) return null;

    const technical = analyzeTechnical();
    const fundamental = analyzeFundamental();
    const valueScore = calculateValueInvestorScore();
    const riskAssessment = calculateRiskAssessment();
    
    return {
      technical,
      fundamental,
      valueScore,
      riskAssessment,
      overallRecommendation: getOverallRecommendation(technical, fundamental, valueScore, riskAssessment),
      confidence: calculateConfidence(technical, fundamental, valueScore)
    };
  };

  const analyzeTechnical = () => {
    const signals = [];
    let bullishSignals = 0;
    let bearishSignals = 0;

    // Moving Average Analysis
    const priceAboveSMA20 = stockData.price > stockData.sma20;
    const priceAboveSMA50 = stockData.price > stockData.sma50;
    const priceAboveSMA200 = stockData.price > stockData.sma200;

    if (priceAboveSMA200) {
      signals.push({ type: 'BULLISH', indicator: 'Moving Average', reason: 'Price above 200-day SMA (long-term uptrend)', strength: 'Strong' });
      bullishSignals += 2;
    } else {
      signals.push({ type: 'BEARISH', indicator: 'Moving Average', reason: 'Price below 200-day SMA (long-term downtrend)', strength: 'Strong' });
      bearishSignals += 2;
    }

    // RSI Analysis
    if (stockData.rsi > 70) {
      signals.push({ type: 'BEARISH', indicator: 'RSI', reason: 'Overbought conditions (RSI > 70)', strength: 'Moderate' });
      bearishSignals += 1;
    } else if (stockData.rsi < 30) {
      signals.push({ type: 'BULLISH', indicator: 'RSI', reason: 'Oversold conditions (RSI < 30)', strength: 'Strong' });
      bullishSignals += 2;
    }

    // MACD Analysis
    if (stockData.macd > 0) {
      signals.push({ type: 'BULLISH', indicator: 'MACD', reason: 'MACD above signal line', strength: 'Moderate' });
      bullishSignals += 1;
    } else {
      signals.push({ type: 'BEARISH', indicator: 'MACD', reason: 'MACD below signal line', strength: 'Moderate' });
      bearishSignals += 1;
    }

    const netSignal = bullishSignals - bearishSignals;
    let trend;
    if (netSignal > 2) trend = 'Strong Bullish';
    else if (netSignal > 0) trend = 'Bullish';
    else if (netSignal < -2) trend = 'Strong Bearish';
    else if (netSignal < 0) trend = 'Bearish';
    else trend = 'Neutral';

    return {
      trend,
      signals,
      bullishSignals,
      bearishSignals,
      momentum: stockData.rsi > 70 ? 'Overbought' : stockData.rsi < 30 ? 'Oversold' : 'Neutral',
      volatility: stockData.atr > 5 ? 'High' : stockData.atr < 2 ? 'Low' : 'Medium'
    };
  };

  const analyzeFundamental = () => {
    const scores = {};
    let totalScore = 0;
    let maxScore = 0;

    // P/E Ratio Analysis
    if (stockData.pe > 0 && stockData.pe < 15) {
      scores.pe = { score: 5, status: 'Excellent', reason: 'Very reasonable P/E ratio' };
    } else if (stockData.pe < 25) {
      scores.pe = { score: 3, status: 'Good', reason: 'Reasonable P/E ratio' };
    } else {
      scores.pe = { score: 1, status: 'Expensive', reason: 'High P/E ratio' };
    }
    totalScore += scores.pe.score;
    maxScore += 5;

    // ROE Analysis
    if (stockData.roe > 20) {
      scores.roe = { score: 5, status: 'Excellent', reason: 'Outstanding return on equity' };
    } else if (stockData.roe > 15) {
      scores.roe = { score: 4, status: 'Very Good', reason: 'Strong return on equity' };
    } else {
      scores.roe = { score: 2, status: 'Average', reason: 'Adequate return on equity' };
    }
    totalScore += scores.roe.score;
    maxScore += 5;

    const overallScore = Math.round((totalScore / maxScore) * 100);
    
    return {
      scores,
      overallScore,
      valuation: stockData.pe < 20 ? 'Reasonable' : 'Expensive',
      quality: overallScore > 70 ? 'High Quality' : 'Average Quality'
    };
  };

  const calculateValueInvestorScore = () => {
    let score = 0;
    const factors = [];
    const warnings = [];

    if (stockData.pe > 0 && stockData.pe < 20) {
      score += 20;
      factors.push('Reasonable P/E ratio (< 20)');
    }

    if (stockData.roe > 15) {
      score += 20;
      factors.push('Strong return on equity (> 15%)');
    }

    if (stockData.dividendYield > 0) {
      score += 10;
      factors.push('Pays dividend (management discipline)');
    }

    return { score, factors, warnings, maxScore: 100 };
  };

  const calculateRiskAssessment = () => {
    const risks = [];
    let riskLevel = 0;

    if (stockData.beta > 1.5) {
      risks.push('High volatility (Beta > 1.5)');
      riskLevel = Math.max(riskLevel, 2);
    }

    if (stockData.pe > 30) {
      risks.push('High valuation risk');
      riskLevel = Math.max(riskLevel, 1);
    }

    const riskLabels = ['Low Risk', 'Medium Risk', 'High Risk'];
    const riskColors = ['text-green-600', 'text-yellow-600', 'text-red-600'];

    return {
      level: riskLabels[riskLevel],
      color: riskColors[riskLevel],
      risks
    };
  };

  const getOverallRecommendation = (technical, fundamental, valueScore, riskAssessment) => {
    let score = 50; // Base score

    // Technical weight (30%)
    if (technical.trend.includes('Strong Bullish')) score += 15;
    else if (technical.trend.includes('Bullish')) score += 10;
    else if (technical.trend.includes('Strong Bearish')) score -= 15;
    else if (technical.trend.includes('Bearish')) score -= 10;

    // Fundamental weight (40%)
    score += (fundamental.overallScore * 0.2);

    // Value score weight (30%)
    score += (valueScore.score * 0.2);

    if (score > 70) return { action: 'STRONG BUY', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' };
    else if (score > 55) return { action: 'BUY', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    else if (score > 45) return { action: 'HOLD', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    else return { action: 'SELL', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  };

  const calculateConfidence = (technical, fundamental, valueScore) => {
    let confidence = 60;
    const signalAlignment = Math.abs(technical.bullishSignals - technical.bearishSignals);
    confidence += signalAlignment * 3;
    return Math.min(95, Math.max(25, confidence));
  };

  const analysis = getComprehensiveAnalysis();

  // Market Status Component
  const MarketStatusIndicator = () => {
    const [marketStatus, setMarketStatus] = useState({ status: 'UNKNOWN', reason: '' });

    useEffect(() => {
      const updateMarketStatus = () => {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        const currentTime = hour * 100 + now.getMinutes();

        const isWeekday = day >= 1 && day <= 5;
        const isMarketHours = currentTime >= 930 && currentTime <= 1600;

        if (!isWeekday) {
          setMarketStatus({ status: 'CLOSED', reason: 'Weekend' });
        } else if (isMarketHours) {
          setMarketStatus({ status: 'OPEN', reason: 'Regular Trading Hours' });
        } else {
          setMarketStatus({ status: 'CLOSED', reason: 'Outside Trading Hours' });
        }
      };

      updateMarketStatus();
      const interval = setInterval(updateMarketStatus, 60000);
      return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
      switch (marketStatus.status) {
        case 'OPEN': return 'bg-green-100 text-green-800 border-green-300';
        case 'CLOSED': return 'bg-red-100 text-red-800 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${
          marketStatus.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        {marketStatus.status}: {marketStatus.reason}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Real-Time Stock Analysis System
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          Educational tool combining technical and fundamental analysis
        </p>
        <MarketStatusIndicator />
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-lg p-2 shadow-sm">
        <button
          onClick={() => setActiveCategory('analyzer')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeCategory === 'analyzer' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <Search className="w-4 h-4 mr-2" />
          Stock Analyzer
        </button>
        <button
          onClick={() => setActiveCategory('education')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeCategory === 'education' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Education
        </button>
      </div>

      {/* Stock Analyzer Tab */}
      {activeCategory === 'analyzer' && (
        <div className="space-y-6">
          {/* Stock Input Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Search className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Stock Analysis</h2>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="text-amber-700">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {stockData && analysis && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Stock Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">{stockData.symbol}</h3>
                  <p className="text-gray-600">{stockData.companyName}</p>
                  <div className="flex items-center space-x-4 text-xl mt-2">
                    <span className="font-bold">${stockData.price.toFixed(2)}</span>
                    <span className={`flex items-center ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stockData.change >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                      {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className={`px-6 py-4 rounded-lg border-2 ${analysis.overallRecommendation.bgColor} ${analysis.overallRecommendation.borderColor}`}>
                  <div className="text-center">
                    <div className={`font-bold text-lg ${analysis.overallRecommendation.color}`}>
                      {analysis.overallRecommendation.action}
                    </div>
                    <div className="text-sm text-gray-600">
                      Confidence: {analysis.confidence}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Tabs */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setAnalysisTab('technical')}
                  className={`flex-1 py-3 px-4 rounded-md transition-colors ${
                    analysisTab === 'technical' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <BarChart3 className="inline-block w-4 h-4 mr-2" />
                  Technical Analysis
                </button>
                <button
                  onClick={() => setAnalysisTab('fundamental')}
                  className={`flex-1 py-3 px-4 rounded-md transition-colors ${
                    analysisTab === 'fundamental' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Calculator className="inline-block w-4 h-4 mr-2" />
                  Fundamental Analysis
                </button>
                <button
                  onClick={() => setAnalysisTab('value')}
                  className={`flex-1 py-3 px-4 rounded-md transition-colors ${
                    analysisTab === 'value' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Award className="inline-block w-4 h-4 mr-2" />
                  Value Score
                </button>
              </div>

              {/* Technical Analysis Tab */}
              {analysisTab === 'technical' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Overall Trend</div>
                      <div className={`font-bold text-lg ${analysis.technical.trend.includes('Bullish') ? 'text-green-600' : analysis.technical.trend.includes('Bearish') ? 'text-red-600' : 'text-gray-600'}`}>
                        {analysis.technical.trend}
                      </div>
                      <div className="text-xs text-gray-500">Signals: {analysis.technical.bullishSignals}B / {analysis.technical.bearishSignals}B</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Momentum</div>
                      <div className="font-bold text-lg">{analysis.technical.momentum}</div>
                      <div className="text-xs text-gray-500">RSI: {stockData.rsi.toFixed(1)}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Volatility</div>
                      <div className="font-bold text-lg">{analysis.technical.volatility}</div>
                      <div className="text-xs text-gray-500">ATR: {stockData.atr.toFixed(2)}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Volume</div>
                      <div className="font-bold text-lg">Normal</div>
                      <div className="text-xs text-gray-500">{(stockData.volume / 1000000).toFixed(1)}M shares</div>
                    </div>
                  </div>

                  {/* Trading Signals */}
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h4 className="font-semibold mb-4 text-gray-800">Current Trading Signals</h4>
                    {analysis.technical.signals.length > 0 ? (
                      <div className="space-y-3">
                        {analysis.technical.signals.map((signal, index) => (
                          <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                            signal.type === 'BULLISH' ? 'bg-green-50 border-green-200' : 
                            signal.type === 'BEARISH' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-center">
                              {signal.type === 'BULLISH' ? <TrendingUp className="w-5 h-5 text-green-600 mr-3" /> :
                               signal.type === 'BEARISH' ? <TrendingDown className="w-5 h-5 text-red-600 mr-3" /> :
                               <Activity className="w-5 h-5 text-blue-600 mr-3" />}
                              <div>
                                <span className={`font-semibold ${
                                  signal.type === 'BULLISH' ? 'text-green-700' : 
                                  signal.type === 'BEARISH' ? 'text-red-700' : 'text-blue-700'
                                }`}>
                                  {signal.indicator}
                                </span>
                                <div className="text-sm text-gray-600">{signal.reason}</div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              signal.strength === 'Strong' ? 'bg-gray-800 text-white' :
                              signal.strength === 'Moderate' ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                            }`}>
                              {signal.strength}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No strong technical signals at current levels</p>
                    )}
                  </div>
                </div>
              )}

              {/* Fundamental Analysis Tab */}
              {analysisTab === 'fundamental' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 text-lg">Valuation Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">P/E Ratio</span>
                          <span className="font-bold">{stockData.pe.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">Market Cap</span>
                          <span className="font-bold">${stockData.marketCap}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">Dividend Yield</span>
                          <span className="font-bold">{stockData.dividendYield.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 text-lg">Financial Health</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">ROE</span>
                          <span className="font-bold">{stockData.roe.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">EPS</span>
                          <span className="font-bold">${stockData.eps.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Value Investing Score Tab */}
              {analysisTab === 'value' && (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border">
                    <div className="text-4xl font-bold text-emerald-700 mb-2">
                      {analysis.valueScore.score}/100
                    </div>
                    <div className="text-xl text-gray-700 mb-2">Value Investor Score</div>
                    <div className="text-sm text-gray-600">
                      Based on principles used by successful long-term investors
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h4 className="font-semibold mb-4 text-green-800 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Positive Factors
                      </h4>
                      {analysis.valueScore.factors.length > 0 ? (
                        <ul className="space-y-2">
                          {analysis.valueScore.factors.map((factor, index) => (
                            <li key={index} className="flex items-center text-green-700">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No strong value factors identified</p>
                      )}
                    </div>

                    <div className="bg-white border rounded-lg p-6">
                      <h4 className="font-semibold mb-4 text-red-800 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Risk Factors
                      </h4>
                      {analysis.valueScore.warnings.length > 0 ? (
                        <ul className="space-y-2">
                          {analysis.valueScore.warnings.map((warning, index) => (
                            <li key={index} className="flex items-center text-red-700">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                              {warning}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No major risk factors identified</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Education Tab */}
      {activeCategory === 'education' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Investment Education</h2>
            <p className="text-gray-700 mb-4">
              This system combines technical analysis for timing with fundamental analysis for quality assessment. 
              The goal is to help you understand different analytical approaches.
            </p>
          </div>

          {/* Value Investing Principles */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-emerald-600 mr-3" />
              <h3 className="text-xl font-semibold text-emerald-800">Value Investing Principles</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border-l-4 border-emerald-500">
                <h4 className="font-semibold text-emerald-700 mb-2">Quality Companies</h4>
                <p className="text-sm text-gray-600">Look for profitable businesses with competitive advantages.</p>
              </div>
              <div className="bg-white p-4 rounded border-l-4 border-emerald-500">
                <h4 className="font-semibold text-emerald-700 mb-2">Reasonable Prices</h4>
                <p className="text-sm text-gray-600">Buy when trading below intrinsic value. Patience is essential.</p>
              </div>
              <div className="bg-white p-4 rounded border-l-4 border-emerald-500">
                <h4 className="font-semibold text-emerald-700 mb-2">Long-term Perspective</h4>
                <p className="text-sm text-gray-600">Think like you're buying the whole business. Hold for years.</p>
              </div>
            </div>
          </div>

          {/* Learning Path */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-600 mr-3" />
              <h3 className="text-xl font-semibold text-yellow-800">Recommended Learning Path</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                <span className="font-semibold text-yellow-700">1. Start with Fundamentals:</span>
                <span className="ml-2 text-gray-600">Learn to read P/E ratios and profit margins</span>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                <span className="font-semibold text-yellow-700">2. Add Technical Basics:</span>
                <span className="ml-2 text-gray-600">Moving averages, RSI, and volume analysis</span>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                <span className="font-semibold text-yellow-700">3. Practice with Paper Trading:</span>
                <span className="ml-2 text-gray-600">Test strategies without real money first</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Setup Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-blue-800">GitHub Deployment Setup</h3>
        </div>
        <div className="bg-white p-4 rounded border">
          <h4 className="font-semibold mb-2">To enable real-time data:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Get a free API key from Alpha Vantage</li>
            <li>Add your API key to GitHub repository secrets</li>
            <li>The system will automatically use real data when available</li>
            <li>Fallback to demo data ensures the app always works</li>
          </ol>
        </div>
      </div>

      {/* Enhanced Disclaimer */}
      <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <strong>Critical Investment Disclaimer:</strong> This is an educational tool only, not financial advice. 
            All investing involves substantial risk of loss. Past performance does not guarantee future results. 
            No analysis system can ensure profitable investments. Always conduct thorough research, diversify investments, 
            and consider consulting qualified financial professionals before making investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeStockAnalyzer;
