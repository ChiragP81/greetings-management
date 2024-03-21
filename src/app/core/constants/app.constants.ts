/* eslint-disable max-len, no-magic-numbers */
import { Toolbar } from 'ngx-editor';

export const LANGUAGES = [
  { value: 'en_US', label: 'English', flagUrl: '/assets/images/flags/en.svg' },
  { value: 'de_CH', label: 'German', flagUrl: '/assets/images/flags/de.svg' }
] as const;

export const APP = {
  SUPPORT_EMAIL: 'sikhhistorymuseum@gmail.com',
  PAGE_OPTIONS: [10, 25, 50, 100],
  PAGE_SIZE: 10,
  PAGE_INDEX: 1,
  TIME_DELAY: 1500,
  DEBOUNCE_TIME: 500,
  LOGOUT: 'logout',
  MIN_SEARCH_LEN: 4,
  TIMEOUT: 0,
  LANGUAGE: LANGUAGES[0].value,
  IMAGE_TYPE: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  MAX_IMAGE_SIZE: 5242880, // 5MB
  CURRENCY_SYMBOL: '$',
  DIALOG_WIDTH: '400px',
  POPUP_WIDTH: '1024px',
  VIDEO_TYPE: ['video/mp4', 'video/webm', 'video/quicktime'],
  MAX_VIDEO_SIZE: 52428800, // 50MB
  DOCUMENT_TYPE: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  '3D_TYPE': ['model/gltf-binary'],
  EXCEL_TYPE: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  MAX_DOCUMENT_SIZE: 52428800, // 50MB
  AUDIO_TYPE: [
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/wav',
    'audio/aac',
    'audio/vnd.dlna.adts',
    'audio/x-aac'
  ],
  MAX_AUDIO_SIZE: 5242880, // 5MB
  MAX_3D_SIZE: 52428800, // 50MB
  BYTES_PER_KB: 1024,
  DESCRIPTION_MAX_LENGTH: 100
};

export const REGEX = {
  EMAIL:
    /^[\p{L}\d!#$%&'*+=?^_`{|}~-]+(?:\.[\p{L}\d!#$%&'*+=?^_`{|}~-]+)*@(?:[_\p{L}\d][-_\p{L}\d]*\.)*(?:[\p{L}\d][-\p{L}\d]{0,62})\.(?:(?:[a-z]{2}\.)?[a-z]{2,})$/iu,
  PASSWORD: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{8,16}$/,
  INTEGER: /^\d*$/,
  DECIMAL: /^\d*\.?\d*$/,
  INSTAGRAM:
    /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9_.-]+)\/?$/,
  TWITTER: /http(?:s)?:\/\/(?:www\.)?twitter\.com\/(\w+)/,
  LINKEDIN: /http(?:s)?:\/\/[a-z]{2,3}\.linkedin\.com\/.*/,
  FACEBOOK: /http(?:s)?:\/\/(www|m)\.facebook\.com\/(.*)/,
  YOUTUBE:
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|playlist\?list=)|youtu\.be\/|youtube\.com\/channel\/)([a-zA-Z0-9_-]{11}|[a-zA-Z0-9_-]{24})/,
  URL: /^(https):\/\/(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost)(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/
};

export const SORT_OPTIONS = [
  { value: 'desc', label: 'descending' },
  { value: 'asc', label: 'ascending' }
];

export const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'creator', label: 'Creator' },
  { value: 'approver', label: 'Approver' },
  { value: 'curator', label: 'Curator' }
];

export const SALUTATIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' }
];

export const STATUS = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' }
];

export const YES_NO_OPTIONS = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' }
];

export const VIEW_OPTIONS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'detail', label: 'Detail' },
  { value: 'image', label: 'Image' }
] as const;

export const NEW_CLONE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'clone', label: 'Clone' }
] as const;

export const METADATA_TYPES = [
  { value: 'artefact', label: 'Artefact' },
  { value: 'artist', label: 'Artist' },
  { value: 'category', label: 'Category' },
  { value: 'heading', label: 'Heading' }
] as const;

export const ARTEFACT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export const MEDIA_EXTENSION = {
  VIDEO: 'mp4, mov and webm',
  IMAGE: 'jpeg, jpg, png and webp',
  DOCUMENT: 'pdf, doc and docx',
  AUDIO: 'mp3, ogg, aac and wav',
  '3D': 'glb, fbx',
  XLSX: 'xlsx'
};

export const SUPPORTED_VIDEO_TYPES = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm'
};

export const SUPPORTED_AUDIO_TYPES = {
  mp3: 'audio/mp3',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  wav: 'audio/wav'
};

