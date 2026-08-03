import { get } from '../../http/client';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  joinDate: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export const userApi = {
  getProfile: (username: string) =>
    get<UserProfile>(`/api/users/${username}`),
};
