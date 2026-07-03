const ANON_SCAN_USED_KEY = "fpsscan_anon_scan_used";

export function hasUsedAnonScan(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ANON_SCAN_USED_KEY) === "1";
}

export function markAnonScanUsed(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ANON_SCAN_USED_KEY, "1");
}
