export interface QaDraft {
  title: string;
  situation: string;
  detail: string;
  bountyPeople: number | null;
  bountyPerPerson: number | null;
  images: string[];
}

export const QA_DRAFT_STORAGE_KEY = "lkm-qa-draft";

export function parseDraft(raw: string | null): QaDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<QaDraft>;
    if (typeof value !== "object" || value === null) return null;
    return {
      title: typeof value.title === "string" ? value.title : "",
      situation: typeof value.situation === "string" ? value.situation : "",
      detail: typeof value.detail === "string" ? value.detail : "",
      bountyPeople:
        typeof value.bountyPeople === "number" ? value.bountyPeople : null,
      bountyPerPerson:
        typeof value.bountyPerPerson === "number"
          ? value.bountyPerPerson
          : null,
      images: Array.isArray(value.images)
        ? value.images.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
    };
  } catch {
    return null;
  }
}

export function serializeDraft(draft: QaDraft): string {
  return JSON.stringify(draft);
}

export function computeTotalBounty(
  people: number | null,
  perPerson: number | null,
): number {
  return (people ?? 0) * (perPerson ?? 0);
}
