import { FormArray, FormControl } from '@angular/forms';

import { ARTEFACT_STATUS_OPTIONS } from '@constants/app.constants';
import {
  Entity,
  EntityList,
  EntityParams,
  FormControlMap,
  Media
} from '@models/common.model';
import { DynamicField, FIELD_TYPE } from '@vc-libs/types';

export interface Artefact extends Entity {
  _id: string;
  title: string;
  accessionNo: string;
  credit: string;
  artistId: string;
  placeOfOrigin: string;
  originYear: string;
  categoryId: string;
  dimensions: string;
  medium: string;
  headingId?: string[];
  description: string;
  keyword?: string[];
  auctionHistory?: AuctionHistoryEntity[];
  insuranceHistory?: InsuranceHistoryEntity[];
  isActive: boolean;
  isDeleted: boolean;
  isDownload: boolean;
  uploadMedia?: string[];
  createdAt: string;
  updatedAt: string;
  image: string;
  previewFields: string[] | PreviewFields;
  metaData: Array<{
    displayLabel: string;
    value: string;
    label?: string;
    _id?: string;
  }>;
  id: string;
  url?: string;
  listUrl: string;
  artistName: string;
  categoryName: string;
  headingName?: string[];
  galleryName: string[];
}

interface PreviewFields {
  metaData: string[];
  predefined: string[];
}

export interface AuctionHistoryEntity {
  auctionHouse: string;
  location: string;
  notes: string;
  dateOfPurchase: string;
  purchasePrice: number;
  tax: number;
  currency: string;
  transportCost: number;
  totalCost: number;
  _id: string;
}

export interface InsuranceHistoryEntity {
  insurance: string;
  value: number;
  currency: string;
  date: string;
  valuedBy: number;
  notes: string;
  _id: string;
}

export interface CreateArtefact {
  isActive: boolean;
  name: string;
}

export interface ArtefactListQueryParams extends EntityParams {
  artefactId: string;
}

export interface ArtefactList extends EntityList<Artefact> {}

export type AddArtefactForm = FormControlMap<CreateArtefact>;

export interface ArtefactDetail extends Artefact {
  dimension: string;
  originYear: string;
  accessionNo: string;
  credit: string;
  placeOfOrigin: string;
  medium: string;
  status: (typeof ARTEFACT_STATUS_OPTIONS)[number]['value'];
  isDownload: boolean;
  auctionHistory: AuctionHistoryEntity[];
  insuranceHistory: InsuranceHistoryEntity[];
  metaData: Array<{
    displayLabel: string;
    value: string;
    label: string;
    _id: string;
  }>;
  tabs: Array<{
    title: string;
    fields: Array<{
      title: string;
      value: string;
    }>;
  }>;
}

export interface ArtefactTab {
  label: string;
  fields: DynamicField[];
}

export interface ArtefactFormField {
  label: FormControl<string>;
  inputType: FormControl<`${FIELD_TYPE}`>;
  isRequired: FormControl<boolean>;
  isVisible: FormControl<boolean>;
  characterLimit: FormControl<number | null>;
  sequence: FormControl<string>;
  options: FormControl<string>;
}

export type ArtefactMediaFormControl = FormControl<Media>;
export type ArtefactMediaArray = FormArray<ArtefactMediaFormControl>;

export interface ArtefactMetaData {
  metaData: MetaData;
  previewFields?: string[];
}

export interface MetaData {
  commentary: string;
  additionalInfo: string;
  literaturePress: string;
  providence?: string;
  provenience?: string;
  conservation: string;
  loanTo: string;
  condition: string;
  publication: string;
  exhibition: string;
}

export interface MediaList {
  mediaType: string;
  url: string;
  coverUrl: string;
  isPreview: boolean;
  isDownload: boolean;
  tabName: string;
  isDeleted: boolean;
  isActive: boolean;
  _id: string;
  index: number;
  base64: string;
}

export type AllArtefactList = Pick<
  Artefact,
  '_id' | 'title' | 'description' | 'url' | 'accessionNo'
>;

export interface RejectedLog {
  _id: string;
  artefactId: string;
  message: string;
  createdAt: string;
  artefact: string;
  userName: string;
  userId: string;
}

export interface RejectedLogList extends EntityList<RejectedLog> {}

export interface ImportArtefactError {
  index: number;
  code: number;
  errMsg: string;
  path: string;
  accessionNo: string;
  title: string;
  name: string;
}