export const MEDIA_SIZE = {
  VIDEO: 50,
  '3D': 50,
  IMAGE: 5,
  DOCUMENT: 50,
  AUDIO: 5,
  CATEGORY_ITEM: 5,
  THUMBNAIL_IMAGE: 2
};

export const MEDIA_RATIO = {
  HOME_LOGO: '64x54',
  CATEGORY_ICON: '50x50',
  HEADING: '330x200',
  GALLERY_BANNER: '1400x750',
  GALLERY_THUMBNAIL: '260x315',
  ARTEFACT_COVER_IMAGE: '570x570',
  ARTEFACT_IMAGE: '330X185',
  EXHIBITION_LIST: '440x315',
  EXHIBITION_BANNER: '1410x450',
  MISSION: '450x450',
  HOME_JOURNEY: '1410x590',
  HOME_CONTRIBUTE: '680x380',
  ABOUT: '800x455',
  OFFER: '450x200',
  ABOUT_FOUNDER: '450x435',
  CONTRIBUTE: '430x195',
  ARTICLE: '330x300',
  BOOK: '210x295',
  DYNAMIC_VIDEO: '1410x740',
  DYNAMIC_IMAGE: '1200x670',
  DYNAMIC_TEXT_IMAGE: '450x450'
};

export const MEDIA_TABS = {
  PREVIEW_MEDIA: 'previewMedia',
  VIDEO: 'video',
  PHOTO: 'photo',
  DOCUMENT: 'document',
  AUDIO: 'audio'
};

export const TOTAL_PERCENT = 100;

export const HISTORY_AND_EDUCATION_PAGES = [
  { value: 'articles', label: 'Articles' },
  { value: 'book-lib', label: 'Book Library' },
  { value: 'sacred-lib', label: 'Sacred Library' },
  { value: 'section', label: 'History Education' }
] as const;

export const CMS_PAGES = [
  { value: 'home', label: 'Home' },
  { value: 'about-us', label: 'About Us' },
  { value: 'contribute', label: 'Contribute' },
  { value: 'contact-us', label: 'Contact Us' },
  { value: 'terms-and-conditions', label: 'Terms & Conditions' },
  { value: 'privacy-policy', label: 'Privacy & Policy' }
] as const;

export const HOME_PAGES = [
  { value: 'home-videos', label: 'Home Page Videos' },
  { value: 'mission', label: 'Mission' },
  { value: 'journey-through-time', label: 'Home Journey Through Time' },
  { value: 'home-art-gallery', label: 'Sikh Art Gallery' },
  { value: 'home-art-collection', label: 'Sikh Art Collection' },
  { value: 'home-contribute', label: 'Home Contribute' }
] as const;

export const ABOUT_US_PAGES = [
  { value: 'details', label: 'Details' },
  { value: 'offer', label: 'Offer' },
  { value: 'about-founder', label: 'About Founder' },
  { value: 'contact-us', label: 'Contact Us' }
] as const;

export const ARTIST_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

export const TOOLBAR_CONFIG = [
  ['bold', 'italic'],
  ['underline', 'strike'],
  ['code', 'blockquote'],
  ['ordered_list', 'bullet_list'],
  [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
  ['link', 'image'],
  ['text_color', 'background_color'],
  ['align_left', 'align_center', 'align_right', 'align_justify']
] as Toolbar;

export const END_OF_DAY_HOURS = 23;
export const END_OF_DAY_MINUTES = 59;
export const END_OF_DAY_SECONDS = 59;
export const END_OF_DAY_MILLISECONDS = 999;
export const MINUTE_MILLISECONDS = 60000;

export const ACTIVITY_LOGGER_TYPE = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' }
];

export const READ_UNREAD_FLAG = [
  { value: true, label: 'Read' },
  { value: false, label: 'Unread' }
];

export const METADATA_TEMPLATE_TYPE = [
  { value: 'artefact', label: 'Artefact' }
];

export const SUBSCRIPTION_TYPES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'ONE_TIME', label: 'One time' }
];

export const PAYMENT_STATUSES = [
  { value: 'uninitialized', label: 'Uninitialized' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'processing', label: 'Processing' },
  { value: 'requires_action', label: 'Requires Action' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'requires_payment_method', label: 'Failed' }
];

export const PAYMENT_METHODS = [
  { value: 'card', label: 'Card' },
  { value: 'cashapp', label: 'Cash App' },
  { value: 'link', label: 'Link' }
];

export const CHECKOUT_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'complete', label: 'Complete' },
  { value: 'expired', label: 'Expired' }
];
