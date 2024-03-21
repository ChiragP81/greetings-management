import npm from '../../package.json';

export const environment = {
  production: true,
  type: 'uat',
  encryptedKey: process.env.ENCRYPTED_KEY,
  version: npm.version,
  authApi: 'https://demo-shm-api.focalat.com/auth',
  cmsApi: 'https://demo-shm-api.focalat.com/cms',
  contributionApi: 'https://demo-shm-api.focalat.com/contribution',
  collectionApi: 'https://demo-shm-api.focalat.com/collection',
  museumEduSagaApi: 'https://demo-shm-api.focalat.com/museum-edu-saga',
  preferredCountries: ['us', 'in'],
  awsUrl: 'https://new-shm-demo.s3.amazonaws.com/dshm-dev/',
  logo: '/assets/images/demo-logo.svg',
  title: 'Jayalakshmi Vilas',
  email: 'jayalakshmivilas@museum.com'
};
