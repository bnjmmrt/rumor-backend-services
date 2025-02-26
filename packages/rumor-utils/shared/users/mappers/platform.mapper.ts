import * as _ from 'lodash';
import { Focus } from '../entities/focus.entity';
import { Interest } from '../entities/interest.entity';
import { Focus as FocusProto, InterestData } from '../grpc/platform/general.pb';

export const toFocus = (focus: Focus): FocusProto => {
  return {
    id: focus.id,
    name: _.startCase(focus.name),
  };
};

export const toInterest = (interest: Interest): InterestData => {
  return {
    id: interest.id,
    name: _.startCase(interest.name),
    description: interest.description,
  };
};
