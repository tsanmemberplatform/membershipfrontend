export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }
  
  export const validateEmailOrPhone = (input: string): boolean => {
    return validateEmail(input) || validatePhone(input)
  }
  
  export const validatePassword = (
    password: string,
  ): {
    isValid: boolean
    hasMinLength: boolean
    hasUppercaseAndNumber: boolean
  } => {
    const hasMinLength = password.length >= 8
    const hasUppercaseAndNumber = /(?=.*[A-Z])(?=.*\d)/.test(password)
  
    return {
      isValid: hasMinLength && hasUppercaseAndNumber,
      hasMinLength,
      hasUppercaseAndNumber,
    }
  }
  
  export const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword && password.length > 0
  }
  