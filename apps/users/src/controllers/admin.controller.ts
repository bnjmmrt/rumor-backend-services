import { AuthService } from '../services/auth.service';
import {
  AUTH_SERVICE_NAME,
  BasicHostProfileResponse,
  GetHostsResponse,
  GetMembersResponse,
  HostProfileResponse,
  MemberProfileResponse,
  SignUpResponse,
  TokenResponse,
  TokenResponseAndRoles,
} from 'rumor-utils/shared/users/grpc/auth/auth.pb';
import {
  IdRequestDto,
  PaginatedRequestDto,
  UserAndIdRequestDto,
} from 'rumor-utils/shared/users/dtos/shared.dto';
import {
  LoginRequestDto,
  AdminSignUpRequestDto,
  UpdateUserStatusRequestDto,
  UpdateHostsStatusRequestDto,
} from 'rumor-utils/shared/users/dtos/auth.dto';
import { UpdateHostProfileRequestDto } from 'rumor-utils/shared/users/dtos/admin.dto';
import { GenericResponse } from 'rumor-utils/shared/users/grpc/auth/shared.pb';
import asyncWrapper from '../server/helpers/asyncWrapper';
import { CreateResponse, GetResponse, UpdateResponse } from 'rumor-utils/success';
import type { BasicHostProfile } from 'rumor-utils/shared/users/grpc/auth/auth.pb.d.ts';

