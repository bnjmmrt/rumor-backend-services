import { ProviderType as ProviderTypeProto } from '../grpc/auth/shared.pb';
import { SocialProviderType } from '../interfaces/shared.interface';

export const providerTypeToEntity: { [g in ProviderTypeProto]: SocialProviderType } = {
  [ProviderTypeProto.INSTAGRAM]: SocialProviderType.INSTAGRAM,
  [ProviderTypeProto.FACEBOOK]: SocialProviderType.FACEBOOK,
  [ProviderTypeProto.TIKTOK]: SocialProviderType.TIKTOK,
  [ProviderTypeProto.GOOGLE]: SocialProviderType.GOOGLE,
  [ProviderTypeProto.SNAPCHAT]: SocialProviderType.SNAPCHAT,
  [ProviderTypeProto.X]: SocialProviderType.X,
  [ProviderTypeProto.LINKEDIN]: SocialProviderType.LINKEDIN,
  [ProviderTypeProto.UNRECOGNIZED]: SocialProviderType.GOOGLE,
};

export const entityToProviderType: { [g in SocialProviderType]: ProviderTypeProto } = {
  [SocialProviderType.FACEBOOK]: ProviderTypeProto.FACEBOOK,
  [SocialProviderType.INSTAGRAM]: ProviderTypeProto.INSTAGRAM,
  [SocialProviderType.TIKTOK]: ProviderTypeProto.TIKTOK,
  [SocialProviderType.GOOGLE]: ProviderTypeProto.GOOGLE,
  [SocialProviderType.SNAPCHAT]: ProviderTypeProto.SNAPCHAT,
  [SocialProviderType.LINKEDIN]: ProviderTypeProto.LINKEDIN,
  [SocialProviderType.X]: ProviderTypeProto.X,
};
