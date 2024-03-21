import { LABEL_TYPE } from '@constants/app.enums';
import { OptionDetail } from '@models/common.model';

export enum FIELD_TYPE {
  Text = 'text',
  TextArea = 'textarea',
  File = 'file',
  Date = 'date',
  Editor = 'editor',
  Select = 'select',
  Radio = 'radio'
}

export interface DynamicField {
  name: string;
  type: `${FIELD_TYPE}`;
  label: string;
  options?: string;
  characterLimit?: number;
  sequence?: string;
  mandatory: boolean;
  isVisible: boolean;
  optionDetail?: OptionDetail[];
  _id?: string;
  values?: string[];
  labelType?: LABEL_TYPE;
  checked?: boolean;
}

export interface AddTabField {
  tabIndex: number;
  fieldName: string;
  fieldTitle: string;
  fieldType: `${FIELD_TYPE}`;
  canValidate: boolean;
  options?: string;
  characterLimit?: number;
  sequence: string;
  mandatory: boolean;
  isVisible: boolean;
  optionDetail?: OptionDetail[];
}

export enum SearchFieldType {
  Text = 'text',
  List = 'list',
  Date = 'date',
  DateRange = 'dateRange'
}

interface BaseSearchField {
  key: string;
  label: string;
  type: SearchFieldType;
}

export interface TextSearchField extends BaseSearchField {
  type: SearchFieldType.Text;
}

export interface DateSearchField extends BaseSearchField {
  type: SearchFieldType.Date;
}

export interface DateRangeSearchField extends BaseSearchField {
  type: SearchFieldType.DateRange;
}

export interface ListSearchField extends BaseSearchField {
  type: SearchFieldType.List;
  list: Array<{
    label: string;
    value: string | number | boolean;
  }>;
}

export type SearchField =
  | TextSearchField
  | DateSearchField
  | ListSearchField
  | DateRangeSearchField;

export interface Section {
  type: string;
  index: number;
  asset: string;
  imagePosition?: string;
  text?: string;
  coverImage?: string;
  title?: string;
  subtitle?: string;
}

export enum SECTION_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
  TEXT = 'text',
  TEXT_WITH_IMAGE = 'textWithImage',
  BANNER = 'banner',
  ARTEFACT = 'artefact'
}
