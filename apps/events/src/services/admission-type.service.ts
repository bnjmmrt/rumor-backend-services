import { AdmissionType } from 'rumor-utils/shared/events/entities/admission-type.entity';
import { IsNull } from 'typeorm';
import { CreateAdmissionTypeRequestDto, RequestByIdDto, UpdateAdmissionTypeRequestDto } from 'rumor-utils/shared/events/dtos';
import { AdmissionTypeResponse, AdmissionTypesResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { responses } from '../common/responses';
import { normalizeCatalogName } from '../common/helpers';
import database from '../database'
import { ConflictError, NotFoundError } from 'rumor-utils/errors';
// import { NotFoundError } from 'rxjs';

export class AdmissionTypeService {
  public static dbConnection = database;

  public static async createAdmissionType(payload: CreateAdmissionTypeRequestDto): Promise<AdmissionType> {
    payload.name = normalizeCatalogName(payload.name);
    const existingAdmissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { name: payload.name, deletedAt: IsNull() } });
    if (existingAdmissionType) throw new ConflictError('Admission type with the same name already exists');
    const admissionType = this.dbConnection.getRepository(AdmissionType).create({ ...payload });
    await this.dbConnection.getRepository(AdmissionType).save(admissionType);
    return admissionType
  }

  public static async getAdmissionsTypes(): Promise<AdmissionType[]> {
    const admissionTypes = await this.dbConnection.getRepository(AdmissionType).find({ where: { deletedAt: IsNull() } });
    return admissionTypes
  }

  public static async getAdmissionTypeById(payload: RequestByIdDto): Promise<AdmissionType> {
    const admissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
    if (!admissionType) throw new NotFoundError('Admission type not found');
    return admissionType
  }

  public static async updateAdmissionType(payload: UpdateAdmissionTypeRequestDto): Promise<AdmissionType> {
    if (payload.name) payload.name = normalizeCatalogName(payload.name);
    const existingAdmissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { name: payload.name, deletedAt: IsNull() } });
    if (existingAdmissionType) throw new ConflictError('Admission type with the same name already exists');
    const admissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
    if (!admissionType) throw new NotFoundError('Admission type not found');
    const updatedAdmissionType = await this.dbConnection.getRepository(AdmissionType).save({ ...admissionType, ...payload });
    return updatedAdmissionType
  }

  public static async deleteAdmissionType(payload: RequestByIdDto): Promise<AdmissionType> {
    const admissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
    if (!admissionType) throw new NotFoundError('Admission type not found');
    admissionType.softRemove();
    return admissionType
  }
}
