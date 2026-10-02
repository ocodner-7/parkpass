export type OnboardingStep = 'choice' | 'household-setup';
export type StartTimeMode = 'now' | 'scheduled';
export type CouncilRow = {
  id: string;
  name: string;
  available_durations: number[];
  hours_roll_over: boolean;
  max_hours_per_pass: number;
  monthly_quota_hours: number;
  operating_hours_start: number;
  operating_hours_end: number;
  price_per_hour: number;
  requires_vehicle_reg: boolean;
};