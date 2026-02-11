"use client";

import { useState } from "react";
import { useDragWindow } from "@/hooks/useDragWindow";

type CalculatorWindowProps = {
  onClose: () => void;
  zIndex?: number;
  isMinimized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
};

export function CalculatorWindow({ onClose, zIndex = 100, isMinimized = false, onFocus, onMinimize }: CalculatorWindowProps) {
  const { position, elementRef, startDrag } = useDragWindow({
    initialPosition: null,
  });

  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
  };

  const handleNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(op);
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case "+":
        return prev + current;
      case "-":
        return prev - current;
      case "*":
        return prev * current;
      case "/":
        return prev / current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const style = {
    zIndex,
    ...(position
      ? {
          left: position.x,
          top: position.y,
          transform: "none" as const,
        }
      : {}),
    ...(isMinimized ? { visibility: "hidden" as const, pointerEvents: "none" as const } : {}),
  };

  return (
    <div
      ref={elementRef}
      className="calculator-window"
      style={style}
      role="dialog"
      aria-label="Calculadora"
      onClick={onFocus}
    >
      <div
        className="win98-title-bar calculator-title-bar win98-title-bar-draggable"
        onPointerDown={handleTitlePointerDown}
        role="presentation"
      >
        <span className="win98-title-bar-text">Calculadora</span>
        <div className="win98-title-buttons">
          <button
            type="button"
            className="win98-title-btn"
            aria-label="Minimizar"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
          >
            −
          </button>
          <button type="button" className="win98-title-btn" aria-label="Maximizar">□</button>
          <button
            type="button"
            className="win98-title-btn win98-title-btn-close"
            aria-label="Fechar"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div className="calculator-body">
        <div className="calculator-display">
          <input
            type="text"
            readOnly
            value={display}
            className="calculator-display-input"
            aria-label="Display da calculadora"
          />
        </div>
        <div className="calculator-buttons">
          <button type="button" className="calculator-btn calculator-btn-clear" onClick={handleClear}>
            C
          </button>
          <button type="button" className="calculator-btn calculator-btn-op" onClick={() => handleOperation("/")}>
            ÷
          </button>
          <button type="button" className="calculator-btn calculator-btn-op" onClick={() => handleOperation("*")}>
            ×
          </button>
          <button type="button" className="calculator-btn calculator-btn-op" onClick={() => handleOperation("-")}>
            −
          </button>

          <button type="button" className="calculator-btn" onClick={() => handleNumber("7")}>
            7
          </button>
          <button type="button" className="calculator-btn" onClick={() => handleNumber("8")}>
            8
          </button>
          <button type="button" className="calculator-btn" onClick={() => handleNumber("9")}>
            9
          </button>
          <button type="button" className="calculator-btn calculator-btn-op calculator-btn-plus" onClick={() => handleOperation("+")}>
            +
          </button>

          <button type="button" className="calculator-btn" onClick={() => handleNumber("4")}>
            4
          </button>
          <button type="button" className="calculator-btn" onClick={() => handleNumber("5")}>
            5
          </button>
          <button type="button" className="calculator-btn" onClick={() => handleNumber("6")}>
            6
          </button>
          <button type="button" className="calculator-btn calculator-btn-equals calculator-btn-equals-tall" onClick={handleEquals}>
            =
          </button>

          <button type="button" className="calculator-btn" onClick={() => handleNumber("1")}>
            1
          </button>
          <button type="button" className="calculator-btn" onClick={() => handleNumber("2")}>
            2
          </button>
          <button type="button" className="calculator-btn" onClick={() => handleNumber("3")}>
            3
          </button>

          <button type="button" className="calculator-btn calculator-btn-zero" onClick={() => handleNumber("0")}>
            0
          </button>
          <button type="button" className="calculator-btn" onClick={handleDecimal}>
            .
          </button>
        </div>
      </div>
    </div>
  );
}
