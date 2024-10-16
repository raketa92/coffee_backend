export const DomainErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
} as const;

export type DomainErrorCode =
  (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

export const DomainErrorMessage = {
  total_price_cant_be_negative: "Total price can't be negative",
  card_details_required: "Card details are required for card payments",
  payment_method_must_be_card: "Payment method must be card to set paymentGuid",
};

interface DomainErrorParams {
  info?: { [key: string]: unknown };
  code: DomainErrorCode;
  message: string;
}

export class DomainError extends Error {
  info?: { [key: string]: unknown } | null;
  code: DomainErrorCode;
  message: string;
  constructor(params: DomainErrorParams) {
    super();

    this.code = params.code;
    this.message = params.message;
    this.info = params.info || null;
  }
}
