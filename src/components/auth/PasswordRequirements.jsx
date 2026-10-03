import { useTranslation } from "react-i18next";
import { validatePassword, getPasswordStrength } from "../../utils/passwordValidator";

export default function PasswordRequirements({ password = "", alwaysVisible = false }) {
  const { t } = useTranslation();
  const validation = validatePassword(password);
  const strength = getPasswordStrength(validation);

  // If no password entered and not set to alwaysVisible, we can keep it compact or subtle
  const isTyping = password.length > 0;
  if (!alwaysVisible && !isTyping) {
    return null;
  }

  const items = [
    {
      id: "minLength",
      label: t("auth.passwordRequirements.minLength"),
      valid: validation.minLength,
    },
    {
      id: "uppercase",
      label: t("auth.passwordRequirements.uppercase"),
      valid: validation.hasUpperCase,
    },
    {
      id: "number",
      label: t("auth.passwordRequirements.number"),
      valid: validation.hasNumber,
    },
    {
      id: "specialChar",
      label: t("auth.passwordRequirements.specialChar"),
      valid: validation.hasSpecialChar,
    },
  ];

  return (
    <div className="mt-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 text-xs transition-all duration-300">
      {/* Strength indicator bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            {t("auth.passwordRequirements.strength")}
          </span>
          {strength.key !== "none" && (
            <span className={`font-semibold ${strength.textColor}`}>
              {t(`auth.passwordRequirements.${strength.key}`)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((step) => {
            const isFilled = validation.passedCount >= step;
            let barColor = "bg-gray-200 dark:bg-gray-700";
            if (isFilled) {
              if (validation.passedCount === 1) barColor = "bg-red-500";
              else if (validation.passedCount === 2) barColor = "bg-amber-500";
              else if (validation.passedCount === 3) barColor = "bg-blue-500";
              else barColor = "bg-emerald-500";
            }
            return (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${barColor}`}
              />
            );
          })}
        </div>
      </div>

      {/* Criteria checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              item.valid
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {item.valid ? (
              <svg
                className="w-4 h-4 shrink-0 text-emerald-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="w-3.5 h-3.5 mx-0.5 rounded-full border border-gray-300 dark:border-gray-600 shrink-0 inline-block" />
            )}
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
