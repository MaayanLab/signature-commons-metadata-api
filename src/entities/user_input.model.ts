import {
  Entity as TypeORMEntity,
  Column,
  Index,
  Generated,
} from 'typeorm';
import {Entity as LBEntity, model, property} from '@loopback/repository';
import {getJsonSchema} from '@loopback/rest';

@model({
  name: 'UserInput',
  description: 'A table for storing user input',
  settings: {
    strict: false,
  },
})
@TypeORMEntity({
  name: 'user_input',
})
export class UserInput extends LBEntity {
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

  @Column({
    type: 'jsonb',
  })
  meta: {
    [key: string]: any;
  };

}
export const UserInputSchema = getJsonSchema(UserInput);
