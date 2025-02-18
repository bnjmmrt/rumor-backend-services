import * as express from 'express';
import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from 'src/controllers/admin.controller';

const router: Router = express.Router();

// Admin routes
router.get('/auth/admin/members', AdminController.getMembers);
router.get('/auth/admin/hosts', AdminController.getHosts);
router.post('/auth/admin/login', AdminController.adminLogin);
router.post('/auth/admin/create', AdminController.createAdmin);
router.get('/auth/admin/host/{id}', AdminController.getHostProfile);                // get host profile for admin
router.get('/auth/host/{id}', AdminController.getHostProfile);                      // get host profile by id
router.get('/auth/admin/host/{id}/profile', AdminController.getBasicHostProfile);   // get basic host profile for admin
router.get('/auth/host/{id}/profile', AdminController.getBasicHostProfile);         // get basic host profile by id
router.put('/auth/admin/host/{id}/profile', AdminController.updateHostProfile);     // update host profile for admin
router.put('/auth/host/{id}/profile', AdminController.updateHostProfile);           // update host profile 
router.post('/auth/admin/host/status', AdminController.updateHostStatus);
router.post('/auth/admin/member/status', AdminController.updateMemberStatus);
router.get('/auth/admin/member/{id}', AdminController.getMemberProfile);

// Auth routes
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/set-password', AuthController.setPassword);
router.post('/auth/login', AuthController.login);
router.post('/auth/validate', AuthController.validate);
router.post('/auth/member-sign-up', AuthController.memberSignUp);
router.post('/auth/host-sign-up', AuthController.hostSignUp);
router.post('/auth/logout', AuthController.logout);
router.post('/auth/validate-password-token', AuthController.validatePasswordToken);
router.post('/auth/host/set-password', AuthController.setHostPassword);
router.post('/auth/host/password', AuthController.updateHostPassword);
router.post('/auth/login-sso', AuthController.loginSSO);
router.post('/auth/oauth-redirect', AuthController.oAuthRedirect);
router.post('/auth/check-phone-number', AuthController.checkPhoneNumber);
router.post('/auth/check-email', AuthController.checkEmail);
router.post('/auth/check-age', AuthController.checkAge);
router.post('/auth/check-member-login', AuthController.checkMemberLogin);
router.post('/auth/member-login', AuthController.memberLogin);
router.post('/auth/host-login', AuthController.hostLogin);
router.get('/auth/get-current-member', AuthController.getCurrentMember);
// router.post('/auth/admin/reactivate-account', AuthController.getUser);
router.get('/auth/current-user', AuthController.getCurrentUser);
router.post('/auth/save-or-update-provider', AuthController.saveOrUpdateProvider);
router.post('/auth/send-invitations', AuthController.sendInvitations);
router.post('/auth/save-invitations', AuthController.saveInvitations);
router.post('/auth/admin/invite-new-member', AuthController.inviteNewMember);
router.post('/auth/admin/invite-new-host', AuthController.inviteNewHost);
router.put('/auth/user-profile-picture/{id}', AuthController.updateUserProfilePicture);
router.put('/auth/user-profile/{id}', AuthController.updateUserProfile);
router.post('/auth/bio-profile/{id}', AuthController.getBioProfile);
router.post('/auth/bio-profile', AuthController.createBioProfile);
router.put('/auth/bio-profile/{id}', AuthController.updateBioProfile);
router.put('/auth/member-approve/{id}', AuthController.approveMember);
router.get('/auth/users/{type}', AuthController.listUsersByType);
router.post('/auth/non-member', AuthController.createNonMemberUser);
// router.post('/auth/admin/reactivate-account', AuthController.getMembersOrNonMembers);
router.post('/auth/host/{id}/follow', AuthController.manageFollowHost);
router.delete('/auth/host/{id}/follow', AuthController.manageFollowHost);
router.get('/auth/hosts-followed/{id}', AuthController.getFollowedHosts);
router.get('/auth/hosts/custom-lists', AuthController.getCustomUsersLists);
router.get('/auth/host/custom-lists/{id}/users', AuthController.getCustomUsersList);
router.delete('/auth/host/custom-lists/{id}', AuthController.deleteCustomUsersList);
router.post('/auth/host/custom-lists', AuthController.createCustomUsersList);
router.put('/auth/host/custom-lists/{id}/users', AuthController.updateCustomUsersList);
router.post('/auth/user/{id}/favorite', AuthController.manageFavoriteUser);
router.delete('/auth/user/{id}/favorite', AuthController.manageFavoriteUser);
router.get('/auth/hosts/favorites', AuthController.getFavoriteUsers);
router.post('/auth/get-confirmed-members', AuthController.getConfirmedMembers);
router.post('/auth/get-user-with-roles-by-email', AuthController.getUserWithRolesByEmail);
// router.post('/auth/admin/reactivate-account', AuthController.registerInvitesAsNonMember);
router.post('/auth/create-user', AuthController.createUser);
router.post('/auth/users-list', AuthController.getAllUsers);

export default router;