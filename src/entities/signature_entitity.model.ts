import {
  Entity as TypeORMEntity,
  Column,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  Entity,
  Entity as LBEntity,
  model,
  property,
} from '@loopback/repository';
import {getJsonSchema} from '@loopback/rest';
import {Entity as SigcomEntity} from './entity.model';
import {Signature} from './signature.model';

@model({
  name: 'Signatures Entities',
  description: 'Defines the relationship between signatures and entities',
  settings: {
    strict: false,
  },
})
@TypeORMEntity({
  name: 'signatures_entities',
})
export class SignatureEntity extends LBEntity {
  @ManyToOne(
    () => Signature,
    signature => signature.entities,
  )
  @JoinColumn({
    name: 'signature',
    referencedColumnName: 'id',
  })
  @PrimaryColumn({
    name: 'signature',
    type: 'uuid',
  })
  @Index()
  signature: Signature;

  @ManyToOne(
    () => SigcomEntity,
    entities => entities.signatures,
  )
  @JoinColumn({
    name: 'entity',
    referencedColumnName: 'id',
  })
  @PrimaryColumn({
    name: 'entity',
    type: 'uuid',
  })
  @Index()
  entity: Entity;

  @Column({
    name: 'direction',
    type: 'varchar',
    primary: true,
    default: '-',
  })
  @Index()
  direction: string;

  @property({
    type: 'number',
    required: false,
    default: 0,
  })
  @Column({
    type: 'float',
    default: 0,
  })
  score: number;

  @property({
    type: 'Boolean',
    required: false,
    default: false,
  })
  @Column({
    type: 'boolean',
    default: 'false',
  })
  @Index()
  top_signatures: string;

  @property({
    type: 'Boolean',
    required: false,
    default: false,
  })
  @Column({
    type: 'boolean',
    default: 'false',
  })
  @Index()
  top_entities: string;

  @property({
    type: 'object',
    required: true,
    default: {},
  })
  @Index('sig_ent_meta_gin_index', {synchronize: false})
  @Index('sig_ent_meta_gist_fts_index', {synchronize: false})
  @Column({
    type: 'jsonb',
    default: {},
  })
  meta: {
    [key: string]: any;
  };

  constructor(data?: Partial<SignatureEntity>) {
    super(data);
  }
}
export const SignatureEntitySchema = getJsonSchema(SignatureEntity);