export class AdminController {
  public static getMembers = asyncWrapper(async (req, res): Promise<void> => {
    const userId = (req as any).user;
    const payload: PaginatedRequestDto = { userId, query: req.query as string };
    const response: GetMembersResponse = await AuthService.getMembers(payload);
    const getResponse = new GetResponse(response.data);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static getHosts = asyncWrapper(async (req, res): Promise<void> => {
    const userId = (req as any).user;
    const query = JSON.stringify(req.query);
    const payload: PaginatedRequestDto = { userId, query };
    const response: GetHostsResponse = await AuthService.getHosts(payload);
    const getResponse = new GetResponse(response.data);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static send2FACode = asyncWrapper(async (req, res): Promise<void> => {
    const payload = req.body;
    const response = await AuthService.send2FACode(payload);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static adminLogin = asyncWrapper(async (req, res): Promise<void> => {
    const payload: LoginRequestDto = req.body;
    const response: TokenResponseAndRoles = await AuthService.adminLogin(payload);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  public static adminLoginPreview = asyncWrapper(async (req, res): Promise<void> => {
    const payload: LoginRequestDto = req.body;
    const response: TokenResponseAndRoles = await AuthService.adminLoginPreview(payload);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  //@GrpcMethod(AUTH_SERVICE_NAME, 'CreateAdmin')
  public static createAdmin = asyncWrapper(async (req, res): Promise<void> => {
    const payload: AdminSignUpRequestDto = req.body;
    const response: any = await AuthService.createAdmin(payload);
    const createResponse = new CreateResponse(response?.user, 'Admin created succesfully');
    res.status(createResponse.statusCode).json(createResponse);
  });

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetHostProfile')
  public static getHostProfile = asyncWrapper(async (req, res): Promise<void> => {
    const userId = (req as any).user;
    const { id } = req.params;
    const payload: UserAndIdRequestDto = { userId, id };
    const response: HostProfileResponse = await AuthService.getHostProfile(payload);
    const getResponse = new GetResponse(response);
    res.status(getResponse.statusCode).json(getResponse);
  });

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetBasicHostProfile')
  public static getBasicHostProfile = asyncWrapper(async (req, res): Promise<void> => {
    const payload: IdRequestDto = { id: req.user };
    console.log('🚀 ~ AdminController ~ payload:', payload);

    const response: BasicHostProfile = await AuthService.getBasicHostProfile(payload);
    const successResponse = new GetResponse(response);
    res.status(successResponse.statusCode).json(successResponse);
  });

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostProfile')
  public static updateHostProfile = asyncWrapper(async (req, res): Promise<void> => {
    const id = req.user;
    const payload: UpdateHostProfileRequestDto = { ...req.body, id };
    const response: BasicHostProfileResponse = await AuthService.updateHostProfile(payload);
    const UpdatedResponse = new UpdateResponse(response.data, 'Updated host details succesfully');
    res.status(UpdatedResponse.statusCode).json(UpdatedResponse);
  });

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateHostStatus')
  public static updateHostStatus = asyncWrapper(async (req, res): Promise<void> => {
    const payload: UpdateHostsStatusRequestDto = req.body;
    const response: GenericResponse = await AuthService.updateHostStatus(payload);
    const UpdatedResponse = new UpdateResponse(response, 'Status updated succesfully');
    res.status(UpdatedResponse.statusCode).json(UpdatedResponse);
  });

  public static approveHost = asyncWrapper(async (req, res): Promise<void> => {
    const payload: UpdateHostsStatusRequestDto = req.body;
    const response: any = await AuthService.updateHostStatus(payload);
    res.json(response);
  });

  //@GrpcMethod(AUTH_SERVICE_NAME, 'UpdateMemberStatus')
  public static updateMemberStatus = asyncWrapper(async (req, res): Promise<void> => {
    const payload: UpdateUserStatusRequestDto = req.body;
    const response: GenericResponse = await AuthService.updateMemberStatus(payload);
    res.json(response);
  });

  //@GrpcMethod(AUTH_SERVICE_NAME, 'GetMemberProfile')
  public static getMemberProfile = asyncWrapper(async (req, res): Promise<void> => {
    const payload: IdRequestDto = { id: req.params.id };
    const response: MemberProfileResponse = await AuthService.getMemberProfile(payload);
    const successResponse = new GetResponse(response.data);
    res.status(successResponse.statusCode).json(successResponse);
  });

  public static exportUsersCsv = asyncWrapper(async (req, res): Promise<void> => {
    const hostId = (req as any).user;
    const query = req.query;
    const payload: PaginatedRequestDto = {
      userId: hostId,
      query,
    };

    try {
      // Call the service to generate the CSV
      const csvData = await AuthService.exportUsersCsv(payload);

      // Set the headers to indicate the content type and prompt a download
      res.header('Content-Type', 'text/csv');
      res.attachment('users_export.csv');

      // Send the generated CSV data to the client
      res.send(csvData);
    } catch (error) {
      // If any error occurs, return a 500 status code
      res.status(500).send('Error generating CSV');
    }
  });

  public static getMembersCSV = asyncWrapper(async (req, res): Promise<void> => {
    const userId = (req as any).user;
    // Remove pagination parameters from query
    const query = { ...req.query };
    delete query.take;
    delete query.skip;

    const payload: PaginatedRequestDto = { userId, query: query as string };

    try {
      // Get members data without pagination
      const response: GetMembersResponse = await AuthService.getMembers(payload);
      const members = response.data;

      // Transform members data to CSV rows with frontend validations
      const rows = members.map(member => {
        // Format gender
        const gender = member.gender
          ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1).toLowerCase()
          : '------';

        // Format city
        const city = !member.city || member.city === 'N/A' ? '------' : member.city;

        // Format status
        let status = member.status || '';
        if (member.status === 'ACTIVE' && member.sources?.includes('REQUEST_IN_APP')) {
          status = 'Active';
        } else if (member.status === 'DEACTIVATED') {
          status = 'DEACTIVATED';
        } else if (member.status === 'WAITLISTED') {
          status = 'WAITLISTED';
        } else if (
          member.role === 'non_member' &&
          member.status !== 'NEW_APPLICANT' &&
          member.status !== 'DEACTIVATED'
        ) {
          status = 'Non Member';
        } else if (
          member.sources?.includes('PLUS_1') ||
          member.sources?.includes('INVITED_BY_HOST') ||
          member.sources?.includes('SIGN_UP_FORM')
        ) {
          status = 'Non Member';
        }

        // Format phone
        const phone = member.phoneNumber || '------';

        // Format birthday and calculate age
        let birthday = '------';
        let age = '------';
        if (member.dateOfBirth) {
          const date = new Date(member.dateOfBirth);
          birthday = date.toISOString().split('T')[0].replace(/-/g, '/');
          age = (new Date().getFullYear() - date.getFullYear()).toString();
        }

        // Format categories
        const categories = member.categories?.length ? member.categories.join(', ') : '------';

        // Format referral info
        const referralCode = member.references?.code || '------';
        const referredBy = member.references?.name || member.references?.email || '------';

        // Format role
        const role = member.role === 'non_member' ? 'Non Member' : member.role || '';

        return [
          `"${member.name || ''}"`,
          `"${member.email || ''}"`,
          `"${phone}"`,
          `"${gender}"`,
          `"${categories}"`,
          `"${city}"`,
          `"${member.followerCount || ''}"`,
          `"${member.types?.join(', ') || ''}"`,
          `"${status}"`,
          `"${member.instagramUsername || ''}"`,
          `"${birthday}"`,
          `"${age}"`,
          `"${member.isFavourite ? 'Yes' : 'No'}"`,
          `"${role}"`,
          `"${referralCode}"`,
          `"${referredBy}"`,
        ].join(',');
      });

      // Update headers to include new columns
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Gender',
        'Interests',
        'Base City',
        'Followers',
        'Category',
        'Status',
        'Instagram Username',
        'Birthday',
        'Age',
        'Favourite',
        'Type',
        'Referral Code',
        'Referred by',
      ].join(',');

      // Combine headers and rows
      const csvContent = [headers, ...rows].join('\n');

      // Set headers for CSV download
      res.header('Content-Type', 'text/csv');
      res.attachment('members_export.csv');

      // Send CSV content
      res.send(csvContent);
    } catch (error) {
      res.status(500).send('Error generating CSV');
    }
  });

  public static getMembersCount = asyncWrapper(async (req, res): Promise<void> => {
    const userId = (req as any).user;
    const query = { ...req.query };
    delete query.take;
    delete query.skip;

    const payload: PaginatedRequestDto = { userId, query: query as string };

    try {
      const response: GetMembersResponse = await AuthService.getMembers(payload);
      const members = response.data;

      const filterButtons = [
        { label: 'Non-Member', value: 'NON_MEMBER' },
        { label: 'New Applicant', value: 'NEW_APPLICANT' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Waitlisted', value: 'WAITLISTED' },
        { label: 'Deactivated', value: 'DEACTIVATED' },
        { label: 'Banned', value: 'BANNED' },
      ];

      const counts = filterButtons.map(objBttn => {
        let filtered = members.filter(row => row.status === objBttn.value);

        if (objBttn.value === 'ACTIVE') {
          filtered = members.filter(
            row => row.status === 'ACTIVE' && row.sources.includes('REQUEST_IN_APP'),
          );
        }

        if (objBttn.value === 'DEACTIVATED') {
          filtered = members.filter(row => row.status === 'DEACTIVATED');
        }

        if (objBttn.value === 'WAITLISTED') {
          filtered = members.filter(row => row.status === 'WAITLISTED');
        }

        if (objBttn.value === 'NON_MEMBER') {
          filtered = members.filter(
            row =>
              ['DEACTIVATED', 'WAITLISTED'].every(status => status !== row.status) &&
              ((row.role === 'non_member' &&
                ['DEACTIVATED', 'NEW_APPLICANT'].every(status => status !== row.status)) ||
                row.sources.some(source =>
                  ['PLUS_1', 'INVITED_BY_HOST', 'SIGN_UP_FORM'].includes(source),
                )),
          );
        }

        return {
          label: objBttn.label,
          count: filtered.length,
          value: objBttn.value,
        };
      });

      const getResponse = new GetResponse(counts);
      res.status(getResponse.statusCode).json(getResponse);
    } catch (error) {
      res.status(500).json({ error: 'Error getting member counts' });
    }
  });

  public static getMembersType = asyncWrapper(async (req, res): Promise<void> => {
    const userId = (req as any).user;
    const query = { ...req.query };
    const types = req.params.type.split(','); // Split types by comma
    delete query.take;
    delete query.skip;

    const payload: PaginatedRequestDto = { userId, query: query as string };

    try {
      const response: GetMembersResponse = await AuthService.getMembers(payload);
      const members = response.data;
      let filteredMembers = new Set(); // Use Set to avoid duplicates

      // Filter for each type and add to Set
      types.forEach(type => {
        let typeFilteredMembers = [];

        if (type === 'ACTIVE') {
          typeFilteredMembers = members.filter(
            row => row.status === 'ACTIVE' && row.sources.includes('REQUEST_IN_APP'),
          );
        } else if (type === 'DEACTIVATED') {
          typeFilteredMembers = members.filter(row => row.status === 'DEACTIVATED');
        } else if (type === 'WAITLISTED') {
          typeFilteredMembers = members.filter(row => row.status === 'WAITLISTED');
        } else if (type === 'NON_MEMBER') {
          typeFilteredMembers = members.filter(
            row =>
              ['DEACTIVATED', 'WAITLISTED'].every(status => status !== row.status) &&
              ((row.role === 'non_member' &&
                ['DEACTIVATED', 'NEW_APPLICANT'].every(status => status !== row.status)) ||
                row.sources.some(source =>
                  ['PLUS_1', 'INVITED_BY_HOST', 'SIGN_UP_FORM'].includes(source),
                )),
          );
        } else {
          // For NEW_APPLICANT and BANNED, just filter by status
          typeFilteredMembers = members.filter(row => row.status === type);
        }

        // Add filtered members to Set
        typeFilteredMembers.forEach(member => filteredMembers.add(member));
      });

      // Convert Set back to array
      const finalFilteredMembers = Array.from(filteredMembers);

      // Apply search filter if searchValue exists
      const searchValue = query.searchValue as string;
      const searchResults = searchValue
        ? finalFilteredMembers.filter((member: any) => {
            const searchLower = searchValue.toLowerCase();
            return (
              member.name?.toLowerCase().includes(searchLower) ||
              member.email?.toLowerCase().includes(searchLower) ||
              member.phoneNumber?.includes(searchValue) ||
              member.instagramUsername?.toLowerCase().includes(searchLower)
            );
          })
        : finalFilteredMembers;

      const getResponse = new GetResponse(searchResults);
      res.status(getResponse.statusCode).json(getResponse);
    } catch (error) {
      res.status(500).json({ error: 'Error getting members by type' });
    }
  });
}
