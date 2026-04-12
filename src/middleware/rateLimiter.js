import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create rate limiters
// Development mode has much higher limits
const isDev = process.env.NODE_ENV === 'development';

const generalLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: isDev ? 10000 : 100, // 10000 requests (dev) or 100 requests (prod)
  duration: 60 * 15, // per 15 minutes
});

const authLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: isDev ? 1000 : 10, // 1000 requests (dev) or 10 requests (prod)
  duration: 60 * 15, // per 15 minutes
});

const aiLimiter = new RateLimiterMemory({
  keyPrefix: 'ai',
  points: isDev ? 500 : 20, // 500 requests (dev) or 20 requests (prod)
  duration: 60 * 60, // per hour
});

export const rateLimiter = async (req, res, next) => {
  try {
    // Use IP address as key
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    await generalLimiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60
    });
  }
};

export const authRateLimiter = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    await authLimiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 900
    });
  }
};

export const aiRateLimiter = async (req, res, next) => {
  try {
    const key = req.user ? req.user._id.toString() : (req.ip || 'unknown');
    await aiLimiter.consume(key);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: 'AI request limit reached, please try again later',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 3600
    });
  }
};

export default { rateLimiter, authRateLimiter, aiRateLimiter };
