/**
 * Utility for password validation
 * Criteria:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */

export const validatePassword = (password = "") => {
  const pwd = String(password || "");
  const minLength = pwd.length >= 8;
  const hasUpperCase = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_=+[\]\\/`~;']/.test(pwd) || /[^A-Za-z0-9\s]/.test(pwd);

  const isValid = minLength && hasUpperCase && hasNumber && hasSpecialChar;
  const passedCount = [minLength, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  return {
    isValid,
    minLength,
    hasUpperCase,
    hasNumber,
    hasSpecialChar,
    passedCount,
    totalRequirements: 4,
  };
};

export const getPasswordStrength = (validationResult) => {
  const { passedCount } = validationResult;
  if (passedCount === 0) {
    return { key: "none", color: "bg-gray-200 dark:bg-gray-700", textColor: "text-gray-400", percent: 0 };
  }
  if (passedCount === 1) {
    return { key: "strengthWeak", color: "bg-red-500", textColor: "text-red-500", percent: 25 };
  }
  if (passedCount === 2) {
    return { key: "strengthFair", color: "bg-amber-500", textColor: "text-amber-500", percent: 50 };
  }
  if (passedCount === 3) {
    return { key: "strengthGood", color: "bg-blue-500", textColor: "text-blue-500", percent: 75 };
  }
  return { key: "strengthStrong", color: "bg-emerald-500", textColor: "text-emerald-500", percent: 100 };
};
