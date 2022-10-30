import React, { FunctionComponent, ReactNode } from "react";
import styles from "../../styles/button.module.css";

type ButtonProps = {
  onClick: () => void;
  children: string | ReactNode;
  size?: string;
  id?: string,
  disabled?: boolean
};

const Button: FunctionComponent<ButtonProps> = ({
  children,
  size = "large",
  onClick,
  id,
  disabled
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={(size === "small" ? styles.buttonSmall : styles.buttonLarge) + " " + (disabled ? styles.buttonDisabled : " ")}
    >
      {children}
    </button>
  );
};

export default Button;
