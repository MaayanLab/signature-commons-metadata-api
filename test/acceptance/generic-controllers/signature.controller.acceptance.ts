import {Signature} from '../../../src/entities';
import {
  givenInvalidSignatureData,
  givenSignature,
  givenValidSignatureData,
} from '../../helpers/database.helpers';
import {test_generic} from './generic.controller.acceptance';

test_generic<Signature>({
  modelName: 'signature',
  basePath: `${process.env.PREFIX}/signatures`,
  givenObject: givenSignature,
  givenValidObject: givenValidSignatureData,
  givenInvalidObject: givenInvalidSignatureData,
  givenValidUpdatedObject: givenValidSignatureData,
  givenInvalidUpdatedObject: givenInvalidSignatureData,
});
