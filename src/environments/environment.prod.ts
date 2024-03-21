import npm from '../../package.json';

export const environment = {
  production: true,
  type: 'production',
  encryptedKey: process.env.ENCRYPTED_KEY,
  version: npm.version,
  authApi: 'https://sikhhistorymuseum-api.org/auth',
  cmsApi: 'https://sikhhistorymuseum-api.org/cms',
  contributionApi: 'https://sikhhistorymuseum-api.org/contribution',
  collectionApi: 'https://sikhhistorymuseum-api.org/collection',
  museumEduSagaApi: 'https://sikhhistorymuseum-api.org/museum-edu-saga',
  preferredCountries: ['us', 'in'],
  awsUrl: 'https://shm-stg-s3.s3.amazonaws.com/dshm-dev/',
  logo: '/assets/images/logo.svg',
  title: 'Greeting Management Panel',
  email: 'sikhhistorymuseum@gmail.com'
};
