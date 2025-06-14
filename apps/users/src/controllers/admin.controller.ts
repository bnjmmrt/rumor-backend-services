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
import { UserRole } from 'rumor-utils/shared/users/entities/roles/user-role.entity';

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
    /*
     * SQL Query to get all user roles and populate the role.name:
     *
     * SELECT
     *     ur.id,
     *     ur.status,
     *     ur.source,
     *     ur.is_blacklisted,
     *     ur.profile_setup_completed,
     *     ur.is_role_deactivated,
     *     ur.created_at,
     *     ur.updated_at,
     *     u.id as user_id,
     *     u.email as user_email,
     *     u.first_name,
     *     u.last_name,
     *     r.id as role_id,
     *     r.name as role_name,
     *     CASE
     *         WHEN ur.status = 'NEW_APPLICANT' AND ur.source = 'REQUEST_IN_APP' AND r.name = 'non_member' THEN 'Users who have applied to join but haven''t been approved yet (REQUEST_IN_APP + non_member)'
     *         WHEN ur.status = 'ACTIVE' AND ur.source = 'REQUEST_IN_APP' AND r.name = 'member' THEN 'Users who are currently active members (applied through app + member role)'
     *         WHEN ur.status = 'ACTIVE' THEN 'Active users from other sources'
     *         WHEN ur.status = 'WAITLISTED' THEN 'Users who applied but are on the waiting list'
     *         WHEN ur.status = 'DEACTIVATED' THEN 'Users who were once active but have been deactivated'
     *         WHEN ur.status = 'REJECTED' THEN 'Users whose applications were rejected'
     *         WHEN ur.status NOT IN ('ACTIVE', 'DEACTIVATED', 'WAITLISTED', 'UNRECOGNIZED') THEN 'Non-members (all users except ACTIVE, DEACTIVATED, WAITLISTED, UNRECOGNIZED)'
     *         ELSE 'Unknown status'
     *     END as status_description
     * FROM user_role ur
     * INNER JOIN role r ON ur.role_id = r.id
     * INNER JOIN "user" u ON ur.user_id = u.id
     * WHERE r.is_active = true
     *   AND u.deleted_at IS NULL
     *   AND ((u.email IS NOT NULL AND u.email != '') OR (u.phone_number IS NOT NULL AND u.phone_number != ''))
     *   AND r.name IN ('member', 'non_member')
     * ORDER BY ur.created_at DESC;
     */

    const userId = (req as any).user;
    const query = { ...req.query };
    delete query.take;
    delete query.skip;

    try {
      // Define filter buttons with detailed comments about what each status represents
      const filterButtons = [
        // NON_MEMBER: All users except those with status ACTIVE, DEACTIVATED, WAITLISTED, or UNRECOGNIZED
        { label: 'Non-Member', value: 'NON_MEMBER' },

        // NEW_APPLICANT: Users who have applied to join but haven't been approved yet
        // - Must have REQUEST_IN_APP source and non_member role
        { label: 'New Applicant', value: 'NEW_APPLICANT' },

        // ACTIVE: Users who are currently active members
        // - Must have ACTIVE status, REQUEST_IN_APP source, and member role
        { label: 'Active', value: 'ACTIVE' },

        // WAITLISTED: Users who applied but are on the waiting list
        { label: 'Waitlisted', value: 'WAITLISTED' },

        // DEACTIVATED: Users who were once active but have been deactivated
        { label: 'Deactivated', value: 'DEACTIVATED' },

        // REJECTED: Users whose applications were rejected
        { label: 'Rejected', value: 'REJECTED' },
      ];

      // Get counts efficiently using shared filtering logic with getMembers
      const counts = await Promise.all(
        filterButtons.map(async button => {
          let count = 0;

          // Base query for all status types - gets users with member or non_member roles
          const baseQuery = AuthService.dbConnection
            .getRepository(UserRole)
            .createQueryBuilder('userRole')
            .innerJoin('userRole.user', 'user')
            .innerJoin('userRole.role', 'role')
            .where('user.deletedAt IS NULL')
            .andWhere('userRole.deletedAt IS NULL')
            .andWhere('userRole.isRoleDeactivated = :isRoleDeactivated', {
              isRoleDeactivated: false,
            })
            .andWhere('role.name IN (:...roleNames)', { roleNames: ['member', 'non_member'] })
            .andWhere(
              '((user.email IS NOT NULL AND user.email != :emptyEmail) OR (user.phoneNumber IS NOT NULL AND user.phoneNumber != :emptyPhone))',
              {
                emptyEmail: '',
                emptyPhone: '',
              },
            );

          // Use shared filtering logic from AuthService for consistency
          const condition = AuthService.buildMemberTypeCondition(button.value);
          count = await baseQuery.andWhere(condition.query, condition.params).getCount();

          return {
            label: button.label,
            count: count,
            value: button.value,
          };
        }),
      );

      const getResponse = new GetResponse(counts);
      res.status(getResponse.statusCode).json(getResponse);
    } catch (error) {
      console.error('Error getting member counts:', error);
      res.status(500).json({ error: 'Error getting member counts' });
    }
  });

  public static getMembersType = asyncWrapper(async (req, res): Promise<void> => {
    try {
      // Extract and validate request parameters
      const userId = (req as any).user;
      const memberTypes = req.params.type.split(',').map(type => type.trim()); // Split and clean types
      const query = { ...req.query };

      // Add member types for filtering (keep pagination params - take and skip)
      query.memberTypes = memberTypes.join(','); // Pass types to service for database filtering

      // Build payload for AuthService
      const payload: PaginatedRequestDto = {
        userId,
        query: query as string,
      };

      // Get filtered members directly from database (no more inefficient JavaScript filtering!)
      const response: GetMembersResponse = await AuthService.getMembers(payload);
      const members = response.data;

      // No need for additional client-side search filtering since AuthService.getMembers()
      // already handles search at the database level more comprehensively and efficiently
      const getResponse = new GetResponse(members);
      res.status(getResponse.statusCode).json(getResponse);
    } catch (error) {
      console.error('Error getting members by type:', error);
      res.status(500).json({ error: 'Error getting members by type' });
    }
  });
}
