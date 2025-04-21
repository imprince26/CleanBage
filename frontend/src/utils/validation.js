// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Password validation (min 8 chars, at least 1 letter and 1 number)
  export const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };
  
  // Phone number validation
  export const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  };
  
  // Name validation (letters, spaces, hyphens, apostrophes)
  export const isValidName = (name) => {
    const nameRegex = /^[A-Za-z\s'-]+$/;
    return nameRegex.test(name);
  };
  
  // URL validation
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Postal code validation
  export const isValidPostalCode = (postalCode) => {
    const postalCodeRegex = /^[0-9]{6}$/;
    return postalCodeRegex.test(postalCode);
  };
  
  // Form validation helper
  export const validateForm = (formData, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const value = formData[field];
      const fieldRules = rules[field];
      
      // Required check
      if (fieldRules.required && (!value || value.trim() === '')) {
        errors[field] = `${fieldRules.label || field} is required`;
        return;
      }
      
      // Skip other validations if field is empty and not required
      if (!value && !fieldRules.required) return;
      
      // Minimum length check
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
        return;
      }
      
      // Maximum length check
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `${fieldRules.label || field} must be less than ${fieldRules.maxLength} characters`;
        return;
      }
      
      // Pattern check
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.message || `${fieldRules.label || field} is invalid`;
        return;
      }
      
      // Custom validation
      if (fieldRules.validate && typeof fieldRules.validate === 'function') {
        const customError = fieldRules.validate(value, formData);
        if (customError) {
          errors[field] = customError;
          return;
        }
      }
      
      // Email validation
      if (fieldRules.email && !isValidEmail(value)) {
        errors[field] = `Please enter a valid email address`;
        return;
      }
      
      // Password validation
      if (fieldRules.password && !isValidPassword(value)) {
        errors[field] = `Password must be at least 8 characters and contain at least one letter and one number`;
        return;
      }
      
      // Phone validation
      if (fieldRules.phone && !isValidPhone(value)) {
        errors[field] = `Please enter a valid phone number`;
        return;
      }
      
      // Match field validation
      if (fieldRules.match && value !== formData[fieldRules.match]) {
        errors[field] = fieldRules.matchMessage || `${fieldRules.label || field} does not match`;
        return;
      }
    });
    
    return errors;
  };