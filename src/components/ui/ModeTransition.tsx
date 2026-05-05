import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  HiOutlineBanknotes,
  HiOutlinePresentationChartLine,
} from "react-icons/hi2";

// Максимальний Z-index, щоб перекрити все
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-brand-700);
  z-index: 2147483647; /* Максимальне число в CSS */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  pointer-events: all; /* Блокуємо кліки під час анімації */
`;

const Title = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled(motion.div)`
  font-size: 4rem;
  color: var(--color-brand-200);
`;

interface ModeTransitionProps {
  isNavigating: boolean;
  targetMode: string;
}

// Крива для "ефекту шторки"
const easePremium = [0.6, 0.01, -0.05, 0.9];

export function ModeTransition({
  isNavigating,
  targetMode,
}: ModeTransitionProps) {
  const { t } = useTranslation();
  const isFinance = targetMode === "finance";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Якщо DOM ще не готовий (рідкісний кейс), повертаємо null
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isNavigating && (
        <Overlay
          key="overlay" // 👈 ОБОВ'ЯЗКОВО для AnimatePresence
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: easePremium }}
        >
          <IconWrapper
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {isFinance ? (
              <HiOutlineBanknotes />
            ) : (
              <HiOutlinePresentationChartLine />
            )}
          </IconWrapper>

          <Title
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {isFinance ? t("navigation:workspaces.finance") : t("navigation:workspaces.investments")}
          </Title>
        </Overlay>
      )}
    </AnimatePresence>,
    document.body,
  );
}
