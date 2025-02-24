import { AdmissionType } from 'rumor-utils/shared/events/entities/admission-type.entity';
import { IsNull } from 'typeorm';
import { CreateAdmissionTypeRequestDto, RequestByIdDto, UpdateAdmissionTypeRequestDto } from 'rumor-utils/shared/events/dtos';
import { AdmissionTypeResponse, AdmissionTypesResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { responses } from '../common/responses';
import { normalizeCatalogName } from '../common/helpers';
import database from '../database'

export class AdmissionTypeService {
  public static dbConnection = database;

  public static async createAdmissionType(payload: CreateAdmissionTypeRequestDto): Promise<AdmissionTypeResponse> {
    try {
      payload.name = normalizeCatalogName(payload.name);
      const existingAdmissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { name: payload.name, deletedAt: IsNull() } });
      if (existingAdmissionType) return responses.conflict('Admission type with the same name already exists');
      const admissionType = this.dbConnection.getRepository(AdmissionType).create({ ...payload });
      await this.dbConnection.getRepository(AdmissionType).save(admissionType);
      return responses.data(admissionType);
    } catch (error) {
      return responses.badRequest('Error creating a new admission type');
    }
  }

  public static async getAdmissionsTypes(): Promise<AdmissionTypesResponse> {
    try {
      const admissionTypes = await this.dbConnection.getRepository(AdmissionType).find({ where: { deletedAt: IsNull() } });
      return responses.data(admissionTypes);
    } catch (error) {
      return responses.badRequest('Error getting admission types');
    }
  }

  public static async getAdmissionTypeById(payload: RequestByIdDto): Promise<AdmissionTypeResponse> {
    try {
      const admissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
      if (!admissionType) return responses.notFound('Admission type not found');
      return responses.data(admissionType);
    } catch (error) {
      return responses.badRequest('Error getting admission type');
    }
  }

  public static async updateAdmissionType(payload: UpdateAdmissionTypeRequestDto): Promise<AdmissionTypeResponse> {
    try {
      if (payload.name) payload.name = normalizeCatalogName(payload.name);
      const existingAdmissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { name: payload.name, deletedAt: IsNull() } });
      if (existingAdmissionType) return responses.conflict('Admission type with the same name already exists');
      const admissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
      if (!admissionType) return responses.notFound('Admission type not found');
      const updatedAdmissionType = await this.dbConnection.getRepository(AdmissionType).save({ ...admissionType, ...payload });
      return responses.data(updatedAdmissionType);
    } catch (error) {
      return responses.badRequest('Error updating admission type');
    }
  }

  public static async deleteAdmissionType(payload: RequestByIdDto): Promise<AdmissionTypeResponse> {
    try {
      const admissionType = await this.dbConnection.getRepository(AdmissionType).findOne({ where: { id: payload.id, deletedAt: IsNull() } });
      if (!admissionType) return responses.notFound('Admission type not found');
      admissionType.softRemove();
      return responses.data(admissionType);
    } catch (error) {
      return responses.badRequest('Error deleting admission type');
    }
  }
}
