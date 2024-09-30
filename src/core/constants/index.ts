export enum OrderStatus {
  pending = "pending",
  completed = "completed",
  canceled = "canceled",
  waitingClientApproval = "waitingClientApproval",
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
