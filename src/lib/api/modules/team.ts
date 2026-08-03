import { get } from '../../http/client';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  bio: string;
  github?: string;
  website?: string;
}

export const teamApi = {
  getMembers: () =>
    get<TeamMember[]>('/api/team/members'),
};
