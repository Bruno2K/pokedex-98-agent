"use client";

import { useState } from "react";
import { useDragWindow } from "@/hooks/useDragWindow";

type CalendarWindowProps = {
  onClose: () => void;
  zIndex?: number;
  isMinimized?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
};

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarWindow({ onClose, zIndex = 100, isMinimized = false, onFocus, onMinimize }: CalendarWindowProps) {
  const { position, elementRef, startDrag } = useDragWindow({
    initialPosition: null,
  });

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    startDrag(e);
    onFocus?.();
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const newDate = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentDate(newDate);
    setSelectedDate(new Date(today));
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  };

  const isToday = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [];

  // Preencher dias vazios no início
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Preencher dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Preencher dias vazios no final para sempre ter 42 células (6 semanas)
  const totalCells = 42;
  while (days.length < totalCells) {
    days.push(null);
  }

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
      className="calendar-window"
      style={style}
      role="dialog"
      aria-label="Calendário"
      onClick={onFocus}
    >
      <div
        className="win98-title-bar calendar-title-bar win98-title-bar-draggable"
        onPointerDown={handleTitlePointerDown}
        role="presentation"
      >
        <span className="win98-title-bar-text">Calendário</span>
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
      <div className="calendar-body">
        <div className="calendar-header">
          <button type="button" className="calendar-nav-btn" onClick={goToPreviousMonth} aria-label="Mês anterior">
            ‹
          </button>
          <div className="calendar-month-year">
            <span className="calendar-month">{MONTHS[currentDate.getMonth()]}</span>
            <span className="calendar-year">{currentDate.getFullYear()}</span>
          </div>
          <button type="button" className="calendar-nav-btn" onClick={goToNextMonth} aria-label="Próximo mês">
            ›
          </button>
        </div>
        <div className="calendar-weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="calendar-day calendar-day-empty" />;
            }
            return (
              <button
                key={day}
                type="button"
                className={`calendar-day ${isToday(day) ? "calendar-day-today" : ""} ${
                  isSelected(day) ? "calendar-day-selected" : ""
                }`}
                onClick={() => handleDayClick(day)}
                aria-label={`${day} de ${MONTHS[currentDate.getMonth()]} de ${currentDate.getFullYear()}`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="calendar-footer">
          <button type="button" className="btn-8bit calendar-today-btn" onClick={goToToday}>
            Hoje
          </button>
          {selectedDate && (
            <div className="calendar-selected-info">
              Selecionado: {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
