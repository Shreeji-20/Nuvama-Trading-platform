import config from "../../config/api";
import { Strategy } from "../../types/deployedStrategies.types";
import { StrategyTag } from "../../types/strategy.types";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Fetch all deployed strategies from the backend
 */
export const fetchStrategies = async (
  setStrategies: (strategies: Strategy[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setLoading(true);
    setError(null);
    const response = await fetch(`${API_BASE_URL}/strategy/list`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setStrategies(data.strategies || []);
  } catch (err: any) {
    console.error("Error fetching strategies:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

/**
 * Fetch available strategy tags from the backend
 */
export const fetchStrategyTags = async (
  setAvailableTags: (tags: StrategyTag[]) => void,
  setLoadingTags: (loading: boolean) => void
) => {
  try {
    setLoadingTags(true);
    const response = await fetch(`${API_BASE_URL}/strategy-tags/list`);
    if (response.ok) {
      const tags = await response.json();
      setAvailableTags(tags);
    } else {
      console.error("Failed to fetch strategy tags");
    }
  } catch (error) {
    console.error("Error fetching strategy tags:", error);
  } finally {
    setLoadingTags(false);
  }
};

/**
 * Fetch option data from the backend
 */
export const fetchOptionData = async (
  setOptionDataCache: (data: any[]) => void,
  setLastOptionDataFetch: (date: Date) => void
) => {
  try {
    const response = await fetch(config.buildUrl(config.ENDPOINTS.OPTIONDATA));

    if (!response.ok) {
      console.warn("Failed to fetch option data");
      return;
    }

    const data = await response.json();
    setOptionDataCache(data || []);
    setLastOptionDataFetch(new Date());
  } catch (err) {
    console.error("Error fetching option data:", err);
  }
};
