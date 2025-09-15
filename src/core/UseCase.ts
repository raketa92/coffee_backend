import { Either } from "./Either";

export interface UseCase<IRequest, IResponse> {
  execute: (request: IRequest) => Promise<IResponse>;
}

export interface UseCaseEither<I, O, E = any> {
  execute(request: I): Promise<Either<E, O>>;
}
