import { Either, fold } from "@/core/Either";

export async function expectRight<L, R>(
  e: Either<L, R>,
  asserter: (r: R) => void
) {
  return fold(
    e,
    (l) => {
      throw new Error(`Expected Right, got Left: ${JSON.stringify(l)}`);
    },
    asserter
  );
}

export async function expectLeft<L, R>(
  e: Either<L, R>,
  asserter: (l: L) => void
) {
  return fold(e, asserter, (r) => {
    throw new Error(`Expected Left, got Right: ${JSON.stringify(r)}`);
  });
}
