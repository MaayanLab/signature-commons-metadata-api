import {ViewEntity, Column, Connection, PrimaryColumn} from 'typeorm';
import {SignatureEntity} from './signature_entitity.model';
import {Entity} from './entity.model';
import {Entity as LBEntity, model} from '@loopback/repository';

@ViewEntity({
  name: 'signature_entities',
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('entity.uuid', 'id')
      .addSelect('entity.meta', 'meta')
      .addSelect('signature_entity.signature', 'signature')
      .addSelect('signature_entity.direction', 'direction')
      .addSelect('signature_entity.score', 'score')
      .from(Entity, 'entity')
      .where("signature_entity.top_entities = 't' OR signature_entity.direction = '-'")
      .innerJoin(
        SignatureEntity,
        'signature_entity',
        'signature_entity.entity = entity.uuid',
      ),
})
@model({
  name: 'Signature Entities',
  description: 'A view for getting the entities of a signature',
  settings: {
    strict: false,
  },
})
export class SignatureEntities extends LBEntity {
  @PrimaryColumn({
    name: 'id',
    type: 'uuid',
  })
  id: string;

  @Column({
    type: 'jsonb',
  })
  meta: {
    [key: string]: any;
  };

  @PrimaryColumn({
    name: 'signature',
    type: 'uuid',
  })
  signature: string;

  @Column({
    name: 'direction',
    type: 'varchar',
  })
  direction: string;

  @Column({
    type: 'float',
    default: 0,
  })
  score: number;
}
