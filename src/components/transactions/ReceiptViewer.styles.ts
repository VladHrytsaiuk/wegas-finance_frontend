import styled from "styled-components";

export const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  z-index: 10;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

export const ToolGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export const ToolBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const ImageArea = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  position: relative;
  height: 100%;

  &:active {
    cursor: grabbing;
  }
`;

export const StyledImage = styled.img<{
  $scale: number;
  $x: number;
  $y: number;
}>`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.1s linear;
  transform: translate(${(props) => props.$x}px, ${(props) => props.$y}px)
    scale(${(props) => props.$scale});
  user-select: none;
`;

export const NavBtn = styled.button<{ $pos: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${(p) => p.$pos}: 10px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const Counter = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  z-index: 20;
`;
