// Enhanced authentication and user management system
import { CustomerDb } from './customerDb.js';

export class Auth {
  static TOKEN_KEY = 'w3sp_token';
  static USER_KEY = 'w3sp_user';
  static SUBSCRIPTION_KEY = 'w3sp_subscription';
  static SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  static isAuthenticated() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    
    try {
      // Check token expiration
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiry = tokenData.exp * 1000; // Convert to ms
      
      if (Date.now() > expiry) {
        console.log('Token expired, logging user out');
        this.logout();
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error validating token:', err);
      return false;
    }
  }

  /**
   * Get current user info
   * @returns {Object|null} - User data or null if not authenticated
   */
  static getUserInfo() {
    if (!this.isAuthenticated()) return null;
    
    const userInfo = localStorage.getItem(this.USER_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Get user's subscription
   * @returns {Object|null} - Subscription data
   */
  static getSubscription() {
    const subscription = localStorage.getItem(this.SUBSCRIPTION_KEY);
    if (!subscription) return null;
    
    try {
      return JSON.parse(subscription);
    } catch (err) {
      console.error('Error parsing subscription data:', err);
      return null;
    }
  }

  /**
   * Login user with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Login result
   */
  static async loginWithCredentials(email, password) {
    try {
      // In production this would call an API endpoint
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user exists in CustomerDb
      const user = CustomerDb.findUserByEmail(email);
      
      if (!user || user.password !== password) {
        return { success: false, error: 'Invalid email or password' };
      }
      
      // Generate token
      const token = this._generateToken(user);
      
      // Store user data
      this.login(
        { id: user.id, email: user.email, name: user.name },
        token,
        user.subscription
      );
      
      return { 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name },
        subscription: user.subscription
      };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration result
   */
  static async register(userData) {
    try {
      // In production this would call an API endpoint
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Check if user already exists
      const existingUser = CustomerDb.findUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }
      
      // Create new user
      const newUser = CustomerDb.createUser({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        created: new Date().toISOString()
      });
      
      // Generate token
      const token = this._generateToken(newUser);
      
      // Store user data
      this.login(
        { id: newUser.id, email: newUser.email, name: newUser.name },
        token
      );
      
      return { 
        success: true, 
        user: { id: newUser.id, email: newUser.email, name: newUser.name }
      };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Login user with token and data
   * @param {Object} userData - User data
   * @param {string} token - Authentication token
   * @param {Object} subscription - User subscription
   * @returns {boolean} - Success status
   */
  static login(userData, token, subscription = null) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    
    if (subscription) {
      localStorage.setItem(this.SUBSCRIPTION_KEY, JSON.stringify(subscription));
    }
    
    // Track login in analytics if available
    if (window.trackEvent) {
      window.trackEvent('user_login', { userId: userData.id });
    }
    
    return true;
  }

  /**
   * Logout current user
   * @returns {boolean} - Success status
   */
  static logout() {
    // Track logout in analytics if available
    const userData = this.getUserInfo();
    if (userData && window.trackEvent) {
      window.trackEvent('user_logout', { userId: userData.id });
    }
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.SUBSCRIPTION_KEY);
    
    return true;
  }

  /**
   * Update user subscription
   * @param {Object} subscription - Subscription data
   * @returns {boolean} - Success status
   */
  static updateSubscription(subscription) {
    localStorage.setItem(this.SUBSCRIPTION_KEY, JSON.stringify(subscription));
    
    // Update in CustomerDb
    const user = this.getUserInfo();
    if (user) {
      CustomerDb.updateUserSubscription(user.id, subscription);
    }
    
    // Track subscription update in analytics if available
    if (user && window.trackEvent) {
      window.trackEvent('subscription_updated', { 
        userId: user.id,
        plan: subscription.plan,
        price: subscription.price
      });
    }
    
    return true;
  }
  
  /**
   * Generate authentication token
   * @param {Object} user - User data
   * @returns {string} - JWT token (simulated)
   * @private
   */
  static _generateToken(user) {
    // This is a simplified token generator for demo purposes
    // In production, use a proper JWT library
    
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.SESSION_TIMEOUT_MS) / 1000)
    };
    
    const headerStr = btoa(JSON.stringify(header));
    const payloadStr = btoa(JSON.stringify(payload));
    const signature = btoa(`${user.id}-${Math.random()}`); // Not a real signature
    
    return `${headerStr}.${payloadStr}.${signature}`;
  }
}
