export interface Community {
  name: string;
  qqGroup?: string;
  desc?: string;
  isQQChannel?: boolean;
}

export interface CommunityCategory {
  label: string;
  intro?: string;
  groups: Community[];
}

export const communityCategories: CommunityCategory[] = [
  {
    label: "team.communities.general.label",
    intro: "team.communities.general.intro",
    groups: [
      {
        name: "team.communities.general.oneGroup.name",
        qqGroup: "366714271",
        desc: "team.communities.general.oneGroup.desc",
      },
      {
        name: "team.communities.general.twoGroup.name",
        qqGroup: "721893894",
      },
      {
        name: "team.communities.general.qqChannel.name",
        qqGroup: "m9o6ainq60",
        desc: "team.communities.general.qqChannel.desc",
        isQQChannel: true,
      },
    ],
  },
  {
    label: "team.communities.grades.label",
    intro: "team.communities.grades.intro",
    groups: [
      {
        name: "team.communities.grades.junior.name",
        qqGroup: "363056472",
        desc: "team.communities.grades.junior.desc",
      },
      {
        name: "team.communities.grades.junior2.name",
        qqGroup: "1073901726",
        desc: "team.communities.grades.junior2.desc",
      },
      {
        name: "team.communities.grades.senior.name",
        qqGroup: "372072947",
        desc: "team.communities.grades.senior.desc",
      },
      {
        name: "team.communities.grades.senior2.name",
        qqGroup: "256659385",
        desc: "team.communities.grades.senior2.desc",
      },
      {
        name: "team.communities.grades.senior3.name",
        qqGroup: "1064820509",
        desc: "team.communities.grades.senior3.desc",
      },
    ],
  },
  {
    label: "team.communities.groups.label",
    intro: "team.communities.groups.intro",
    groups: [
      {
        name: "team.communities.groups.academic.name",
        qqGroup: "312452261",
        desc: "team.communities.groups.academic.desc",
      },
      {
        name: "team.communities.groups.language.name",
        qqGroup: "1003865164",
        desc: "team.communities.groups.language.desc",
      },
    ],
  },
  {
    label: "team.communities.basic.label",
    intro: "team.communities.basic.intro",
    groups: [
      {
        name: "team.communities.basic.math.name",
        qqGroup: "770490104",
        desc: "team.communities.basic.math.desc",
      },
      {
        name: "team.communities.basic.physics.name",
        qqGroup: "474597463",
        desc: "team.communities.basic.physics.desc",
      },
      {
        name: "team.communities.basic.chemistry.name",
        qqGroup: "797809463",
        desc: "team.communities.basic.chemistry.desc",
      },
      {
        name: "team.communities.basic.biology.name",
        qqGroup: "474491954",
        desc: "team.communities.basic.biology.desc",
      },
      {
        name: "team.communities.basic.earth.name",
        qqGroup: "488597861",
        desc: "team.communities.basic.earth.desc",
      },
      {
        name: "team.communities.basic.social.name",
        qqGroup: "1074137843",
        desc: "team.communities.basic.social.desc",
      },
      {
        name: "team.communities.basic.literature.name",
        qqGroup: "1061347240",
        desc: "team.communities.basic.literature.desc",
      },
    ],
  },
  {
    label: "team.communities.applied.label",
    intro: "team.communities.applied.intro",
    groups: [
      {
        name: "team.communities.applied.info.name",
        qqGroup: "1065811436",
        desc: "team.communities.applied.info.desc",
      },
      {
        name: "team.communities.applied.ieee.name",
        qqGroup: "674236993",
        desc: "team.communities.applied.ieee.desc",
      },
      {
        name: "team.communities.applied.chip.name",
        qqGroup: "731119856",
        desc: "team.communities.applied.chip.desc",
      },
      {
        name: "team.communities.applied.engineering.name",
        qqGroup: "1013145192",
        desc: "team.communities.applied.engineering.desc",
      },
      {
        name: "team.communities.applied.agriculture.name",
        qqGroup: "1002523915",
        desc: "team.communities.applied.agriculture.desc",
      },
      {
        name: "team.communities.applied.energy.name",
        qqGroup: "1055594692",
        desc: "team.communities.applied.energy.desc",
      },
      {
        name: "team.communities.applied.lightIndustry.name",
        qqGroup: "685646757",
        desc: "team.communities.applied.lightIndustry.desc",
      },
      {
        name: "team.communities.applied.geoscience.name",
        qqGroup: "815363412",
        desc: "team.communities.applied.geoscience.desc",
      },
      {
        name: "team.communities.applied.medicine.name",
        qqGroup: "3886703984",
        desc: "team.communities.applied.medicine.desc",
      },
      {
        name: "team.communities.applied.clinical.name",
        qqGroup: "895640940",
        desc: "team.communities.applied.clinical.desc",
      },
      {
        name: "team.communities.applied.tcm.name",
        qqGroup: "1059727790",
        desc: "team.communities.applied.tcm.desc",
      },
    ],
  },
  {
    label: "team.communities.hobby.label",
    intro: "team.communities.hobby.intro",
    groups: [
      {
        name: "team.communities.hobby.chess.name",
        qqGroup: "985700579",
        desc: "team.communities.hobby.chess.desc",
      },
      {
        name: "team.communities.hobby.game.name",
        qqGroup: "978318060",
        desc: "team.communities.hobby.game.desc",
      },
      {
        name: "team.communities.hobby.scifi.name",
        qqGroup: "748204727",
        desc: "team.communities.hobby.scifi.desc",
      },
      {
        name: "team.communities.hobby.rhythm.name",
        qqGroup: "1065753583",
        desc: "team.communities.hobby.rhythm.desc",
      },
      {
        name: "team.communities.hobby.cooking.name",
        qqGroup: "980024901",
        desc: "team.communities.hobby.cooking.desc",
      },
      {
        name: "team.communities.hobby.music.name",
        qqGroup: "1056845621",
        desc: "team.communities.hobby.music.desc",
      },
    ],
  },
  {
    label: "team.communities.events.label",
    intro: "",
    groups: [
      {
        name: "team.communities.events.summerCompetition.name",
        qqGroup: "531239738",
        desc: "team.communities.events.summerCompetition.desc",
      },
      {
        name: "team.communities.events.checkin.name",
        qqGroup: "978499742",
        desc: "team.communities.events.checkin.desc",
      },
    ],
  },
  {
    label: "team.communities.legacy.label",
    intro: "team.communities.legacy.intro",
    groups: [
      {
        name: "team.communities.legacy.physicsTribe.name",
        qqGroup: "553659769",
      },
    ],
  },
];

/** 底部注记 */
export const communityNote = "team.communityNote";
