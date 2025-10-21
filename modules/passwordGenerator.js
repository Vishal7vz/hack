const crypto = require('crypto');
const EventEmitter = require('events');

class PasswordGenerator extends EventEmitter {
  constructor() {
    super();
    this.isActive = false;
    this.generationHistory = [];
    this.maxHistorySize = 100;
  }

  initialize() {
    this.isActive = true;
    console.log('✅ Password Generator System initialized');
  }

  // Generate a secure password with customizable options
  generatePassword(options = {}) {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true,
      excludeAmbiguous = true,
      customSymbols = '',
      excludeCharacters = ''
    } = options;

    let charset = '';
    
    // Build character set based on options
    if (includeLowercase) {
      charset += 'abcdefghijklmnopqrstuvwxyz';
    }
    
    if (includeUppercase) {
      charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    
    if (includeNumbers) {
      charset += '0123456789';
    }
    
    if (includeSymbols) {
      if (customSymbols) {
        charset += customSymbols;
      } else {
        charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      }
    }

    // Remove similar characters if requested
    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }

    // Remove ambiguous characters if requested
    if (excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()\/\\~,;.<>]/g, '');
    }

    // Remove custom excluded characters
    if (excludeCharacters) {
      const excludeSet = new Set(excludeCharacters.split(''));
      charset = charset.split('').filter(char => !excludeSet.has(char)).join('');
    }

    if (charset.length === 0) {
      throw new Error('No valid characters available for password generation');
    }

    // Generate cryptographically secure password
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }

    // Calculate password strength
    const strength = this.calculatePasswordStrength(password, options);
    
    // Store in history
    this.addToHistory({
      password,
      options,
      strength,
      timestamp: new Date().toISOString()
    });

    this.emit('passwordGenerated', {
      password,
      strength,
      timestamp: new Date().toISOString()
    });

    return {
      password,
      strength,
      entropy: this.calculateEntropy(password),
      timestamp: new Date().toISOString()
    };
  }

  // Calculate password strength (0-100)
  calculatePasswordStrength(password, options) {
    let score = 0;
    const length = password.length;

    // Length score (0-40 points)
    if (length >= 8) score += 10;
    if (length >= 12) score += 10;
    if (length >= 16) score += 10;
    if (length >= 20) score += 10;

    // Character variety score (0-30 points)
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/[0-9]/.test(password)) score += 5;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;
    if (this.countUniqueCharacters(password) > length * 0.7) score += 5;

    // Pattern detection (penalty)
    if (this.hasRepeatingPattern(password)) score -= 10;
    if (this.hasSequentialPattern(password)) score -= 10;
    if (this.hasCommonPatterns(password)) score -= 5;

    // Bonus for good practices
    if (options.excludeSimilar) score += 5;
    if (options.excludeAmbiguous) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  // Calculate password entropy
  calculateEntropy(password) {
    const charsetSize = this.getCharacterSetSize(password);
    return Math.log2(Math.pow(charsetSize, password.length));
  }

  // Get character set size used in password
  getCharacterSetSize(password) {
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // Approximate symbol count
    return charsetSize;
  }

  // Count unique characters in password
  countUniqueCharacters(password) {
    return new Set(password.split('')).size;
  }

  // Check for repeating patterns
  hasRepeatingPattern(password) {
    for (let i = 2; i <= Math.floor(password.length / 2); i++) {
      const pattern = password.substring(0, i);
      if (password.includes(pattern + pattern)) {
        return true;
      }
    }
    return false;
  }

  // Check for sequential patterns
  hasSequentialPattern(password) {
    const sequences = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    const reversed = sequences.map(s => s.split('').reverse().join(''));
    
    for (const seq of [...sequences, ...reversed]) {
      for (let i = 0; i <= seq.length - 3; i++) {
        if (password.toLowerCase().includes(seq.substring(i, i + 3))) {
          return true;
        }
      }
    }
    return false;
  }

  // Check for common patterns
  hasCommonPatterns(password) {
    const commonPatterns = [
      /qwerty/i,
      /asdf/i,
      /password/i,
      /admin/i,
      /123456/i,
      /letmein/i
    ];
    
    return commonPatterns.some(pattern => pattern.test(password));
  }

  // Generate multiple passwords
  generateMultiplePasswords(count, options = {}) {
    const passwords = [];
    for (let i = 0; i < count; i++) {
      passwords.push(this.generatePassword(options));
    }
    return passwords;
  }

  // Generate password with specific requirements
  generatePasswordWithRequirements(requirements) {
    const {
      minLength = 8,
      maxLength = 128,
      minUppercase = 1,
      minLowercase = 1,
      minNumbers = 1,
      minSymbols = 1,
      maxConsecutive = 2,
      ...otherOptions
    } = requirements;

    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const options = {
        length: Math.max(minLength, Math.min(maxLength, 16)),
        includeUppercase: minUppercase > 0,
        includeLowercase: minLowercase > 0,
        includeNumbers: minNumbers > 0,
        includeSymbols: minSymbols > 0,
        ...otherOptions
      };

      const result = this.generatePassword(options);
      
      // Check if password meets all requirements
      if (this.validatePasswordRequirements(result.password, requirements)) {
        return result;
      }
      
      attempts++;
    }

    throw new Error('Could not generate password meeting all requirements');
  }

  // Validate password against requirements
  validatePasswordRequirements(password, requirements) {
    const {
      minLength,
      maxLength,
      minUppercase,
      minLowercase,
      minNumbers,
      minSymbols,
      maxConsecutive
    } = requirements;

    if (minLength && password.length < minLength) return false;
    if (maxLength && password.length > maxLength) return false;
    
    if (minUppercase && (password.match(/[A-Z]/g) || []).length < minUppercase) return false;
    if (minLowercase && (password.match(/[a-z]/g) || []).length < minLowercase) return false;
    if (minNumbers && (password.match(/[0-9]/g) || []).length < minNumbers) return false;
    if (minSymbols && (password.match(/[^a-zA-Z0-9]/g) || []).length < minSymbols) return false;

    if (maxConsecutive && this.hasConsecutiveCharacters(password, maxConsecutive)) return false;

    return true;
  }

  // Check for consecutive characters
  hasConsecutiveCharacters(password, maxConsecutive) {
    let consecutive = 1;
    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i-1]) {
        consecutive++;
        if (consecutive > maxConsecutive) return true;
      } else {
        consecutive = 1;
      }
    }
    return false;
  }

  // Generate memorable password
  generateMemorablePassword(wordCount = 4, separator = '-', includeNumbers = true) {
    const words = [
      'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'house',
      'island', 'jungle', 'knight', 'ladder', 'mountain', 'ocean', 'palace', 'queen',
      'river', 'sunset', 'tiger', 'umbrella', 'village', 'winter', 'yellow', 'zebra',
      'adventure', 'butterfly', 'crystal', 'diamond', 'elephant', 'firework', 'galaxy',
      'harmony', 'infinity', 'journey', 'kangaroo', 'lightning', 'mystery', 'nature'
    ];

    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const symbols = ['!', '@', '#', '$', '%'];

    let password = '';
    const selectedWords = [];

    // Select random words
    for (let i = 0; i < wordCount; i++) {
      const randomWord = words[crypto.randomInt(0, words.length)];
      selectedWords.push(randomWord);
    }

    password = selectedWords.join(separator);

    // Add number if requested
    if (includeNumbers) {
      const randomNumber = numbers[crypto.randomInt(0, numbers.length)];
      password += randomNumber;
    }

    // Add symbol
    const randomSymbol = symbols[crypto.randomInt(0, symbols.length)];
    password += randomSymbol;

    const strength = this.calculatePasswordStrength(password);
    
    this.addToHistory({
      password,
      options: { type: 'memorable', wordCount, separator, includeNumbers },
      strength,
      timestamp: new Date().toISOString()
    });

    return {
      password,
      strength,
      entropy: this.calculateEntropy(password),
      type: 'memorable',
      timestamp: new Date().toISOString()
    };
  }

  // Add password to history
  addToHistory(entry) {
    this.generationHistory.unshift(entry);
    if (this.generationHistory.length > this.maxHistorySize) {
      this.generationHistory.pop();
    }
  }

  // Get generation history
  getHistory(limit = 10) {
    return this.generationHistory.slice(0, limit);
  }

  // Clear history
  clearHistory() {
    this.generationHistory = [];
    this.emit('historyCleared');
  }

  // Get password statistics
  getStats() {
    const history = this.generationHistory;
    if (history.length === 0) {
      return {
        totalGenerated: 0,
        averageStrength: 0,
        averageEntropy: 0,
        mostCommonLength: 0
      };
    }

    const strengths = history.map(h => h.strength);
    const entropies = history.map(h => this.calculateEntropy(h.password));
    const lengths = history.map(h => h.password.length);

    return {
      totalGenerated: history.length,
      averageStrength: strengths.reduce((a, b) => a + b, 0) / strengths.length,
      averageEntropy: entropies.reduce((a, b) => a + b, 0) / entropies.length,
      mostCommonLength: this.getMostCommon(lengths),
      strongestPassword: history.reduce((max, h) => h.strength > max.strength ? h : max),
      weakestPassword: history.reduce((min, h) => h.strength < min.strength ? h : min)
    };
  }

  // Get most common value in array
  getMostCommon(arr) {
    const counts = {};
    arr.forEach(val => counts[val] = (counts[val] || 0) + 1);
    return parseInt(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
  }

  // Check if system is active
  isActive() {
    return this.isActive;
  }
}

module.exports = new PasswordGenerator();
