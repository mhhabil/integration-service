const whitelist = [
  'http://127.0.0.1:3111',
  'http://localhost:3111',
  'https://integration-fe-uhfll65gkq-et.a.run.app',
];

const allowedUrl = process.env.ALLOWED_URL;

if (allowedUrl) {
  whitelist.push(allowedUrl);
}

export default whitelist;
