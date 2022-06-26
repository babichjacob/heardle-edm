const { prefersDark, prefersLight } = require("tailwindcss-theme-variants");

module.exports = {
  colors: {
    baseSelector: "[data-theme]",
    themes: {
      sky: {
        selector: "[data-theme=sky]",
        semantics: {
          colors: {
            "light-accent-strong": "sky.700",
            "light-accent": "sky.500",
            "light-accent-faint": "sky.100",

            "light-accent-lighter": "sky.400",
            "light-accent-darker": "sky.600",

            "light-accent-faint-darker": "sky.200",

            "light-multiply": "slate.900",
            "light-multiply-weak": "blue.900",

            "dark-accent-strong": "sky.100",
            "dark-accent": "sky.500",
            "dark-accent-faint": "blue.800",

            "dark-accent-lighter": "sky.400",
            "dark-accent-darker": "sky.600",

            "dark-accent-faint-darker": "black",

            "dark-multiply": "white",
            "dark-multiply-weak": "sky.50",
          },
        },
      },
    },
  },

  light_dark: {
    baseSelector: "[data-theme]",
    themes: {
      light: {
        mediaQuery: prefersLight,
        semantics: {
          colors: {
            primary: "white",
            "primary-weak": "slate.100",
            "primary-weaker": "slate.200",
            "primary-faint": "slate.300",

            "primary-faint-lighter": "slate.200",
            "primary-faint-darker": "slate.400",

            "on-primary": "slate.900",
            "on-primary-weak": "slate.700",
            "on-primary-faint": "slate.400",

            "accent-strong": "light-accent-strong",
            accent: "light-accent",
            "accent-faint": "light-accent-faint",

            "accent-lighter": "light-accent-lighter",
            "accent-darker": "light-accent-darker",

            "accent-faint-darker": "light-accent-faint-darker",

            "on-accent": "white",

            multiply: "light-multiply",
            "multiply-weak": "light-multiply-weak",

            error: "red.500",

            "on-error": "white",

            good: "emerald.500",

            "on-good": "white",

            warning: "amber.500",

            "on-warning": "white",
          },
        },
      },
      dark: {
        mediaQuery: prefersDark,
        semantics: {
          colors: {
            primary: "gray.900",
            "primary-weak": "gray.800",
            "primary-weaker": "gray.700",
            "primary-faint": "gray.500",

            "primary-faint-lighter": "gray.400",
            "primary-faint-darker": "gray.600",

            "on-primary": "white",
            "on-primary-weak": "gray.200",
            "on-primary-faint": "gray.400",

            "accent-strong": "dark-accent-strong",
            accent: "dark-accent",
            "accent-faint": "dark-accent-faint",

            "accent-lighter": "dark-accent-lighter",
            "accent-darker": "dark-accent-darker",

            "accent-faint-darker": "dark-accent-faint-darker",

            "on-accent": "white",

            multiply: "dark-multiply",
            "multiply-weak": "dark-multiply-weak",

            error: "red.500",

            "on-error": "white",

            good: "green.500",

            "on-good": "white",

            warning: "amber.500",

            "on-warning": "white",
          },
        },
      },
    },
  },
};
