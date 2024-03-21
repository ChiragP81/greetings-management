export enum REGEX_TYPE {
  DECIMAL = 'decimal',
  INTEGER = 'integer'
}

export enum POSITION {
  LEFT = 'left',
  RIGHT = 'right'
}

export enum TOASTER_TYPE {
  INFO = 'info',
  ERROR = 'error',
  WARN = 'warning',
  SUCCESS = 'success'
}

export enum MENU_TYPE {
  SETTINGS = 'settings',
}

export enum LIST_TYPE {
  ACTIVE,
  ARCHIVED
}

export enum MEDIA_TYPE {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  '3D' = '3D',
  DOCUMENT = 'document'
}

export enum ARTEFACT_TABS {
  GENERAL,
  PREVIEW_MEDIA,
  VIDEOS,
  PHOTOS,
  DOCUMENTS,
  AUDIOS,
  METADATA
}

export enum METADATA_TABS {
  ARTEFACT = 'artefact',
  ARTIST = 'artist',
  IMPORT_EXPORT_TEMPLATE = 'importExportTemplate'
}

export enum LABEL_TYPE {
  PREDEFINED = 'predefined',
  METADATA = 'metaData'
}

export enum FIELD_VALUE {
  METADATA_FORM,
  ADD_FIELD
}

export enum HISTORY {
  AUCTION,
  INSURANCE
}

export enum ARTEFACT_MEDIA_FIELD {
  IS_DOWNLOAD = 'isDownload',
  IS_PREVIEW = 'isPreview',
  IS_ACTIVE = 'isActive'
}

export enum HISTORY_EDUCTION_CATEGORIES {
  ARTICLES = 'blog',
  BOOK_LIBRARY = 'book',
  SECTION = 'blogWithSubCategory'
}

export enum HISTORY_EDUCTION_TABS {
  GENERAL,
  SECTION
}
