// import jwt from 'express-jwt';
// import jwks from 'jwks-rsa';
// import context from '../../utils/context';
// import config from '../../config';
// import { UnauthorizedError, ForbiddenError } from '../../utils/errors';

// const checkToken = jwt({
//     secret: jwks.expressJwtSecret({
//         cache: true,
//         rateLimit: true,
//         jwksRequestsPerMinute: 5,
//         jwksUri: `https://${config.get('auth0CustomDomain')}/.well-known/jwks.json`,
//     }),
//     audience: 'school-space-api',
//     issuer: `https://${config.get('auth0CustomDomain')}/`,
//     algorithms: ['RS256'],
// });

// const checkRole = (permittedRole: string, pathParameter: string) => (
//     req: any,
//     res: any,
//     next: any
// ) => {
//     const { user, params } = req;
//     const assignedRole = user['https://school-space.org/role'];

//     if (!assignedRole) {
//         return next(new UnauthorizedError('User has no assigned role'));
//     }

//     if (assignedRole === 'admin') {
//         context.setUser(assignedRole, user.email);
//         return next();
//     }

//     const entityId = user['https://school-space.org/entity_id'];
//     context.setUser(assignedRole, entityId);

//     if (assignedRole === permittedRole) {
//         if (!pathParameter) {
//             return next();
//         }

//         const paramIdToMatch = params && params[pathParameter];

//         if (!entityId) {
//             return next(new UnauthorizedError('User has no entity ID'));
//         }

//         if (!paramIdToMatch) {
//             return next(new UnauthorizedError(`Missing URL parameter '${pathParameter}'`));
//         }

//         if (entityId !== paramIdToMatch) {
//             return next(
//                 new ForbiddenError(
//                     `Entity ID '${entityId}' does not match URL parameter '${paramIdToMatch}'`
//                 )
//             );
//         }

//         return next();
//     }

//     return next(new ForbiddenError(`Role '${assignedRole}' has insufficient permissions`));
// };

// const withAuth = (permittedRole: string, pathParameter: string) => [
//     checkToken,
//     checkRole(permittedRole, pathParameter),
// ];

// export { checkRole, withAuth };
