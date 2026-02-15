const fs = require('fs');
const path = require('path');
const {
  withPlugins,
  withDangerousMod,
  withAppBuildGradle,
  withProjectBuildGradle,
} = require('expo/config-plugins');

const withFfmpegKitIos = (config, { iosUrl }) => {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const { platformProjectRoot } = cfg.modRequest;
      const podspecPath = path.join(
        platformProjectRoot,
        'ffmpeg-kit-ios-full-gpl.podspec',
      );

      const podspec = `
Pod::Spec.new do |s|
  s.name = 'ffmpeg-kit-ios-full-gpl'
  s.version = '6.0' # Must match what ffmpeg-kit-react-native expects for this subspec
  s.summary = 'Custom full-gpl FFmpegKit iOS frameworks from self-hosted source.'
  s.description = 'Custom podspec for ffmpeg-kit full-gpl binaries'
  s.homepage = 'https://github.com/arthenica/ffmpeg-kit'
  s.license = { :type => 'GPL', :file => 'LICENSE' }
  s.author = { 'Arthenica' => 'info@arthenica.com' }
  s.source = { 
    :http => '${iosUrl}',
    :type => 'zip',
    :flatten => true
  }
  s.platform = :ios, '12.1'
  s.ios.deployment_target = '12.1'
  
  s.vendored_frameworks = '*.framework'
  s.library = 'c++', 'z', 'bz2', 'iconv'
  s.frameworks = 'AudioToolbox', 'CoreImage', 'CoreMedia', 'VideoToolbox', 'AVFoundation'
  
  # Disable bitcode
  s.pod_target_xcconfig = {
    'ENABLE_BITCODE' => 'NO'
  }
  
  s.user_target_xcconfig = {
    'ENABLE_BITCODE' => 'NO'
  }
end
`;

      console.log('Creating custom iOS FFmpegKit podspec...');
      fs.writeFileSync(podspecPath, podspec.trim());

      return cfg;
    },
  ]);
};

const withFfmpegKitAndroid = (config, { androidUrl }) => {
  config = withAppBuildGradle(config, (cfg) => {
    let buildGradle = cfg.modResults.contents;

    // Add download task for AAR
    const downloadBlock = `
// Download ffmpeg-kit AAR if not exists
task downloadAar {
    doLast {
        def aarUrl = '${androidUrl}'
        def aarFile = new File(rootProject.projectDir, 'libs/ffmpeg-kit-full-gpl.aar')
        if (!aarFile.exists()) {
            aarFile.parentFile.mkdirs()
            println "Downloading \${aarUrl} to \${aarFile}"
            new URL(aarUrl).withInputStream { i ->
                aarFile.withOutputStream { it << i }
            }
        }
    }
}

// Ensure the download task runs before preBuild
preBuild.dependsOn downloadAar
`;

    // Only add the download block if it doesn't already exist
    if (!buildGradle.includes('def aarUrl =')) {
      buildGradle = buildGradle + '\n' + downloadBlock;
    }

    cfg.modResults.contents = buildGradle;
    return cfg;
  });

  config = withProjectBuildGradle(config, (cfg) => {
    let buildGradle = cfg.modResults.contents;

    // Remove ffmpegKitPackage line if it exists
    buildGradle = buildGradle.replace(
      /^\s*ffmpegKitPackage\s*=\s*"full-gpl"\s*(\r?\n)?/m,
      '',
    );

    // Add flatDir repository
    const projectFlatDirLibsPath = '$rootDir/libs';
    const flatDirString = `        flatDir {\n            dirs "${projectFlatDirLibsPath}"\n        }`;
    const allProjectsRepositoriesRegex =
      /(allprojects\s*\{\s*repositories\s*\{)/;
    const existingFlatDirRegex = new RegExp(
      `allprojects\\s*\\{[\\s\\S]*?repositories\\s*\\{[\\s\\S]*?flatDir\\s*\\{[\\s\\S]*?dirs\\s*['"]${projectFlatDirLibsPath.replace(
        /[$.]/g,
        '\\$&',
      )}['"]`,
    );

    if (!buildGradle.match(existingFlatDirRegex)) {
      const match = buildGradle.match(allProjectsRepositoriesRegex);
      if (match) {
        const insertionPoint = match.index + match[0].length;
        buildGradle =
          buildGradle.substring(0, insertionPoint) +
          '\n' +
          flatDirString +
          buildGradle.substring(insertionPoint);
      }
    }

    cfg.modResults.contents = buildGradle;
    return cfg;
  });

  return config;
};

module.exports = (config, options = {}) => {
  const { iosUrl, androidUrl } = options;

  if (!iosUrl) {
    throw new Error(
      'FFmpeg Kit plugin requires "iosUrl" option. Please provide the iOS download URL in your app.config.ts',
    );
  }

  if (!androidUrl) {
    throw new Error(
      'FFmpeg Kit plugin requires "androidUrl" option. Please provide the Android AAR download URL in your app.config.ts',
    );
  }

  return withPlugins(config, [
    (config) => withFfmpegKitIos(config, { iosUrl }),
    (config) => withFfmpegKitAndroid(config, { androidUrl }),
  ]);
}; 