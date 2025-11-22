
export interface LoanParams {
  amount: number;
  months: number;
  rate: number;
  type: 'equal' | 'decreasing';
}

export interface LoanResult {
  monthlyPayment: number; // For equal installments
  totalInterest: number;
  totalCost: number;
  schedule: AmortizationRow[];
}

export interface AmortizationRow {
  month: number;
  interest: number;
  principal: number;
  balance: number;
  payment: number;
}

export enum InstallmentType {
  EQUAL = 'equal',
  DECREASING = 'decreasing'
}

export interface LoanReportData {
  asOf: string;
  wibor3m: number;
  currentInstallment: number;
  newInstallment: number;
  installmentDiff: number;
  initialLoan: number;
  remainingLoan: number;
  capitalPaid: number;
  capitalPaidPct: number;
  monthsRemaining: number;
  installmentParts: {
    interest: number;
    principal: number;
  };
  history: [string, number, number][]; // [date, value, delta]
  fraProjections: [string, number, number, string, number, number][]; // [label, installment, change, code, rate, rate+margin]
}
