export type Purpose =
  | "user_register"
  | "user_change_password"
  | "user_change_phone";

export interface IEvent {
  dateTimeOccurred: Date;
}
