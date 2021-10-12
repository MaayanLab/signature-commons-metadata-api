import {SignatureEntity} from '../entities';
import {TypeORMDataSource} from '../datasources';
import {inject} from '@loopback/core';
import {TypeORMRepository} from './typeorm-repository';

export class SignatureEntityRepository extends TypeORMRepository<
  SignatureEntity,
  typeof SignatureEntity.prototype.signature.id
> {
  dataSource: TypeORMDataSource;
  _select: string;
  relation: string;
  inverseTable: string;

  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(SignatureEntity, dataSource);
  }
}
