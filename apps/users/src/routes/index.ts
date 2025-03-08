import * as express from 'express';
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AdminController } from '../controllers/admin.controller';
import { RoleController } from '../controllers/role.controller';
import { SettingsController } from '../controllers/settings.controller';
import { SocialController } from '../controllers/social.controller';
import AuthMiddleware from '../server/middleware/auth';
import { PlatformController } from '../controllers/platform.controller';
import { ReferralRequestController } from '../controllers/referral-request.controller';

const router: Router = express.Router();

// Admin routes
router.get('/auth/admin/members', AdminController.getMembers);
router.get('/auth/admin/hosts', AdminController.getHosts);
router.post('/auth/admin/login', AdminController.adminLogin);
router.post('/auth/admin/create', AdminController.createAdmin);
router.get('/auth/admin/host/:id', AdminController.getHostProfile);                // get host profile for admin
router.get('/auth/host/:id', AdminController.getHostProfile);                      // get host profile by id
router.get('/auth/admin/host/:id/profile', AdminController.getBasicHostProfile);   // get basic host profile for admin
router.get('/auth/host/:id/profile', AdminController.getBasicHostProfile);         // get basic host profile by id
router.put('/auth/admin/host/:id/profile', AdminController.updateHostProfile);     // update host profile for admin
router.put('/auth/host/:id/profile', AdminController.updateHostProfile);           // update host profile 
router.post('/auth/admin/host/status', AdminController.updateHostStatus);
router.post('/auth/admin/member/status', AdminController.updateMemberStatus);
router.get('/auth/admin/member/:id', AdminController.getMemberProfile);

// Auth routes
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/set-password', AuthController.setPassword);
router.post('/auth/login', AuthController.login);

// Auth Validator - For Inter Service Call
router.post('/auth/validate', AuthMiddleware.fusionAuthRequired, AuthController.validate);

//Testing the interservice COmmunication
router.get('/check-service-call', AuthController.checkService);

