// infra-error.ts
export enum InfraErrorCode {
  // Generic infra
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  UNAVAILABLE = 'UNAVAILABLE',          // service or dependency down
  BAD_REQUEST = 'BAD_REQUEST',          // invalid request to dependency
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN = 'UNKNOWN',

  // DB-specific
  DUPLICATE_KEY = 'DUPLICATE_KEY',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  SERIALIZATION_CONFLICT = 'SERIALIZATION_CONFLICT',
  DEADLOCK = 'DEADLOCK',

  // HTTP upstream-specific (optional granularity)
  UPSTREAM_4XX = 'UPSTREAM_4XX',
  UPSTREAM_5XX = 'UPSTREAM_5XX',
}

export type InfraSource = 'DB' | 'HTTP' | 'KAFKA' | 'CACHE' | 'QUEUE' | 'FILE' | 'UNKNOWN';

export class InfraError extends Error {
  readonly code: InfraErrorCode;
  readonly source: InfraSource;
  readonly retriable: boolean;
  readonly cause?: unknown;
  readonly meta?: Record<string, unknown>;

  constructor(params: {
    code: InfraErrorCode;
    message: string;
    source?: InfraSource;
    retriable?: boolean;
    cause?: unknown;
    meta?: Record<string, unknown>;
  }) {
    super(params.message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'InfraError';
    this.code = params.code;
    this.source = params.source ?? 'UNKNOWN';
    this.retriable = Boolean(params.retriable);
    this.cause = params.cause;
    this.meta = params.meta;
  }
}
