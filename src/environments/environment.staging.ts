import npm from '../../package.json';

export const environment = {
  production: false,
  type: 'staging',
  encryptedKey: process.env.ENCRYPTED_KEY,
  version: npm.version,
  authApi: 'http://localhost:3000',
  cmsApi: 'https://sikh-api.focalat.com/cms',
  contributionApi: 'https://sikh-api.focalat.com/contribution',
  collectionApi: 'http://localhost:3001',
  museumEduSagaApi: 'https://sikh-api.focalat.com/museum-edu-saga',
  preferredCountries: ['us', 'in'],
  awsUrl: 'https://shm-stg.s3.ap-south-1.amazonaws.com/',
  logo: '/assets/images/logo.svg',
  title: 'Greeting Management Panel',
  email: 'sikhhistorymuseum@gmail.com'
};
