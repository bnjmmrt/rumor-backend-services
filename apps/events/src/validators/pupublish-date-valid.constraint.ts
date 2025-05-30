import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { CreateEventRequestDto } from 'rumor-utils/shared/events/dtos/events.dto';

@ValidatorConstraint({ async: false })
export class IsPublishDateValidConstraint implements ValidatorConstraintInterface {
  validate(publishDate: string, args: ValidationArguments) {
    const object = args.object as CreateEventRequestDto;
    const publishDateValue = publishDate ? this.parsePublishDate(publishDate) : null;
    const startDateValue = object.startDate ? this.parseDate(object.startDate) : null;
    if (!publishDateValue || !object.startDate) {
      return true;
    }

    if (!startDateValue) {
      return true;
    }

    return publishDateValue <= startDateValue;
  }

  private parsePublishDate(dateString: string): Date | null {
    const regex =
      /^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4}) ([01][0-9]|2[0-3]):([0-5][0-9])$/;
    const match = dateString.match(regex);
    if (!match) return null;

    const month = parseInt(match[1], 10) - 1;
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    return new Date(year, month, day, hour, minute);
  }

  private parseDate(dateString: string): Date | null {
    const regex = /^(0[1-9]|1[0-2])\/([0-2][0-9]|3[01])\/([0-9]{4})$/;
    const match = dateString.match(regex);
    if (!match) return null;

    const month = parseInt(match[1], 10) - 1;
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  defaultMessage() {
    return 'Publish date cannot be after the start date.';
  }
}

export function IsPublishDateValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPublishDateValidConstraint,
    });
  };
}
