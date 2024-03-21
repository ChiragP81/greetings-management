export interface DashboardCounts {
  category: BasicCount;
  heading: BasicCount;
  artist: BasicCount;
  gallery: BasicCount;
  exhibition: BasicCount;
  user: BasicCount;
  role: BasicCount;
  permission: BasicCount;
  artefact: BasicCount;
  member: BasicCount;
  donation: BasicCount;
}

export interface BasicCount {
  total: number;
  active: number;
  inActive: number;
  deleted?: number;
  approved?: number;
  pending?: number;
  rejected?: number;
}

export interface Artefacts {
  _id: string;
  title: string;
  accessionNo: string;
  status: string;
  updatedAt: string;
  url: string;
}
