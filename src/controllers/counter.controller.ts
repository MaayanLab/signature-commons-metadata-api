import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository, Entity} from '@loopback/repository';
import {
  api,
  get,
  Response,
  RestBindings,
  post,
  HttpErrors,
  param,
  requestBody,
} from '@loopback/rest';
import {
  CounterRepository,
  SignatureRepository,
  EntityRepository,
} from '../repositories';
import {UserProfile} from '../models';

import debug from '../util/debug';
import {v4 as uuidv4} from 'uuid';
import serializeError from 'serialize-error';

export class IGenericEntity {
  type: string;
  count: number;
}

export class ModelEntity extends Entity {
  $validator?: string;
  id: string;
  meta: {
    $counter: number;
  };
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

  @authenticate('GET.Counter')
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
  async getCounter(
    @repository(CounterRepository)
    counterRepository: CounterRepository,
  ): Promise<IGenericEntity[]> {
    return counterRepository.find();
  }

  @authenticate('GET.Counters.update')
  @post('/counter/{type}/{id}', {
    tags: ['UserInput'],
    operationId: 'Counters.update',
    responses: {
      '200': {
        description: 'Counters model instance',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': IGenericEntity,
            },
          },
        },
      },
    },
  })
  async updateCounter(
    @repository(CounterRepository)
    counterRepository: CounterRepository,
    @repository(SignatureRepository)
    signatureRepository: SignatureRepository,
    @repository(EntityRepository)
    entityRepository: EntityRepository,
    @param.path.string('type') type: string,
    @param.path.string('id') id: string,
  ): Promise<IGenericEntity> {
    try {
      const results = await counterRepository.find({
        where: {
          type: type,
        },
      });
      await this.updateModelCounter(
        signatureRepository,
        entityRepository,
        type,
        id,
      );
      if (results.length > 0) {
        // it exists
        const data = results[0];
        data.count = data.count += 1;
        const uid = data.id;
        await counterRepository.updateById(uid, data);
        return data;
      } else {
        // it does not
        const data = {
          id: uuidv4(),
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

  async updateModelCounter(
    signatureRepository: SignatureRepository,
    entityRepository: EntityRepository,
    type: string,
    id: string,
  ): Promise<void> {
    const modelRepository =
      type === 'signatures' ? signatureRepository : entityRepository;
    const entry = await modelRepository.findById(id);
    if (entry.meta['$counter'] === undefined) entry.meta['$counter'] = 1;
    else entry.meta['$counter'] = entry.meta['$counter'] + 1;
    await modelRepository.updateById(id, entry);
  }

  @authenticate('GET.Counters.PostUpdate')
  @post('/counter', {
    tags: ['UserInput'],
    operationId: 'Counters.update',
    responses: {
      '200': {
        description: 'Counters model instance',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': IGenericEntity,
            },
          },
        },
      },
    },
  })
  async updateCounterPost(
    @repository(CounterRepository)
    counterRepository: CounterRepository,
    @repository(SignatureRepository)
    signatureRepository: SignatureRepository,
    @repository(EntityRepository)
    entityRepository: EntityRepository,
    @requestBody({
      description: 'JSON of the find GET parameters',
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'type to update',
              },
              id: {
                type: 'string',
                description: 'id of the entity to update',
              },
            },
          },
        },
      },
    })
    {
      type,
      id,
    }: {
      type: string;
      id?: string;
    },
  ): Promise<IGenericEntity> {
    try {
      const results = await counterRepository.find({
        where: {
          type: type,
        },
      });
      if (id !== undefined) {
        await this.updateModelCounter(
          signatureRepository,
          entityRepository,
          type,
          id,
        );
      }
      if (results.length > 0) {
        // it exists
        const data = results[0];
        data.count = data.count += 1;
        const uid = data.id;
        await counterRepository.updateById(uid, data);
        return data;
      } else {
        // it does not
        const data = {
          id: uuidv4(),
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
