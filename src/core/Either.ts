// src/core/Either.ts

// —————————————————————————————————————————————————————————
// Core types
// —————————————————————————————————————————————————————————
export class Left<L> {
  readonly _tag = "Left" as const;
  constructor(private readonly inner: L) {}

  /** Pattern-match the value (Dart-like). */
  fold<B>(onLeft: (l: L) => B, _onRight: (r: never) => B): B {
    // touch the arg so eslint doesn't flag it as unused
    void _onRight;
    return onLeft(this.inner);
  }
}

export class Right<R> {
  readonly _tag = "Right" as const;
  constructor(private readonly inner: R) {}

  /** Pattern-match the value (Dart-like). */
  fold<B>(_onLeft: (l: never) => B, onRight: (r: R) => B): B {
    // touch the arg so eslint doesn't flag it as unused
    void _onLeft;
    return onRight(this.inner);
  }
}

export type Either<L, R> = Left<L> | Right<R>;
export type AsyncEither<L, R> = Promise<Either<L, R>>;

// —————————————————————————————————————————————————————————
// Constructors & type guards
// —————————————————————————————————————————————————————————
export const left = <L, R = never>(l: L): Either<L, R> => new Left(l);
export const right = <R, L = never>(r: R): Either<L, R> => new Right(r);

export const isLeft = <L, R>(e: Either<L, R>): e is Left<L> =>
  e._tag === "Left";
export const isRight = <L, R>(e: Either<L, R>): e is Right<R> =>
  e._tag === "Right";

// —————————————————————————————————————————————————————————
// Top-level functional helpers (Dart-like ergonomics)
// —————————————————————————————————————————————————————————
export const fold = <L, A, B>(
  e: Either<L, A>,
  onLeft: (l: L) => B,
  onRight: (a: A) => B
): B => e.fold(onLeft, onRight);

export const map = <L, A, B>(e: Either<L, A>, f: (a: A) => B): Either<L, B> =>
  e.fold<Either<L, B>>(left, (a) => right(f(a)));

export const mapLeft = <L, A, M>(
  e: Either<L, A>,
  f: (l: L) => M
): Either<M, A> => e.fold<Either<M, A>>((l) => left(f(l)), right);

export const flatMap = <L, A, B>(
  e: Either<L, A>,
  f: (a: A) => Either<L, B>
): Either<L, B> => e.fold<Either<L, B>>(left, f);

export const getOrElse = <L, A>(e: Either<L, A>, orElse: (l: L) => A): A =>
  e.fold(orElse, (a) => a);

// Side-effect without changing the Either
export const tap = <L, A>(e: Either<L, A>, f: (a: A) => void): Either<L, A> =>
  e.fold<Either<L, A>>(left, (a) => {
    f(a);
    return e;
  });

// Convert success to Left if predicate fails
export const ensure = <L, A>(
  e: Either<L, A>,
  onFail: (a: A) => L,
  predicate: (a: A) => boolean
): Either<L, A> =>
  e.fold<Either<L, A>>(left, (a) => (predicate(a) ? e : left(onFail(a))));

// Build Either from a predicate on a value
export const fromPredicate = <L, A>(
  a: A,
  onFail: (a: A) => L,
  pred: (a: A) => boolean
): Either<L, A> => (pred(a) ? right(a) : left(onFail(a)));

export const fromNullable = <L, A>(
  a: A | null | undefined,
  onNull: () => L
): Either<L, A> => (a == null ? left(onNull()) : right(a));

// —————————————————————————————————————————————————————————
/** Async helpers (for await/Promise) */
// —————————————————————————————————————————————————————————
export const tryCatch = async <L, A>(
  f: () => Promise<A>,
  onError: (e: unknown) => L
): AsyncEither<L, A> => {
  try {
    const v = await f();
    return right(v);
  } catch (e) {
    return left(onError(e));
  }
};

export const mapA = async <L, A, B>(
  ae: AsyncEither<L, A>,
  f: (a: A) => B | Promise<B>
): AsyncEither<L, B> => {
  const e = await ae;
  return e.fold<AsyncEither<L, B>>(
    async (l) => left(l),
    async (a) => right(await f(a))
  );
};

export const flatMapA = async <L, A, B>(
  ae: AsyncEither<L, A>,
  f: (a: A) => AsyncEither<L, B>
): AsyncEither<L, B> => {
  const e = await ae;
  return e.fold<AsyncEither<L, B>>(
    async (l) => left(l),
    async (a) => await f(a)
  );
};

export const foldA = async <L, A, B>(
  ae: AsyncEither<L, A>,
  onLeft: (l: L) => B | Promise<B>,
  onRight: (a: A) => B | Promise<B>
): Promise<B> => {
  const e = await ae;
  return e.fold(onLeft, onRight);
};
