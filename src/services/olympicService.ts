import { Olympic } from '../types/olympic';

export const fetchOlympics = async (): Promise<Olympic[]> => {
  const response = await fetch('/mock/olympic.json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const olympicLoader = async (): Promise<Olympic[]> => {
  return fetchOlympics();
};
