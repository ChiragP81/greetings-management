module.exports = {
  prefix: '',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'base': '"Manrope", sans-serif'
      },
      boxShadow: {
        '2sm': '0px 3px 4px rgb(227 227 227 / 29%)',
      },
      colors: {
        primary: "#D0006F",
        'primary-light': "#E4EBF5",
        secondary: "#3B3551",
        "black-light": "#606060",
        "black-dark": "#0E0E11",
        "grey-light": "#A0A0A0",
        "grey-50": "#EBEBEB",
        "blue-50": "#6F7F95",
        "grey-100": "rgba(198, 198, 198, 0.13);",
        "grey-500": "#6B6B6B",
        green: "#90D272",
        'green-light': "rgba(144, 210, 114, 0.13)",
        red: "#EB6A6A",
        'red-light': "rgba(235, 106, 106, 0.08)",
        'main': "#FAFAFA"
      },
      screens: {
        '2md': '960px',
        'xs': '480px',
      },
      borderRadius: {
        '5': '5px',
        '10': '10px',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
