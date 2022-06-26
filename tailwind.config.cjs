const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");
const { themeVariants } = require("tailwindcss-theme-variants");
const {
  colorToRgb,
  rgbToThemeValue,
} = require("tailwindcss-theme-variants/theme-and-variable-converters");

const { colors, light_dark } = require("./theme-styles.cjs");

const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Lexend", ...defaultTheme.fontFamily.sans],
      },
    },
  },

  plugins: [
    themeVariants({
      ...colors,
      utilities: {
        colors: {
          themeValueToVariableValue: colorToRgb,
          variableValueToThemeValue: rgbToThemeValue,
        },
      },
    }),

    themeVariants({
      ...light_dark,
      fallback: true,
      utilities: {
        colors: {
          themeValueToVariableValue: colorToRgb,
          variableValueToThemeValue: rgbToThemeValue,
        },
      },
    }),

    themeVariants({
      themes: {
        "no-supports-backdrop-filter": {
          mediaQuery: "@supports not (backdrop-filter: blur(1px))",
        },
        "supports-backdrop-filter": {
          mediaQuery: "@supports (backdrop-filter: blur(1px))",
        },
      },
      fallback: true,
    }),

    plugin(({ addUtilities }) => {
      addUtilities({
        ".font-sans": {
          fontFeatureSettings: "'ss04', 'cv01', 'cv02', 'cv03', 'cv04', 'cv11'",
        },
      });
    }),
  ],
};

module.exports = config;
