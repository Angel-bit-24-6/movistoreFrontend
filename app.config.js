// app.config.js
import 'dotenv/config';

export default ({ config }) => {
  const apiUrl = process.env.API_URL ?? config.extra?.apiUrl ?? 'https://movistorebackend.onrender.com/api/v1';

  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl,
    },
    plugins: [
      ...(config.plugins || []),
      'expo-font'
    ],
  };
};
