import {
  Entity,
  EntityList,
  EntityParams,
  FormControlMap,
  Media
} from '@models/common.model';
import { MetadataService } from '@services/metadata.service';

export interface Category extends Entity {
  description: string;
  artefactCount: number;
}

export interface CreateCategory {
  categoryName: string;
  banner?: Media;
  isActive?: boolean;
  description?: string;
}

export interface CategoryListQueryParams extends EntityParams {
  categoryId: string;
}

export interface CategoryList extends EntityList<Category> {}

export type AddCategoryForm = FormControlMap<CreateCategory>;

export interface CategoryDetail extends CreateCategory {
  _id: string;
}

export interface AllCategoryList {
  categoryName: string;
  _id: string;
}

export const METADATA_TEMPLATE_SERVICE_MAP = {
  artefact: MetadataService
};
