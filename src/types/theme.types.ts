export type Theme = {
  key: string;
  icon: string;
  palette: {
    bg: string;
    text: string;
    textMuted: string;
    accent: string;
    button: {
      bg: string;
      hover: string;
      active: string;
      disabled: string;
      text: string;
      disabledText: string;
    };
  };
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
};
