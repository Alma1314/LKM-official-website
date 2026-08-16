export interface MockProject {
  id: string;
  name: string;
  initiatorName: string;
  type: "recruiting" | "showcase";
  background: string;
  goals: string;
  requirements: string;
  teamIntro: string;
  progress: number;
  recruitingRoles: string[];
  team: { name: string; role: string }[];
  tags: string[];
  isIncubated: boolean;
  isPinned: boolean;
  isRecruiting: boolean;
  reports: MockProjectReport[];
  createdAt: string;
}

export interface MockProjectReport {
  title: string;
  content: string;
  revision: number;
  date: string;
}

export const mockProjects: MockProject[] = [
  {
    id: "proj-1",
    name: "projectData.projects.proj1.name",
    initiatorName: "projectData.names.qiyueO",
    type: "recruiting",
    background: "projectData.projects.proj1.background",
    goals: "projectData.projects.proj1.goals",
    requirements: "projectData.projects.proj1.requirements",
    teamIntro: "projectData.projects.proj1.teamIntro",
    progress: 40,
    recruitingRoles: [
      "projectData.roles.frontend",
      "projectData.roles.uiDesigner",
    ],
    team: [
      {
        name: "projectData.names.qiyueO",
        role: "projectData.teamRoles.initiator",
      },
    ],
    tags: [
      "projectData.tags.quantumComputing",
      "projectData.tags.webDev",
      "projectData.tags.education",
    ],
    isIncubated: true,
    isPinned: true,
    isRecruiting: true,
    reports: [
      {
        title: "projectData.reports.proj1r0.title",
        content: "projectData.reports.proj1r0.content",
        revision: 0,
        date: "2026-07-01",
      },
      {
        title: "projectData.reports.proj1r1.title",
        content: "projectData.reports.proj1r1.content",
        revision: 1,
        date: "2026-07-15",
      },
    ],
    createdAt: "2026-07-01",
  },
  {
    id: "proj-2",
    name: "projectData.projects.proj2.name",
    initiatorName: "projectData.names.qiyueMoran",
    type: "recruiting",
    background: "projectData.projects.proj2.background",
    goals: "projectData.projects.proj2.goals",
    requirements: "projectData.projects.proj2.requirements",
    teamIntro: "projectData.projects.proj2.teamIntro",
    progress: 20,
    recruitingRoles: [
      "projectData.roles.backend",
      "projectData.roles.contentEditor",
    ],
    team: [
      {
        name: "projectData.names.qiyueMoran",
        role: "projectData.teamRoles.initiator",
      },
    ],
    tags: [
      "projectData.tags.knowledgeGraph",
      "projectData.tags.python",
      "projectData.tags.community",
    ],
    isIncubated: false,
    isPinned: false,
    isRecruiting: true,
    reports: [
      {
        title: "projectData.reports.proj2r0.title",
        content: "projectData.reports.proj2r0.content",
        revision: 0,
        date: "2026-07-20",
      },
    ],
    createdAt: "2026-07-20",
  },
  {
    id: "proj-3",
    name: "projectData.projects.proj3.name",
    initiatorName: "projectData.names.qiyueHua",
    type: "showcase",
    background: "projectData.projects.proj3.background",
    goals: "projectData.projects.proj3.goals",
    requirements: "projectData.projects.proj3.requirements",
    teamIntro: "projectData.projects.proj3.teamIntro",
    progress: 50,
    recruitingRoles: [],
    team: [
      {
        name: "projectData.names.qiyueHua",
        role: "projectData.teamRoles.generalPlanner",
      },
      {
        name: "projectData.names.wang",
        role: "projectData.teamRoles.animation",
      },
      { name: "projectData.names.li", role: "projectData.teamRoles.voice" },
    ],
    tags: [
      "projectData.tags.popularScience",
      "projectData.tags.video",
      "projectData.tags.education",
    ],
    isIncubated: true,
    isPinned: false,
    isRecruiting: false,
    reports: [
      {
        title: "projectData.reports.proj3r0.title",
        content: "projectData.reports.proj3r0.content",
        revision: 0,
        date: "2026-06-15",
      },
      {
        title: "projectData.reports.proj3r1.title",
        content: "projectData.reports.proj3r1.content",
        revision: 1,
        date: "2026-07-10",
      },
    ],
    createdAt: "2026-06-01",
  },
  {
    id: "proj-4",
    name: "projectData.projects.proj4.name",
    initiatorName: "projectData.names.astronomyFan",
    type: "showcase",
    background: "projectData.projects.proj4.background",
    goals: "projectData.projects.proj4.goals",
    requirements: "projectData.projects.proj4.requirements",
    teamIntro: "projectData.projects.proj4.teamIntro",
    progress: 75,
    recruitingRoles: [],
    team: [
      {
        name: "projectData.names.astronomyFan",
        role: "projectData.teamRoles.initiator",
      },
      {
        name: "projectData.names.zhang",
        role: "projectData.teamRoles.dataProcessing",
      },
    ],
    tags: [
      "projectData.tags.astronomy",
      "projectData.tags.dataVisualization",
      "projectData.tags.threeJs",
    ],
    isIncubated: false,
    isPinned: false,
    isRecruiting: false,
    reports: [
      {
        title: "projectData.reports.proj4r0.title",
        content: "projectData.reports.proj4r0.content",
        revision: 0,
        date: "2026-06-20",
      },
      {
        title: "projectData.reports.proj4r1.title",
        content: "projectData.reports.proj4r1.content",
        revision: 1,
        date: "2026-07-05",
      },
      {
        title: "projectData.reports.proj4r2.title",
        content: "projectData.reports.proj4r2.content",
        revision: 2,
        date: "2026-07-25",
      },
    ],
    createdAt: "2026-06-20",
  },
];
