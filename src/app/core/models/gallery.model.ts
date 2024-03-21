import {
  Entity,
  EntityList,
  EntityParams,
  FormControlMap,
  Media
} from '@models/common.model';
import { AllArtefactList } from './artefact.model';

export interface Gallery extends Entity {
  artefactCount: number;
}

export interface CreateGallery {
  isActive: boolean;
  isVisible: boolean;
  galleryName: string;
  galleryDescription: string;
  banner: Media;
  thumbnailImage: Media;
  artefactId: string[];
}

export interface GalleryListQueryParams extends EntityParams {
  galleryId: string;
}

export interface GalleryList extends EntityList<Gallery> {}

export type AddGalleryForm = FormControlMap<CreateGallery>;

export interface GalleryDetail extends CreateGallery {
  artefacts: AllArtefactList[];
  _id: string;
}

export interface AllGalleryList {
  galleryName: string;
  _id: string;
}
