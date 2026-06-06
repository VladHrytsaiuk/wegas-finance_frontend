import React, { useState, ReactNode } from "react";
import styled, { css } from "styled-components";
import { createPortal } from "react-dom";

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const TooltipContent = styled.div<{ $position: string }>`
  position: fixed;
  background-color: var(--color-bg-inverse, #333);
  color: var(--color-text-inverse, #fff);
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: pre-wrap;
  max-width: 250px;
  z-index: 10000;
  box-shadow: var(--shadow-lg);
  pointer-events: none;
  text-align: center;
  line-height: 1.4;

  &::after {
    content: "";
    position: absolute;
    border: 6px solid transparent;
  }

  ${(p) =>
    p.$position === "top" &&
    css`
      &::after {
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-top-color: var(--color-bg-inverse, #333);
      }
    `}

  ${(p) =>
    p.$position === "bottom" &&
    css`
      &::after {
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-bottom-color: var(--color-bg-inverse, #333);
      }
    `}
`;

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

export const Tooltip = ({
  content,
  children,
  position = "top",
  disabled = false,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled || !content) return;
    const rect = e.currentTarget.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    if (position === "top") {
      top = rect.top - 10;
      left = rect.left + rect.width / 2;
    } else {
      top = rect.bottom + 10;
      left = rect.left + rect.width / 2;
    }

    setTooltipCoords({ top, left });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <TooltipWrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible &&
        createPortal(
          <TooltipContent
            $position={position}
            style={{
              top: tooltipCoords.top,
              left: tooltipCoords.left,
              transform: position === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
            }}
          >
            {content}
          </TooltipContent>,
          document.body
        )}
    </TooltipWrapper>
  );
};
