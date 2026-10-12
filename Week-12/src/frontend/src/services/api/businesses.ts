import type { BusinessProfile } from "@/types";
import { apiRequest } from "./client";

export function getBusinessProfile(): Promise<BusinessProfile | null> {
  return apiRequest<BusinessProfile | null>("/api/businesses/profile");
}

export function saveBusinessProfile(
  profile: BusinessProfile,
): Promise<BusinessProfile> {
  return apiRequest<BusinessProfile>("/api/businesses/profile", {
    method: "PUT",
    body: profile,
  });
}
