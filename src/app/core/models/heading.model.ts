import {
  Entity,
  EntityList,
  EntityParams,
  FormControlMap,
  Media
} from '@models/common.model';

export interface Heading extends Entity {
  description: string;
  isVisible: boolean;
  artefactCount: number;
}

export interface CreateHeading {
  headingName: string;
  description?: string;
  banner?: Media;
  isActive?: boolean;
  isVisible: boolean;
}

export interface HeadingListQueryParams extends EntityParams {
  categoryId: string;
}

export interface HeadingList extends EntityList<Heading> {}

export type AddHeadingForm = FormControlMap<CreateHeading>;

export interface HeadingDetail extends CreateHeading {
  _id: string;
}

export interface AllHeadingList {
  headingName: string;
  _id: string;
}
