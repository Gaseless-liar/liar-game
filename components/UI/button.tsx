import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/button.module.css";

type ButtonProps = {
  onClick: () => void;
  children: string | ReactNode;
  size?: string;
};

const Button: FunctionComponent<ButtonProps> = ({
  children,
  size = "large",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={size === "small" ? styles.buttonSmall : styles.buttonLarge}
    >
      {children}
    </button>
  );
};

export default Button;
