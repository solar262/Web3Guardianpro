// Enhanced analytics module for tracking conversions, revenue, and user behavior
export class Analytics {
  static pageViews = {};
  static conversions = [];
  static events = [];
  static revenue = 0;
  static sessionId = null;
  
  // Initialize analytics
  static init() {
    this._loadData();
    this._setSessionId();
    
    // Track initial page view
    const currentPage = window.location.pathname;
    this.trackPageView(currentPage);
    
    // Set up Google Analytics if available
    if (window.gtag) {
      window.gtag('config', 'G-YOUR-TRACKING-ID', {
        'page_path': currentPage
      });
    }
    
    console.log('Analytics initialized');
  }
  
  // Set or refresh session ID
  static _setSessionId() {
    if (!this.sessionId) {
      this.sessionId = this._generateId();
      localStorage.setItem('w3sp_session', this.sessionId);
    }
  }
  
  // Generate unique ID
  static _generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  // Track page views
  static trackPageView(page) {
    if (!this.pageViews[page]) {
      this.pageViews[page] = 0;
    }
    this.pageViews[page]++;
    
    // Save to localStorage for persistence
    this._saveData();
    
    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        'page_location': window.location.href,
        'page_path': page,
        'page_title': document.title
      });
    }
  }
  
  // Track plan selection/clicks
  static trackPlanView(plan) {
    this.trackEvent('plan_view', { plan });
  }
  
  // Track checkout initiation
  static trackCheckoutStart(plan, price) {
    this.trackEvent('checkout_start', { plan, price });
    
    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        'currency': 'USD',
        'value': price,
        'items': [{
          'id': plan,
          'name': plan,
          'price': price,
          'quantity': 1
        }]
      });
    }
  }
  
  // Track successful conversion
  static trackConversion(plan, price, customerId) {
    const conversionData = {
      timestamp: new Date().toISOString(),
      plan,
      price,
      customerId,
      sessionId: this.sessionId
    };
    
    this.conversions.push(conversionData);
    
    // Add to revenue
    this.revenue += price;
    
    // Save to localStorage for persistence
    this._saveData();
  }
    // Track general events
  static trackEvent(eventName, data = {}) {
    const event = {
      eventName,
      timestamp: new Date().toISOString(),
      data,
      sessionId: this.sessionId,
      userId: localStorage.getItem('w3sp_user_id') || 'anonymous'
    };
    
    // Store in events array
    this.events.push(event);
    
    // In production this would be sent to a server
    console.log('Event tracked:', event);
    
    // For demo purposes, store in localStorage
    const events = JSON.parse(localStorage.getItem('w3sp_events') || '[]');
    events.push(event);
    
    // Limit to last 100 events to prevent localStorage overflow
    if (events.length > 100) {
      events.shift();
    }
    
    localStorage.setItem('w3sp_events', JSON.stringify(events));
    
    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }
    
    return event;
  }
  
  // Track lead capture
  static trackLeadCapture(email, source) {
    return this.trackEvent('lead_capture', {
      email,
      source,
      timestamp: new Date().toISOString()
    });
  }
  
  // Track contract scan
  static trackContractScan(contractSize, vulnerabilities, securityScore) {
    return this.trackEvent('contract_scan', {
      contractSize,
      vulnerabilityCount: vulnerabilities?.length || 0,
      securityScore,
      timestamp: new Date().toISOString()
    });
  }
  
  // Get analytics data
  static getAnalytics() {
    return {
      pageViews: this.pageViews,
      conversions: this.conversions,
      revenue: this.revenue,
      events: this.events,
      metrics: this._calculateMetrics()
    };
  }
  
  // Calculate advanced metrics
  static _calculateMetrics() {
    // Count unique users
    const uniqueUsers = new Set();
    this.events.forEach(event => {
      if (event.userId) uniqueUsers.add(event.userId);
    });
    
    // Count unique sessions
    const uniqueSessions = new Set();
    this.events.forEach(event => {
      if (event.sessionId) uniqueSessions.add(event.sessionId);
    });
    
    // Calculate conversion rate
    const conversionRate = uniqueSessions.size > 0 ? (this.conversions.length / uniqueSessions.size) * 100 : 0;
    
    // Get average revenue per user
    const arpu = uniqueUsers.size > 0 ? this.revenue / uniqueUsers.size : 0;
    
    return {
      uniqueUsers: uniqueUsers.size,
      uniqueSessions: uniqueSessions.size,
      conversionRate: conversionRate.toFixed(2),
      arpu: arpu.toFixed(2)
    };
  }
  
  // Save data to localStorage
  static _saveData() {
    localStorage.setItem('w3sp_analytics', JSON.stringify({
      pageViews: this.pageViews,
      conversions: this.conversions,
      revenue: this.revenue,
      lastUpdated: new Date().toISOString()
    }));
  }
  
  // Load data from localStorage
  static _loadData() {
    const data = JSON.parse(localStorage.getItem('w3sp_analytics') || '{}');
    this.pageViews = data.pageViews || {};
    this.conversions = data.conversions || [];
    this.revenue = data.revenue || 0;
    
    // Load events
    this.events = JSON.parse(localStorage.getItem('w3sp_events') || '[]');
    
    // Sort events by timestamp
    this.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
  
  // Clear all analytics data
  static clearData() {
    this.pageViews = {};
    this.conversions = [];
    this.events = [];
    this.revenue = 0;
    localStorage.removeItem('w3sp_analytics');
    localStorage.removeItem('w3sp_events');
    console.log('Analytics data cleared');
  }
  
  // Export data for analysis
  static exportData() {
    const data = {
      pageViews: this.pageViews,
      conversions: this.conversions,
      revenue: this.revenue,
      events: this.events,
      metrics: this._calculateMetrics(),
      exportTime: new Date().toISOString()
    };
      return JSON.stringify(data, null, 2);
  }
}
