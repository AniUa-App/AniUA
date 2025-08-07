const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const withFileOpener = (config) => {
  // Android налаштування
  config = withAndroidManifest(config, (config) => {
    const { modResults } = config;
    
    // Додаємо FileProvider якщо його ще немає
    const application = modResults.manifest.application[0];
    const hasFileProvider = application.provider?.some(
      provider => provider.$['android:name'] === 'androidx.core.content.FileProvider'
    );
    
    if (!hasFileProvider) {
      if (!application.provider) {
        application.provider = [];
      }
      
      application.provider.push({
        $: {
          'android:name': 'androidx.core.content.FileProvider',
          'android:authorities': '${applicationId}.fileprovider',
          'android:exported': 'false',
          'android:grantUriPermissions': 'true'
        },
        'meta-data': [{
          $: {
            'android:name': 'android.support.FILE_PROVIDER_PATHS',
            'android:resource': '@xml/file_paths'
          }
        }]
      });
    }
    
    return config;
  });
  
  return config;
};

module.exports = withFileOpener; 