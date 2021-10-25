import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {api, get, Response, RestBindings} from '@loopback/rest';
import {CounterRepository} from '../repositories';
import {UserProfile} from '../models';

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
}
