import { METADATA_TYPES } from '@constants/app.constants';
import { LABEL_TYPE, METADATA_TABS } from '@constants/app.enums';
import { ArtefactTab } from '@models/artefact.model';
import {
  Entity,
  EntityList,
  EntityParams,
  FormControlMap
} from '@models/common.model';
import { FIELD_TYPE } from '@vc-libs/types';

export interface Metadata extends Entity {
  type: (typeof METADATA_TYPES)[number]['value'];
  status: boolean;
  tabs: ArtefactTab[];
}

export interface CreateMetadata
  extends Omit<Metadata, '_id' | 'created_at' | 'action'> {}

export interface MetadataListQueryParams extends EntityParams {
  metadataTypeId: string;
}

export interface MetadataList extends EntityList<Metadata> {}

export type AddMetadataForm = FormControlMap<CreateMetadata>;

export interface MetadataDetail extends Metadata {}

export interface MetadataForm {
  type: `${FIELD_TYPE}`;
  _id: string;
  formType: METADATA_TABS;
  displayLabel: string;
  label: string;
  inputType: `${FIELD_TYPE}`;
  values: string[] | string;
  isRequired: boolean;
  sequence: string;
  isVisible: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  characterLimit: number;
  labelType: LABEL_TYPE;
}
