// import { Logger } from '@nestjs/common';
import { Observable, firstValueFrom } from 'rxjs';

type GenericResponse = {
  status: number;
  error?: { type?: string; message?: string };
};

export const unpackGenericResponse = async (
  observable: Observable<GenericResponse>,
  action: string,
  logger: any,
) => {
  try {
    const response = await firstValueFrom(observable);
    if (response.error) {
      //logger.warn(`Error ${action}:\n\t${response.error.type}\n\t${response.error.message}`);
      return false;
    }
    if (response.status >= 300) {
      //logger.warn(`Error ${action}: ${response.status}`);
      return false;
    }
    return true;
  } catch (err) {
    //logger.warn(`Exception ${action}:\n\t${err}`);
    return false;
  }
};

type Response<T> = {
  status: number;
  error?: { type: string; message: string };
  data?: T;
};

export const unpackResponse = async <T>(
  observable: Observable<Response<T>>,
  action: string,
  logger: any,
  allowNull = false,
) => {
  try {
    const response = await firstValueFrom(observable);
    if (response.error) {
      //logger.warn(`Error ${action}:\n\t${response.error.type}\n\t${response.error.message}`);
      return null;
    }
    if (response.status >= 300) {
      //logger.warn(`Error ${action}: ${response.status}`);
      return null;
    }
    if (!response.data && !allowNull) {
      //logger.warn(`Error ${action}: Nothing was returned`);
      return null;
    }
    return response.data;
  } catch (err) {
    //logger.warn(`Exception ${action}:\n\t${err}`);
    return null;
  }
};

type StatusResponse = {
  success: boolean;
};

export const unpackStatusResponse = async (
  observable: Observable<StatusResponse>,
  action: string,
  logger: any,
) => {
  try {
    const response = await firstValueFrom(observable);
    if (!response.success) {
      //logger.warn(`Error ${action}: response was false`);
      return false;
    }
    return true;
  } catch (err) {
    //logger.warn(`Exception ${action}:\n\t${err}`);
    return false;
  }
};

type SuccessResponse = {
  success: boolean;
};

/**
 * Should be the same as status response
 */
export const unpackSuccessResponse = async (
  observable: Observable<SuccessResponse>,
  action: string,
  logger: any,
) => {
  try {
    const response = await firstValueFrom(observable);
    if (!response.success) {
      //logger.warn(`Error ${action}: response was false`);
      return false;
    }
    return true;
  } catch (err) {
    //logger.warn(`Exception ${action}:\n\t${err}`);
    return false;
  }
};

export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 3958.8; // Radio of earth on miles

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateAge = birthDate => {
  if (!birthDate) return 0;
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};