router.post('/auth/member-sign-up', AuthController.memberSignUp);
router.post('/auth/host-sign-up', AuthController.hostSignUp);
router.post('/auth/logout', AuthController.logout);
router.post('/auth/validate-password-token', AuthController.validatePasswordToken);
router.post('/auth/host/set-password', AuthController.setHostPassword);
router.put('/auth/host/password', AuthMiddleware.fusionAuthRequired, AuthController.updateHostPassword);
router.get('/auth/login-sso', AuthController.loginSSO);
router.get('/auth/oauth-redirect', AuthController.oAuthRedirect);
router.post('/auth/check-phone-number', AuthController.checkPhoneNumber);
router.post('/auth/check-email', AuthController.checkEmail);
router.post('/auth/check-age', AuthController.checkAge);
router.post('/auth/check-member-login', AuthController.checkMemberLogin);
router.post('/auth/member-login', AuthController.memberLogin);
router.post('/auth/host-login', AuthController.hostLogin);
router.get('/auth/get-current-member', AuthMiddleware.fusionAuthRequired, AuthController.getCurrentMember);
router.get('/auth/user/:id/get-user', AuthController.getUser);
router.get('/auth/current-user', AuthMiddleware.fusionAuthRequired, AuthController.getCurrentUser);
router.post('/auth/save-or-update-provider', AuthController.saveOrUpdateProvider);
router.post('/auth/send-invitations', AuthMiddleware.fusionAuthRequired, AuthController.sendInvitations);
router.post('/auth/save-invitations', AuthMiddleware.fusionAuthRequired, AuthController.saveInvitations);
router.post('/auth/admin/invite-new-member', AuthController.inviteNewMember);
router.post('/auth/admin/invite-new-host', AuthController.inviteNewHost);
router.put('/auth/user-profile-picture/:id', AuthController.updateUserProfilePicture);
router.put('/auth/user-profile/:id', AuthController.updateUserProfile);
router.get('/auth/bio-profile/:id', AuthController.getBioProfile);
router.post('/auth/bio-profile', AuthController.createBioProfile);
router.put('/auth/bio-profile/:id', AuthController.updateBioProfile);
router.put('/auth/member-approve/:id', AuthController.approveMember);
router.get('/auth/users/{type}', AuthController.listUsersByType);
router.get('/auth/admin/users/status', AuthController.updateUsersStatus);
router.post('/auth/non-member', AuthController.createNonMemberUser);
router.post('/auth/user/get-member-or-non-member', AuthController.getMembersOrNonMembers);
router.post('/auth/host/:id/follow', AuthController.manageFollowHost);
router.delete('/auth/host/:id/follow', AuthController.manageFollowHost);
router.get('/auth/hosts-followed/:id', AuthController.getFollowedHosts);
router.get('/auth/hosts/custom-lists', AuthController.getCustomUsersLists);
router.get('/auth/host/custom-lists/:id/users', AuthController.getCustomUsersList);
router.delete('/auth/host/custom-lists/:id', AuthController.deleteCustomUsersList);
router.post('/auth/host/custom-lists', AuthController.createCustomUsersList);
router.put('/auth/host/custom-lists/:id/users', AuthController.updateCustomUsersList);
router.post('/auth/user/:id/favorite', AuthController.manageFavoriteUser);
router.delete('/auth/user/:id/favorite', AuthController.manageFavoriteUser);
router.get('/auth/hosts/favorites', AuthController.getFavoriteUsers);
router.post('/auth/get-confirmed-members', AuthController.getConfirmedMembers);
router.post('/auth/get-user-with-roles-by-email', AuthController.getUserWithRolesByEmail);
router.post('/auth/get-user-with-roles-by-id ', AuthController.getUserWithRolesById);
router.post('/auth/get-user-with-roles-by-phone', AuthController.getUserWithRolesByPhone);
router.post('/auth/user/invite-as-non-member', AuthController.registerInvitesAsNonMember);
router.post('/auth/create-user', AuthMiddleware.fusionAuthRequired, AuthController.createUser);
router.get('/auth/users-list', AuthMiddleware.fusionAuthRequired, AuthController.getAllUsers);
router.get('/auth/host/:id/filters', AuthMiddleware.fusionAuthRequired, AuthController.getUserFiltersOptions);
router.post('/auth/host-feedback', AuthMiddleware.fusionAuthRequired, AuthController.hostFeedback);
router.post('/auth/send-verification-code-by-email', AuthController.sendVerificationCodeByEmail);
router.post('/auth/verify-code-by-email', AuthController.verifyCodeByEmail);
router.post('/auth/user/:id/set-login-status', AuthController.setLoginStatus);
router.post('/auth/hosts/custom-lists/duplicate', AuthMiddleware.fusionAuthRequired, AuthController.duplicateCustomList);
router.delete('/auth/user/:id', AuthMiddleware.fusionAuthRequired, AuthController.deleteHostUserMapping);
router.get('/auth/user/:id', AuthMiddleware.fusionAuthRequired, AuthController.getUserProfile);
router.post('/auth/hosts/followers', AuthMiddleware.fusionAuthRequired, AuthController.getFollowedUsers);
router.post('/auth/user/:id/spam', AuthMiddleware.fusionAuthRequired, AuthController.manageUserSpam);
router.post('/auth/user/:id/report', AuthMiddleware.fusionAuthRequired, AuthController.reportUser);
router.post('/auth/users/:id/hosts/:hostId/block', AuthMiddleware.fusionAuthRequired, AuthController.blockHost);
router.post('/auth/users/:id/hosts/:hostId/unblock', AuthMiddleware.fusionAuthRequired, AuthController.unblockHost);
router.post('/auth/users/:id/hosts/:hostId/report-and-block', AuthMiddleware.fusionAuthRequired, AuthController.reportAndBlockHost);
router.post('/auth/send-support-email', AuthMiddleware.fusionAuthRequired, AuthController.sendSupportEmail);
router.get('/auth/reports', AuthController.getAllReports);
router.get('/auth/switch-profile/:id', AuthController.switchProfile);

//Role routes
router.get('/auth/roles', RoleController.listRoles);
router.post('/auth/role/assign/:id', RoleController.assignRoleToUser);
// router.post('/auth/roles/assign/:id', RoleController.getUserRoleHierarchy);
// router.post('/auth/roles/check', RoleController.checkRole);
router.put('/auth/roles/role/user', RoleController.updateUserRole);
router.get('/roles/user/:id', RoleController.listUserRoles);
router.post('/auth/roles/revoke/:id', RoleController.revokeRoleFromUser);
router.post('/auth/roles/get-role-by-name', RoleController.getRoleByName);
router.post('/auth/roles/mark-spam', RoleController.markUserAsSpam);


