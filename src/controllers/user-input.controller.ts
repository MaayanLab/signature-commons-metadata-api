import {validate} from '@dcic/signature-commons-schema';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository, CountSchema, Count} from '@loopback/repository';
import {
  api,
  get,
  post,
  param,
  Response,
  RestBindings,
  requestBody,
  HttpErrors,
} from '@loopback/rest';

import {IGenericEntity} from '../generic-controllers/generic.controller';

import {prune} from '../generic-controllers/generic.controller';
import serializeError from 'serialize-error';

import {UserInputRepository, CounterRepository} from '../repositories';

import {UserInput} from '../entities';
import {UserProfile} from '../models';

import debug from '../util/debug';
import {v5 as uuidv5, v4 as uuidv4} from 'uuid';
import {IGenericEntity as CounterEntity} from './counter.controller';

export class UserInputExt extends UserInput {
  type: string;
}

@api({
  basePath: process.env.PREFIX,
  paths: {},
})
export class UserInputController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: UserProfile,
    @inject(RestBindings.Http.RESPONSE, {optional: true})
    private response: Response,
  ) {}

  @authenticate('GET.UserInput')
  @get('/user_input/{id}', {
    tags: ['UserInput'],
    operationId: 'UserInput.getUserInput',
    responses: {
      '200': {
        description: 'Get the corresponding user input from the id',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {'x-ts-type': IGenericEntity},
            },
          },
        },
      },
    },
  })
  async getUserInput(
    @repository(UserInputRepository)
    userInputRepository: UserInputRepository,
    @param.path.string('id') id: string,
  ): Promise<IGenericEntity> {
    return {
      $validator: '/dcic/signature-commons-schema/v6/core/user_input.json',
      ...(<any>await userInputRepository.findById(id)),
    };
  }

  @authenticate('GET.UserInput.count')
  @get('/user_input/count', {
    tags: ['UserInput'],
    operationId: 'UserInput.count',
    responses: {
      '200': {
        description: 'User input count',
        content: {
          'application/json': {
            schema: CountSchema,
          },
        },
      },
    },
  })
  async getUserInputCount(
    @repository(UserInputRepository)
    userInputRepository: UserInputRepository,
  ): Promise<Count> {
    return userInputRepository.count();
  }

  @authenticate('GET.UserInput.save')
  @post('/user_input', {
    tags: ['UserInput'],
    operationId: 'UserInput.save',
    responses: {
      '200': {
        description: 'UserInput model instance',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': UserInput,
            },
          },
        },
      },
      '422': {
        description: 'validation of model instance failed',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'ajv validation error',
            },
          },
        },
      },
    },
  })
  async saveUserInput(
    @repository(UserInputRepository)
    userInputRepository: UserInputRepository,
    counterRepository: CounterRepository,
    @requestBody({
      description: 'Full object to be created',
      required: true,
      content: {
        'application/json': {
          schema: {
            'x-ts-type': IGenericEntity,
          },
        },
      },
    })
    obj: UserInputExt,
  ): Promise<IGenericEntity> {
    try {
      const modelSchema =
        '/dcic/signature-commons-schema/v6/core/user_input.json';

      const namespace = process.env.NAMESPACE ?? '';
      const meta = JSON.stringify(obj.meta);
      const id = uuidv5(meta, namespace);
      const type = obj.type || 'signature';

      const results = await userInputRepository.find({
        where: {
          id: id,
        },
      });
      if (results.length > 0) {
        // it exists
        // console.log(`${id} exists`)
        return {
          $validator: modelSchema,
          ...(<any>results[0]),
        };
      } else {
        // it does not
        // console.log(`${id} is new`)
        debug('create', obj);

        const entity = await validate<IGenericEntity>(
          {
            $validator: modelSchema,
            id,
            ...(<any>prune({...obj})),
          },
          modelSchema,
        );
        delete entity.$validator;
        await this.updateCounter(counterRepository, type);
        return {
          $validator: modelSchema,
          ...(<any>await userInputRepository.create(entity)),
        };
      }
    } catch (e) {
      debug(e);
      throw new HttpErrors.NotAcceptable(serializeError(e));
    }
  }

  async updateCounter(
    counterRepository: CounterRepository,
    type: string,
  ): Promise<CounterEntity> {
    try {
      const results = await counterRepository.find({
        where: {
          type: type,
        },
      });
      if (results.length > 0) {
        // it exists
        const data = results[0];
        data.count = data.count += 1;
        const id = data.id;
        await counterRepository.updateById(id, data);
        return data;
      } else {
        // it does not
        const id = uuidv4();
        const data = {
          id,
          type,
          count: 1,
        };
        debug('create', data);
        return {
          ...(<any>await counterRepository.create(data)),
        };
      }
    } catch (e) {
      debug(e);
      throw new HttpErrors.NotAcceptable(serializeError(e));
    }
  }
}
