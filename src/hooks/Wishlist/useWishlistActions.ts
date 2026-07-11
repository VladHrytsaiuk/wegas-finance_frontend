import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMeApi, getFamilyMembers } from "../../services/apiUsers";

export const useWishlistPrivacy = (
  initialVisibility = "public",
  initialHidden = "",
) => {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [hiddenFrom, setHiddenFrom] = useState<string[]>(
    initialHidden ? initialHidden.split(",") : [],
  );

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMeApi });
  const { data: family } = useQuery({
    queryKey: ["familyMembers"],
    queryFn: getFamilyMembers,
  });

  // Фільтруємо сім'ю, щоб не було МЕНЕ
  const membersToHideFrom = family?.filter((m) => m.id !== me?.id) || [];

  const toggleUserHidden = (userId: string) => {
    setHiddenFrom((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return {
    visibility,
    setVisibility,
    hiddenFrom, // масив ID
    hiddenFromStr: hiddenFrom.join(","), // стрічка для API
    membersToHideFrom,
    toggleUserHidden,
    me,
  };
};
