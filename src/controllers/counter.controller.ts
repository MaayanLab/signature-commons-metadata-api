import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
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

import serializeError from 'serialize-error';

import {CounterRepository} from '../repositories';

import {Counter} from '../entities';
import {UserProfile} from '../models';

import debug from '../util/debug';
import {v4 as uuidv4} from 'uuid';

export class IGenericEntity {
  type: string;
  count: number;
}

@api({
  basePath: process.env.PREFIX,
  paths: {},
})
export class CounterController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private user: UserProfile,
    @inject(RestBindings.Http.RESPONSE, {optional: true})
    private response: Response,
  ) {}

  @authenticate('GET.Count')
  @get('/counter', {
    tags: ['Counter'],
    operationId: 'Counter.getCoint',
    responses: {
      '200': {
        description:
          'Get the number of times a user submitted a query of given type',
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
    @repository(CounterRepository)
    counterRepository: CounterRepository,
    @param.path.string('type') type: string,
  ): Promise<IGenericEntity[]> {
    return counterRepository.find();
  }

  @authenticate('GET.Counter.update')
  @post('/user_input/{type}', {
    'x-visibility': 'undocumented',
    tags: ['Counter'],
    operationId: 'Counter.update',
    responses: {
      '200': {
        description: 'UserInput model instance',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': Counter,
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
  async updateCounter(
    @repository(CounterRepository)
    counterRepository: CounterRepository,
    @param.path.string('type') type: string,
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
    obj: Counter,
  ): Promise<IGenericEntity> {
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
        debug('create', obj);
        const id = uuidv4();
        const data = {
          id,
          type,
          count: 1,
        };
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
