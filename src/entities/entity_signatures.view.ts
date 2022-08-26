import {ViewEntity, Column, Connection, PrimaryColumn} from 'typeorm';
import {SignatureEntity} from './signature_entitity.model';
import {Signature} from './signature.model';
import {Entity as LBEntity, model} from '@loopback/repository';

@ViewEntity({
  name: 'entity_signatures',
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('signature.uuid', 'id')
      .addSelect('signature.library', 'library')
      .addSelect('signature.meta', 'meta')
      .addSelect('signature_entity.entity', 'entity')
      .addSelect('signature_entity.direction', 'direction')
      .addSelect('signature_entity.score', 'score')
      .from(Signature, 'signature')
      .where(
        "signature_entity.top_signatures = 'true' OR signature_entity.direction = '-'",
      )
      .innerJoin(
        SignatureEntity,
        'signature_entity',
        'signature_entity.signature = signature.uuid',
      ),
})
@model({
  name: 'Entity Signatures',
  description: 'A view for getting the signature of an entity',
  settings: {
    strict: false,
  },
})
export class EntitySignatures extends LBEntity {
  @PrimaryColumn({
    name: 'id',
    type: 'uuid',
  })
  id: string;

  @Column({
    name: 'library',
    type: 'uuid',
  })
  library: string;

  @Column({
    type: 'jsonb',
  })
  meta: {
    [key: string]: any;
  };

  @Column({
    name: 'entity',
    type: 'uuid',
  })
  entity: string;

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
