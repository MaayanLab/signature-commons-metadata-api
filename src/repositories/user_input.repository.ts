import {UserInput} from '../entities';
import {TypeORMDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {TypeORMRepository} from './typeorm-repository';

export class UserInputRepository extends TypeORMRepository<
  UserInput,
  typeof UserInput.prototype.id
> {
  dataSource: TypeORMDataSource;

  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(UserInput, dataSource);
  }
}
