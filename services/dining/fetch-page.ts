import "server-only";

import { DINING_CONFIG } from "@/config/dining";

export async function fetchDiningPage(
  url: string,
  errorMessage: string,
): Promise<string> {
  const response = await fetch(url, {
    headers: DINING_CONFIG.requestHeaders,
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.text();
}
