export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    if (errors !== undefined) this.errors = errors;
  }
}
