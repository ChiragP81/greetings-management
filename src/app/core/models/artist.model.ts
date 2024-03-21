import {
  Entity,
  EntityList,
  EntityParams,
  FormControlMap,
  Media
} from '@models/common.model';

export interface Artist extends Entity {
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  avatar: Media | string;
  address: string;
  contact: string;
  displayBio: string;
  biography: string;
  historyOfArtist: string;
  institution: string;
  nationality: string;
  isActive: string;
  status: boolean;
  beginDate: string;
  endDate: string;
  metaData: object;
  signedUrl: string;
  artefactCount: number;
}

export interface CreateArtist
  extends Omit<Artist, '_id' | 'created_at' | 'action' | 'name'> {}

export interface ArtistListQueryParams extends EntityParams {
  artistId: string;
}

export interface ArtistList extends EntityList<Artist> {
  count: number;
}

export type AddArtistForm = FormControlMap<CreateArtist>;

export interface ArtistDetail extends Artist {}

export interface Nationality {
  label: string;
  value: string;
}
