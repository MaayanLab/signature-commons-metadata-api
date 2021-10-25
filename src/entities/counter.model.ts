import {Entity as TypeORMEntity, Column, Generated, Index} from 'typeorm';
import {Entity as LBEntity, model, property} from '@loopback/repository';
import {getJsonSchema} from '@loopback/rest';

@model({
  name: 'Counter',
  description: 'A table for storing queries',
  settings: {
    strict: false,
  },
})
@TypeORMEntity({
  name: 'counters',
})
export class Counter extends LBEntity {
  @Column({
    name: 'id',
    primary: true,
    select: false,
    unique: true,
  })
  @Generated()
  _id: number;

  @property({
    type: 'string',
    id: true,
    required: true,
  })
  @Index()
  @Column({
    name: 'uuid',
    type: 'uuid',
    unique: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  @Index()
  @Column({
    name: 'type',
    unique: true,
  })
  type: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  @Column({
    type: 'int',
  })
  count: number;

  constructor(data?: Partial<Counter>) {
    super(data);
  }
}
export const CounterSchema = getJsonSchema(Counter);
