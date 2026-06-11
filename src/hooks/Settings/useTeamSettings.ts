import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../services/Axios";
import { useUserRole } from "../useUserRole";
import { useWebSocketAuth } from "../useWebSocketAuth";
import { getMeApi } from "../../services/apiUsers";

export function useTeamSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { canManageTeam } = useUserRole();

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Handle WebSocket events
  const onWebSocketMessage = useCallback((data: any) => {
    if (data.type === "member_joined") {
      toast.success(t("settings:usersPage.alert_member_joined", "Новий учасник приєднався!"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Clear invite code if someone joined
      setInviteCode(null);
      setTimeLeft(0);
    }
  }, [t, queryClient]);

  useWebSocketAuth(onWebSocketMessage);

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setInviteCode(null);
    }
  }, [timeLeft]);

  const generateInviteCode = async () => {
    try {
      setIsGenerating(true);
      // We need family_id. We can get it from 'me' query or call getMeApi directly if not available.
      const user = await getMeApi();
      const familyId = user.family_id;

      if (!familyId) {
        toast.error(t("settings:usersPage.error_no_family", "Сім'я не знайдена"));
        return;
      }

      const response = await api.post(`/families/${familyId}/generate-code`);
      setInviteCode(response.data.code);
      setTimeLeft(120); // 2 minutes
      toast.success(t("settings:usersPage.alert_code_generated", "Код згенеровано"));
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("settings:usersPage.error_generating_code", "Помилка генерації коду"));
    } finally {
      setIsGenerating(false);
    }
  };

  const joinFamily = async () => {
    if (joinCodeInput.length !== 6) {
      toast.error(t("settings:usersPage.error_invalid_code_format", "Код має містити 6 цифр"));
      return;
    }

    try {
      setIsJoining(true);
      await api.post("/families/join", { code: joinCodeInput });
      toast.success(t("settings:usersPage.alert_join_success", "Ви успішно приєдналися до сім'ї!"));
      setJoinCodeInput("");
      
      // Refresh user data and team list
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("settings:usersPage.error_joining_family", "Помилка приєднання"));
    } finally {
      setIsJoining(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    state: {
      inviteCode,
      joinCodeInput,
      timeLeft,
      formattedTime: formatTime(timeLeft),
      isGenerating,
      isJoining,
      canManageTeam,
    },
    actions: {
      setJoinCodeInput,
      generateInviteCode,
      joinFamily,
    },
    t,
  };
}
