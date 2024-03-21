import npm from '../../package.json';

export const environment = {
  production: true,
  type: 'uat',
  encryptedKey: process.env.ENCRYPTED_KEY,
  version: npm.version,
  authApi: 'https://stg-api.sikhhistorymuseum.org/auth',
  cmsApi: 'https://stg-api.sikhhistorymuseum.org/cms',
  contributionApi: 'https://stg-api.sikhhistorymuseum.org/contribution',
  collectionApi: 'https://stg-api.sikhhistorymuseum.org/collection',
  museumEduSagaApi: 'https://stg-api.sikhhistorymuseum.org/museum-edu-saga',
  preferredCountries: ['us', 'in'],
  awsUrl: 'https://shm-stg-s3.s3.amazonaws.com/dshm-dev/',
  logo: '/assets/images/greetings.svg',
  title: 'Greeting Management Panel',
  email: 'sikhhistorymuseum@gmail.com'
};
