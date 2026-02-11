import type { ButtonHTMLAttributes } from "react";

export function Button8bit({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="btn-8bit" {...props}>
      {children}
    </button>
  );
}
