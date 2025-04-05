export enum OrderStatus {
  pending = "pending",
  waitingClientApproval = "waitingClientApproval",
  inProgress = "inProgress",
  onDelivery = "onDelivery",
  completed = "completed",
  canceled = "canceled",
  rejected = "rejected",
}

export enum PaymentStatus {
  waitingClientApproval = "waitingClientApproval",
  paid = "paid",
  canceled = "canceled",
  rejected = "rejected",
}

export enum PaymentMethods {
  cash = "cash",
  card = "card",
  terminal = "terminal",
}

export enum PaytmentFor {
  product = "product",
}

export enum CardProvider {
  halkBank = "halkBank",
  rysgalBank = "rysgalBank",
  dasaryYkdysadyBank = "dasaryYkdysadyBank",
  senagatBank = "senagatBank",
}

export enum Stages {
  test = "test",
  dev = "dev",
  prod = "prod",
}

export const ResponseMessages = {
  success: "success",
  userDeleteSuccess: "User successfully deleted",
  userDeleteFail: "User not deleted, DB exception",
};

export enum AppEvents {
  otpRequested = "otpRequested",
  changePhoneOtpRequested = "changePhoneOtpRequested",
}

export enum OtpPurpose {
  userRegister = "userRegister",
  userChangePassword = "userChangePassword",
  userChangePhone = "userChangePhone",
}
