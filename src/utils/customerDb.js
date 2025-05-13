// Enhanced database service for storing customer data
// In production, this would connect to a real database
// This implementation uses localStorage for persistence

export class CustomerDb {
  static DB_KEY = 'w3sp_customer_db';
  static users = [];
  static subscriptions = [];
  static contractScans = [];
  static securityReports = [];
  
  /**
   * Initialize the database
   */
  static init() {
    this._loadData();
    
    // Seed with demo data if empty
    if (this.users.length === 0) {
      this._seedDemoData();
    }
    
    console.log('CustomerDb initialized with', {
      users: this.users.length,
      subscriptions: this.subscriptions.length,
      contractScans: this.contractScans.length
    });
  }
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} - User object or null
   */
  static findUserByEmail(email) {
    return this.users.find(user => user.email === email.toLowerCase());
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Object|null} - User object or null
   */
  static findUserById(id) {
    return this.users.find(user => user.id === id);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Object} - Created user
   */
  static createUser(userData) {
    // Generate unique ID
    const user = {
      ...userData,
      id: 'usr_' + this._generateId(),
      email: userData.email.toLowerCase(),
      created: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    this.users.push(user);
    this._saveData();
    
    return user;
  }

  /**
   * Update user data
   * @param {string} id - User ID
   * @param {Object} data - Updated user data
   * @returns {Object|null} - Updated user or null if not found
   */
  static updateUser(id, data) {
    const index = this.users.findIndex(user => user.id === id);
    if (index >= 0) {
      this.users[index] = { 
        ...this.users[index], 
        ...data, 
        updated: new Date().toISOString() 
      };
      
      this._saveData();
      return this.users[index];
    }
    return null;
  }
  
  /**
   * Add a new subscription
   * @param {Object} subscription - Subscription data
   * @returns {Object} - Created subscription
   */
  static createSubscription(subscription) {
    const newSubscription = {
      ...subscription,
      id: 'sub_' + this._generateId(),
      created: new Date().toISOString(),
      status: subscription.status || 'active'
    };
    
    this.subscriptions.push(newSubscription);
    this._saveData();
    
    return newSubscription;
  }

  /**
   * Find subscription by user ID
   * @param {string} userId - User ID
   * @returns {Object|null} - Subscription or null if not found
   */  static findSubscriptionByUserId(userId) {
    return this.subscriptions.find(sub => sub.userId === userId);
  }

  /**
   * Update subscription data
   * @param {string} id - Subscription ID
   * @param {Object} data - Updated subscription data
   * @returns {Object|null} - Updated subscription or null
   */
  static updateSubscription(id, data) {
    const index = this.subscriptions.findIndex(sub => sub.id === id);
    if (index >= 0) {
      this.subscriptions[index] = { 
        ...this.subscriptions[index], 
        ...data, 
        updated: new Date().toISOString() 
      };
      
      this._saveData();
      return this.subscriptions[index];
    }
    return null;
  }
  
  /**
   * Update user subscription directly
   * @param {string} userId - User ID
   * @param {Object} subscription - Subscription data
   * @returns {Object|null} - Updated subscription
   */
  static updateUserSubscription(userId, subscription) {
    // Find existing subscription
    const existingSub = this.findSubscriptionByUserId(userId);
    
    if (existingSub) {
      // Update existing subscription
      return this.updateSubscription(existingSub.id, subscription);
    } else {
      // Create new subscription
      return this.createSubscription({
        ...subscription,
        userId
      });
    }
  }
  
  /**
   * Create contract scan record
   * @param {Object} scan - Scan data
   * @returns {Object} - Created scan record
   */
  static createContractScan(scan) {
    const newScan = {
      ...scan,
      id: 'scn_' + this._generateId(),
      timestamp: new Date().toISOString()
    };
    
    this.contractScans.push(newScan);
    this._saveData();
    
    return newScan;
  }
  
  /**
   * Get contract scans by user ID
   * @param {string} userId - User ID
   * @returns {Array} - User's scan history
   */
  static getContractScansByUser(userId) {
    return this.contractScans.filter(scan => scan.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  /**
   * Create security report
   * @param {Object} report - Report data
   * @returns {Object} - Created report
   */
  static createSecurityReport(report) {
    const newReport = {
      ...report,
      id: 'rpt_' + this._generateId(),
      timestamp: new Date().toISOString()
    };
    
    this.securityReports.push(newReport);
    this._saveData();
    
    return newReport;
  }
  
  /**
   * Get security reports by user ID
   * @param {string} userId - User ID
   * @returns {Array} - User's reports
   */
  static getSecurityReportsByUser(userId) {
    return this.securityReports.filter(report => report.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  /**
   * Generate a unique ID
   * @returns {string} - Random ID
   * @private
   */
  static _generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Save data to localStorage
   * @private
   */
  static _saveData() {
    const data = {
      users: this.users,
      subscriptions: this.subscriptions,
      contractScans: this.contractScans,
      securityReports: this.securityReports,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(this.DB_KEY, JSON.stringify(data));
  }
  
  /**
   * Load data from localStorage
   * @private
   */
  static _loadData() {
    try {
      const data = JSON.parse(localStorage.getItem(this.DB_KEY) || '{}');
      this.users = data.users || [];
      this.subscriptions = data.subscriptions || [];
      this.contractScans = data.contractScans || [];
      this.securityReports = data.securityReports || [];
    } catch (err) {
      console.error('Error loading customer data:', err);
      // Reset to empty if corrupted
      this.users = [];
      this.subscriptions = [];
      this.contractScans = [];
      this.securityReports = [];
    }
  }
  
  /**
   * Seed with demo data
   * @private
   */
  static _seedDemoData() {
    // Create demo user
    const demoUser = this.createUser({
      email: 'demo@web3securitypro.tech',
      password: 'demo123', // In production, this would be hashed
      name: 'Demo User',
      company: 'Web3 Innovations'
    });
    
    // Create subscription
    this.createSubscription({
      userId: demoUser.id,
      plan: 'pro',
      price: 299,
      status: 'active',
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa'
      }
    });
    
    // Create sample contract scans
    this.createContractScan({
      userId: demoUser.id,
      contractName: 'TokenSwap.sol',
      vulnerabilities: [
        {
          type: 'reentrancy',
          severity: 'high',
          description: 'Potential reentrancy vulnerability detected'
        },
        {
          type: 'uncheckedReturn',
          severity: 'medium',
          description: 'Unchecked return value from low-level call'
        }
      ],
      securityScore: 70
    });
    
    this.createContractScan({
      userId: demoUser.id,
      contractName: 'StakingRewards.sol',
      vulnerabilities: [
        {
          type: 'integerOverflow',
          severity: 'medium',
          description: 'Potential integer overflow in reward calculation'
        }
      ],
      securityScore: 85
    });
    
    // Create security report
    this.createSecurityReport({
      userId: demoUser.id,
      title: 'Weekly security report',
      date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
      criticalIssues: 0,
      highIssues: 2,
      mediumIssues: 5,
      lowIssues: 8
    });
    
    console.log('Demo data seeded successfully');
  }
}
