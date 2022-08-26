import {Counter} from '../entities';
import {TypeORMDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {TypeORMRepository} from './typeorm-repository';

export class CounterRepository extends TypeORMRepository<
  Counter,
  typeof Counter.prototype.id
> {
  dataSource: TypeORMDataSource;

  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(Counter, dataSource);
  }
}
