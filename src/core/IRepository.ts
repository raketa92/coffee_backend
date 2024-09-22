export interface IRepository<T> {
  findAll: () => Promise<T[]>;
  findByGuid: (guid: string) => Promise<T | null>;
  isExists: (guid: string) => Promise<boolean>;
  save: (entity: T, where: any) => Promise<void>;
  delete: (where: any) => Promise<void>;
}
