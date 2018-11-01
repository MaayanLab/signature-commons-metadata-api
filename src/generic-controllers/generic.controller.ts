import { validate } from '@dcic/signature-commons-schema';
import { Constructor } from '@loopback/core';
import { Count, CountSchema, DefaultCrudRepository, Entity, Filter, repository, Where } from '@loopback/repository';
import { api, get, getFilterSchemaFor, getWhereSchemaFor, param } from '@loopback/rest';

export class IGenericEntity extends Entity {
  $validator?: string
  id: number
  meta: object
}

export class IGenericRepository<T extends IGenericEntity> extends DefaultCrudRepository<T, number> {
}

export function GenericControllerFactory<
  GenericEntity extends IGenericEntity,
  GenericRepository extends IGenericRepository<GenericEntity>
  >(
    props: {
      GenericRepository: Constructor<GenericRepository>
      GenericEntity: typeof IGenericEntity
      GenericEntitySchema: any,
      modelName: string
      basePath: string
    }
  ): Constructor<any> {
  @api({
    paths: {},
    components: {
      schemas: {
        [props.modelName]: props.GenericEntitySchema,
      },
    },
  })
  class Controller {
    constructor(
      @repository(props.GenericRepository)
      public genericRepository: IGenericRepository<GenericEntity>,
    ) { }

    // @post(props.basePath + '', {
    //   operationId: props.modelName + '.create',
    //   responses: {
    //     '200': {
    //       description: props.modelName + ' model instance',
    //       content: {'application/json': {'x-ts-type': props.GenericEntity}},
    //     },
    //   },
    // })
    // async create(@requestBody() obj: GenericEntity): Promise<GenericEntity> {
    //   // TODO: ACL
    //   // TODO: JSON Schema Validation
    //   // return await this.genericRepository.create(obj);
    //   return obj;
    // }

    @get(props.basePath + '/count', {
      operationId: props.modelName + '.count',
      responses: {
        '200': {
          description: props.modelName + ' model count',
          content: { 'application/json': { schema: CountSchema } },
        },
      },
    })
    async count(
      @param.query.object('where', getWhereSchemaFor(props.GenericEntity)) where?: Where<GenericEntity>,
    ): Promise<Count> {
      return await this.genericRepository.count(where);
    }

    @get(props.basePath + '/dbck', {
      operationId: props.modelName + '.dbck',
      responses: {
        '200': {
          description: 'Check model instances',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  'type': 'object',
                  'properties': {
                    obj: {
                      'x-ts-type': props.GenericEntity,
                    },
                    errors: {
                      type: 'array',
                      items: {
                        'type': 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        }
      }
    })
    async dbck(
      @param.query.object('filter', getFilterSchemaFor(props.GenericEntity)) filter: Filter<GenericEntity>,
    ): Promise<Array<object>> {
      const objs = await this.genericRepository.find({ ...filter, limit: undefined });
      let results: Array<object> = []

      for await (let obj of objs) {
        if (results.length === filter.limit)
          break
        try {
          obj = await validate<GenericEntity>({
            $validator: 'https://raw.githubusercontent.com/dcic/signature-commons-schema/next/core/' + props.modelName.toLowerCase() + '.json',
            id: obj.id,
            meta: obj.meta,
          } as GenericEntity)
        } catch (e) {
          results = results.concat(e.errors)
        }
      }

      return results
    }

    @get(props.basePath + '', {
      operationId: props.modelName + '.find',
      responses: {
        '200': {
          description: 'Array of ' + props.modelName + ' model instances',
          content: {
            'application/json': {
              schema: { type: 'array', items: { 'x-ts-type': props.GenericEntity } },
            },
          },
        },
      },
    })
    async find(
      @param.query.object('filter', getFilterSchemaFor(props.GenericEntity)) filter?: Filter<GenericEntity>,
    ): Promise<GenericEntity[]> {
      return await this.genericRepository.find(filter);
    }

    // @patch(props.basePath + '', {
    //   operationId: props.modelName + '.updateAll',
    //   responses: {
    //     '200': {
    //       description: props.modelName + ' PATCH success count',
    //       content: {'application/json': {schema: CountSchema}},
    //     },
    //   },
    // })
    // async updateAll(
    //   @requestBody() obj: GenericEntity,
    //   @param.query.object('where', getWhereSchemaFor(props.GenericEntity)) where?: Where,
    // ): Promise<Count> {
    //   // TODO: ACL
    //   // TODO: JSON Schema Validation
    //   return await this.genericRepository.updateAll(obj, where);
    // }

    @get(props.basePath + '/{id}', {
      operationId: props.modelName + '.findById',
      responses: {
        '200': {
          description: props.modelName + ' model instance',
          content: { 'application/json': { 'x-ts-type': props.GenericEntity } },
        },
      },
    })
    async findById(@param.path.number('id') id: number): Promise<GenericEntity> {
      return await this.genericRepository.findById(id);
    }

    // @patch(props.basePath + '/{id}', {
    //   operationId: props.modelName + '.updateById',
    //   responses: {
    //     '204': {
    //       description: props.modelName + ' PATCH success',
    //     },
    //   },
    // })
    // async updateById(
    //   @param.path.number('id') id: number,
    //   @requestBody() obj: GenericEntity,
    // ): Promise<void> {
    //   // TODO: ACL
    //   // TODO: JSON Schema Validation
    //   await this.genericRepository.updateById(id, obj);
    // }

    // @del(props.basePath + '/{id}', {
    //   operationId: props.modelName + '.deleteById',
    //   responses: {
    //     '204': {
    //       description: props.modelName + ' DELETE success',
    //     },
    //   },
    // })
    // async deleteById(@param.path.number('id') id: number): Promise<void> {
    //   // TODO: ACL
    //   await this.genericRepository.deleteById(id);
    // }
  }

  return Controller
}
