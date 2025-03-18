import { Focus } from "rumor-utils/shared/users/entities/focus.entity";
import { IsNull } from "typeorm";
import {
  FocusResponse,
  GenericResponse,
  InterestResponse,
  InterestsResponse,
} from "rumor-utils/shared/users/grpc/platform/platform.pb";
import { FocusData, InterestData } from "rumor-utils/shared/users/grpc/platform/general.pb";
import {
  toFocus,
  toInterest,
} from "rumor-utils/shared/users/mappers/platform.mapper";
import {
  AddFocusRequestDto,
  CreateInterestRequestDto,
  EditFocusNameRequestDto,
  IdRequestDto,
  SaveFocusesForUserRequestoDto,
  SaveInterestsForUserRequestDto,
  UpdateInterestRequestDto,
} from "rumor-utils/shared/users/dtos/platform.dto";
import { User } from "rumor-utils/shared/users/entities/user.entity";
import { Interest } from "rumor-utils/shared/users/entities/interest.entity";
import { responses } from "../common/responses.common";
import database from "../database";
import { ConflictError, NotFoundError } from "rumor-utils/errors";

export class PlatformService {
  public static dbConnection = database;

  public static async getFocuses(): Promise<FocusData[]> {
    const focuses = await this.dbConnection
      .getRepository(Focus)
      .find({ where: { deletedAt: IsNull() } });
    return focuses.map((focus) => toFocus(focus));
  }

  public static async getUserFocuses(
    payload: IdRequestDto
  ): Promise<FocusData[]> {
    const focuses = await this.dbConnection
      .getRepository(Focus)
      .find({ where: { users: { id: payload.id }, deletedAt: IsNull() } });
    const data = focuses.length > 0 ? focuses.map((focus) => toFocus(focus)) : [];
    return data
  }

  public static async addFocus(
    payload: AddFocusRequestDto
  ): Promise<String> {
    const focus = await this.dbConnection.getRepository(Focus).findOne({
      where: {
        name: payload.name.toLowerCase(),
        deletedAt: IsNull(),
      },
    });
    if (focus) throw new ConflictError("Focus with this name already exists");

    const newFocus = new Focus();
    newFocus.name = payload.name.toLowerCase();
    await this.dbConnection.getRepository(Focus).save(newFocus);
    return;
  }

  public static async editFocusName(
    payload: EditFocusNameRequestDto
  ): Promise<GenericResponse> {
    const focus = await this.dbConnection.getRepository(Focus).findOne({
      where: {
        id: payload.id,
        deletedAt: IsNull(),
      },
    });
    if (!focus) throw new NotFoundError("Focus");

    focus.name = payload.name.toLowerCase();
    await this.dbConnection.getRepository(Focus).save(focus);
    return;
  }

  public static async saveFocusesForUser(
    payload: SaveFocusesForUserRequestoDto
  ): Promise<GenericResponse> {

    const focuses = await this.dbConnection.getRepository(Focus).find({
      where: {
        users: { id: payload.userId },
        deletedAt: IsNull(),
      },
      relations: ['users'],
    });

    if (focuses.length > 0) {
      await Promise.all(
        focuses.map(async (focus) => {
          focus.users = focus.users.filter((user) => user.id !== payload.userId);
          return this.dbConnection.getRepository(Focus).save(focus);
        }),
      );
    }
    await Promise.all(
      payload.focusIds.map(async (focusId) => {
        const focus = await this.dbConnection.getRepository(Focus).findOne({
          where: {
            id: focusId,
            deletedAt: IsNull(),
          },
          relations: {
            users: true,
          },
        });

        if (focus) {
          if (!focus.users.find((u) => u.id === payload.userId)) {
            focus.users = [...focus.users, { id: payload.userId } as User];
            await this.dbConnection.getRepository(Focus).save(focus);
          }
        }
      })
    );
    return;
  }

  public static async createInterest(
    payload: CreateInterestRequestDto
  ): Promise<InterestData> {
    const item = new Interest();
    item.name = payload.name;
    item.description = payload.description;
    item.enabled = payload.enabled;
    const created = await this.dbConnection.getRepository(Interest).save(item);
    return created;
  }

  public static async listInterests(): Promise<InterestData[]> {
    const interests = await this.dbConnection.getRepository(Interest).find();
    return interests;
  }

  public static async getUserInterests(
    payload: IdRequestDto
  ): Promise<InterestData[]> {
    const interests = await this.dbConnection.getRepository(Interest).find({
      where: {
        users: { id: payload.id },
        deletedAt: IsNull(),
      },
    });
    const data = interests.map((interest) => toInterest(interest));
    return data
  }

  public static async saveInterestsForUser(
    payload: SaveInterestsForUserRequestDto
  ): Promise<GenericResponse> {
    const interests = await this.dbConnection.getRepository(Interest).find({
      where: {
        users: { id: payload.userId },
        deletedAt: IsNull(),
      },
      relations: ["users"],
    });

    if (interests.length > 0) {
      await Promise.all(
        interests.map(async (interest) => {
          interest.users = interest.users.filter(
            (user) => user.id !== payload.userId
          );
          return this.dbConnection.getRepository(Interest).save(interest);
        })
      );
    }

    await Promise.all(
      payload.interestsIds.map(async (interestId) => {
        const interest = await this.dbConnection
          .getRepository(Interest)
          .findOne({
            where: {
              id: interestId,
              deletedAt: IsNull(),
            },
            relations: ["users"],
          });

        if (interest) {
          if (!interest.users.find((u) => u.id === payload.userId)) {
            interest.users = [
              ...interest.users,
              { id: payload.userId } as User,
            ];
            await this.dbConnection.getRepository(Interest).save(interest);
          }
        }
      })
    );

    return;
  }

  public static async deleteInterest(
    payload: IdRequestDto
  ): Promise<GenericResponse> {
    const result = await this.dbConnection
      .getRepository(Interest)
      .delete(payload.id);
    if (result.affected === 0) {
      throw new NotFoundError("Item of Interest not found");
    }
    return;
  }

  public static async updateInterest(
    payload: UpdateInterestRequestDto
  ): Promise<InterestData> {
    const updateItem = { ...payload };
    delete updateItem.id;
    await this.dbConnection.getRepository(Interest).update(
      {
        id: payload.id,
      },
      updateItem
    );
    const interest = await this.dbConnection.getRepository(Interest).findOne({
      where: {
        id: payload.id,
      },
    });
    if (!interest) throw new NotFoundError("Item of Interest not found");
    return interest;
  }
}