// Settings routes
router.post('/auth/settings/notification', SettingsController.getNotificationSettings);
router.put('/auth/profile-notification-settings/:id', SettingsController.updateNotificationSettings);
// router.post('/auth/settings/push-notification-tokens', SettingsController.getPushNotificationTokens);
router.post('/auth/user/:id/push-notification-token', SettingsController.savePushNotificationToken);
router.delete('/auth/user/:id/push-notification-token', SettingsController.deletePushNotificationToken);


// Social routes
router.get('/auth/get-facebook-auth-url', SocialController.getFacebookAuthUrl);
router.get('/auth/facebook-auth-callback', SocialController.facebookAuthCallback);
router.post('/auth/set-facebook-auth-token', SocialController.setFacebookAuthToken);
router.get('/auth/get-facebook-auth-data', SocialController.getFacebookAuthData);
router.post('/auth/instagram-user/:id', SocialController.setInstagramUser);
router.get('/auth/instagram-user/:id', SocialController.getInstagramUser);
router.get('/auth/get-instagram-auth-url', SocialController.getInstagramAuthUrl);
router.get('/auth/instagram-auth-callback', SocialController.instagramAuthCallback);
router.get('/instagram-redirect', SocialController.instagramRedirect);
// router.get('/auth/social/apple/callback', SocialController.setMetaAuthToken);
router.get('/auth/get-instagram-auth-data', SocialController.getInstagramAuthData);
router.get('/auth/get-google-auth-url', SocialController.getGoogleAuthUrl);
router.get('/auth/google-auth-callback', SocialController.googleAuthCallback);
router.get('/auth/get-google-auth-data', SocialController.getGoogleAuthData);
router.get('/auth/get-linkedin-auth-url', SocialController.getLinkedInAuthUrl);
router.get('/auth/linkedin-auth-callback', SocialController.linkedInAuthCallback);
router.get('/auth/get-linkedin-auth-data', SocialController.getLinkedInAuthData);
router.get('/auth/get-tiktok-auth-url', SocialController.getTiktokAuthUrl);
router.get('/auth/tiktok-auth-callback', SocialController.tiktokAuthCallback);
router.get('/auth/get-tiktok-auth-data', SocialController.getTiktokAuthData);
router.get('/auth/get-snapchat-auth-url', SocialController.getSnapchatAuthUrl);
router.get('/auth/snapchat-auth-callback', SocialController.snapchatAuthCallback);
router.get('/auth/get-snapchat-auth-data', SocialController.getSnapchatAuthData);
router.get('/auth/get-x-auth-url', SocialController.getXAuthUrl);
router.get('/auth/social/microsoft/callback', SocialController.xAuthCallback);
router.get('/auth/x-auth-callback', SocialController.getXAuthData);
// router.get('/auth/social/microsoft/callback', SocialController.syncSocialStats);

//platform
router.get('/auth/get-focuses', PlatformController.getFocuses);
router.get('/auth/user/:id/focuses', PlatformController.getUserFocuses);
router.post('/auth/add-focus', PlatformController.addFocus);
router.post('/auth/edit-focus-name', PlatformController.editFocusName);
router.post('/auth/interest', PlatformController.createInterest);
router.put('/auth/interest/:id', PlatformController.updateInterest);
router.get('/auth/interests', PlatformController.listInterests);
router.get('/auth/interest/:id', PlatformController.deleteInterest);
router.get('/auth/user-interests/:id', PlatformController.getUserInterests);
router.post('/auth/user-interests/:id', PlatformController.saveInterestsForUser);
router.post('/auth/user/:userId/add-focus', PlatformController.saveFocusesForUser);

//Referral Requests
router.post("/referral-requests",AuthMiddleware.fusionAuthRequired, ReferralRequestController.createReferralRequest)
router.put("/referral-requests/:id",AuthMiddleware.fusionAuthRequired, ReferralRequestController.updateReferralRequest)
router.get("/referral-requests",AuthMiddleware.fusionAuthRequired, ReferralRequestController.getAllReferralRequests)
router.get("/list-referral-requests",AuthMiddleware.fusionAuthRequired, ReferralRequestController.getSentReferralRequests)


router.get('/notification-preferences', AuthMiddleware.fusionAuthRequired, SettingsController.getNotificationSettings );
router.put('/notification-preferences', AuthMiddleware.fusionAuthRequired, SettingsController.updateNotificationSettings );

//collaborator user routes
router.post("/auth/host-collaborator/create", AuthController.createHostCollaborator)

export default router;