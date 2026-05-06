export const API_BASE = process.env.EXPO_PUBLIC_API_BASE!;

if (!API_BASE) {
  throw new Error("EXPO_PUBLIC_API_BASE is not set");
}