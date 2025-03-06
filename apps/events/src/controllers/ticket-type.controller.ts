import { TicketTypeService } from '../services/ticket-type.service';
import { TicketTypeResponse, TicketTypesResponse } from 'rumor-utils/shared/events/grpc/events/events.pb';
import { CreateTicketTypeRequestDto, RequestByIdDto, UpdateTicketTypeRequestDto } from 'rumor-utils/shared/events/dtos';
import asyncWrapper from 'src/server/helpers/asyncWrapper';
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from 'packages/rumor-utils/success';
import { Request, Response } from 'express'

export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) { }

  public static createTicketType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const payload: CreateTicketTypeRequestDto = req.body
    const ticketTypeResponse: TicketTypeResponse = await TicketTypeService.createTicketType(
      payload
    );
    const successResponse = new CreateResponse(ticketTypeResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static getTicketType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: RequestByIdDto = { id }
    const ticketTypeResponse: TicketTypeResponse = await TicketTypeService.getTicketType(
      payload
    );
    const successResponse = new GetResponse(ticketTypeResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );


  public static getTicketTypes = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: RequestByIdDto = { id }
    const ticketTypeResponse: TicketTypesResponse = await TicketTypeService.getTicketTypes(
      payload
    );
    const successResponse = new GetResponse(ticketTypeResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );

  public static updateTicketType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: UpdateTicketTypeRequestDto = { id, ...req.body }
    const ticketTypeResponse: TicketTypeResponse = await TicketTypeService.updateTicketType(
      payload
    );
    const successResponse = new UpdateResponse(ticketTypeResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );


  public static deleteTicketType = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const payload: RequestByIdDto = { id }
    const ticketTypeResponse: TicketTypeResponse = await TicketTypeService.deleteTicketType(
      payload
    );
    const successResponse = new DeleteResponse(ticketTypeResponse);
    res.status(successResponse.statusCode).json(successResponse);
  }
  );
}
