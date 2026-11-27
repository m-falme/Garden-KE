const DEPOSIT_PERCENT = 30;

export function calculateDepositKes(totalKes: number): number {
  return Math.ceil((totalKes * DEPOSIT_PERCENT) / 10_000) * 100;
}