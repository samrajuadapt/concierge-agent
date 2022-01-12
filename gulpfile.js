const gulp = require('gulp');
const zip = require('gulp-zip');
var fs = require('fs');
const del = require('del');
var sftp = require('./build-configuration/gulp-sftp-copy');
var ncmd = require('node-cmd');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;

require('events').EventEmitter.prototype._maxListeners = 100;

// Remote Deployment Defaults
var remoteDeploymentDefaultPath = 'C:\\qmatic\\orchestra\\system\\custdeploy';
var remoteDeploymentDefaultLangPath =
  'C:\\qmatic\\orchestra\\system\\conf\\lang';
var remoteDeploymentDefaultHost = 'localhost';
var remoteDeploymentPlatform = 'windows';

// Custom Configuration
// ====================

try {
  var config = require('./gulp.config.json');

  // Must be provided via config.gulp.json file
  var remoteDeployHost = config.remote_deploy.host ?
    config.remote_deploy.host :
    remoteDeploymentDefaultHost;
  var remoteDeployUsername = config.remote_deploy.username;
  var remoteDeployPassword = config.remote_deploy.password;

  // If true will be using local copy instead of sftp 
  var useLocalCopy = config.remote_deploy_method === 'localcopy';

  // Artifactory Deployment (artifactory)
  var targetArtifactoryIp = config.artifactory.host ?
    config.artifactory.host :
    '';
  var targetArtifactoryPath = config.artifactory.path ?
    config.artifactory.path :
    '';
  var targetArtifactoryPort = config.artifactory.port ?
    config.artifactory.port :
    '80';
  var targetArtifactoryProtocol = config.artifactory.protocol ?
    config.artifactory.protocol :
    'http';
  var targetArtifactoryUsername = config.artifactory.username;
  var targetArtifactoryPassword = config.artifactory.password;
  var targetArtifactoryUrl =
    targetArtifactoryProtocol +
    '://' +
    targetArtifactoryIp +
    ':' +
    targetArtifactoryPort;
} catch (ex) {
  // For those who don't provide an external configuration file, use the following default.
  // Assuming Orchestra is running on local machine
  console.log(ex);
}

// Clean up tasks
gulp.task('clean:artifactory', function () {
  return del(['./dist/*', '!./dist/*.zip']);
});

gulp.task('clean:war', function () {
  return del([
    './dist/*',
    '!./dist/properties',
    '!./dist/webapp',
    '!./dist/release-notes',
    '!./dist/utt'
  ]);
});

// Copy properties files
gulp.task('create:properties', function () {
  return gulp.src(['./src/assets/i18n/*']).pipe(gulp.dest('./dist/properties'));
});

// Copy release notes
gulp.task('create:release-notes', function () {
  return gulp.src(['release-notes/**']).pipe(gulp.dest('dist/release-notes/'));
});

// Create war
gulp.task('create:war', function () {
  return gulp
    .src(['./dist/**/*'])
    .pipe(zip('connectconcierge.war'))
    .pipe(gulp.dest('./dist/webapp/'));
});

// create Concierge utt files
gulp.task('create:uttConcierge', function () {
  return gulp
    .src(['./utt/mobileconnect-concierge/*'])
    .pipe(zip('ServicePoint_Concierge.utt'))
    .pipe(gulp.dest('./dist/utt/'));
});

// create Concierge-tpbutton utt files
gulp.task('create:uttTpButton', function () {
  return gulp
    .src(['./utt/mobileconnect-concierge-tpbutton/*'])
    .pipe(zip('ServicePoint_ConciergeButton.utt'))
    .pipe(gulp.dest('./dist/utt/'));
});

// create Concierge-tpTouch utt files
gulp.task('create:uttTpTouch', function () {
  return gulp
    .src(['./utt/mobileconnect-concierge-tptouch/*'])
    .pipe(zip('ServicePoint_ConciergeTouch.utt'))
    .pipe(gulp.dest('./dist/utt/'));
});

// Create artifcatory zip
gulp.task('create:artifactory:zip', function () {
  try {
    var appData = getVersionInfo();
    if (appData) {
      var version = appData.version;
      return gulp
        .src(['dist/**/*'])
        .pipe(zip('Concierge-' + version + '.zip'))
        .pipe(gulp.dest('dist/'));
    }
  } catch (ex) {
    console.log(
      'There was an exception when trying to read the package.json! - ' + ex
    );
    return false;
  }
});

// Write to manifest file
gulp.task('write:manifest', done => {
  try {
    var versionInfo = getVersionInfo();
    if (versionInfo) {
      var fileContent = 'Build-Date: ' + new Date().toISOString().substring(0, 10) + '\r\n';
      fileContent += 'Product-Name: Connect Concierge' + '\r\n';
      fileContent += 'Build-Version: ' + versionInfo.version + '\r\n';
      writeFile('./src/META-INF/MANIFEST.MF', fileContent);
      //return true;
    }
  } catch (ex) {
    console.log(
      'There was an exception when trying to read the package.json! - ' + ex
    );
    //return false;
  }
  done();
});

// Write to manifest file
gulp.task('write:config', done => {
  try {
    var versionInfo = getVersionInfo();
    if (versionInfo) {
      var fileContent = 'app_version = '  + versionInfo.version + '\r\n';
      fileContent += 'native_loader_enabled = true';
      fs.writeFileSync('./src/config.properties', fileContent);
      done();
      return true;
    }
  } catch (ex) {
    console.log(
      'There was an exception when trying to write the config.properties - ' + ex
    );
    return false;
  }
  done();
});

// Set app version ***************************************

gulp.task('set:appVersion', done => {
  try {
    var pageData = fs.readFileSync('./src/app/components/containers/qm-home-menu/qm-home-menu.component.html');
    var versionInfo = getVersionInfo();
    if (versionInfo && pageData) {
      pageData = pageData.toString().replace('%APP_VERSION%', ' (Concierge ' + versionInfo.version + ') ');
      fs.writeFileSync('./src/app/components/containers/qm-home-menu/qm-home-menu.component.html', pageData);
      done();
      return true;
    }
  } catch (ex) {
    console.log(
      'There was an exception when trying to read the property file or package.json - ' + ex
    );
    done();
    return false;
  }
});

gulp.task('reset:appVersion', done => {
  try {
    var pageData = fs.readFileSync('./src/app/components/containers/qm-home-menu/qm-home-menu.component.html');
    var versionInfo = getVersionInfo();
    if (versionInfo && pageData) {
      pageData = pageData.toString().replace(' (Concierge ' + versionInfo.version + ') ' ,'%APP_VERSION%');
      fs.writeFileSync('./src/app/components/containers/qm-home-menu/qm-home-menu.component.html', pageData);
      done();
      return true;
    }
  } catch (ex) {
    console.log(
      'There was an exception when trying to read the property file or package.json - ' + ex
    );
    done();
    return false;
  }
});

function getVersionInfo() {
  var appData = JSON.parse(fs.readFileSync('./package.json'));
  if (appData) {
    return {
      versionPrefix: appData.version,
      version: appData.version + '.' + appData.build,
      build: appData.build
    };
  }
  return null;
}

function writeFile(path, contents, cb = () => { }) {
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);

    fs.writeFile(path, contents, cb);
  });
}

// Deploy build to orchestra
gulp.task('deploy:war', function () {
  if (!useLocalCopy) {
    return gulp.src('./dist/webapp/connectconcierge.war').pipe(
      sftp({
        remotePath: remoteDeploymentDefaultPath,
        remotePlatform: 'windows',
        agentForward: true,
        host: remoteDeployHost,
        user: remoteDeployUsername,
        pass: remoteDeployPassword,
        timeout: 9999999
      })
    );
  } else {
    return gulp.src('./dist/webapp/connectconcierge.war').pipe(gulp.dest(remoteDeploymentDefaultPath));
  }
});

// Deploy build to artifactory
gulp.task('deploy:war:artifactory', function () {
  var warName = fs.readdirSync('./dist')[0];
  var fileExtension = warName.substring(warName.lastIndexOf('.') + 1);
  if (fileExtension === 'zip') {
    ncmd.get(
      `curl -u ${targetArtifactoryUsername}:${targetArtifactoryPassword} -X PUT ${targetArtifactoryUrl}${targetArtifactoryPath}/${warName} -T ./dist/${warName}`,
      function (err, data, stderr) {
        if (!err) {
          console.log(data);
        } else {
          console.log(err);
        }
      }
    );
  } else {
    console.log('War file not found!!');
  }
});

// Deploy lang file to orchestra
gulp.task('deploy:lang', function () {
  if (!useLocalCopy) {

    return gulp
      .src('./dist/properties/connectConciergeMessages.properties')
      .pipe(
        sftp({
          remotePath: remoteDeploymentDefaultLangPath,
          remotePlatform: remoteDeploymentPlatform,
          host: remoteDeployHost,
          user: remoteDeployUsername,
          pass: remoteDeployPassword,
          timeout: 9999999
        })
      );
  } else {
    return gulp
      .src('./dist/properties/connectConciergeMessages.properties')
      .pipe(gulp.dest(remoteDeploymentDefaultPath));
  }

});


/**
 * Create Utt files build war
 */
gulp.task(
  'create:utt',
  gulp.series('create:uttConcierge', 'create:uttTpButton', 'create:uttTpTouch')
);


/**
 * Create Dev/Prod build war
 */
gulp.task(
  'build:war:properties',
  gulp.series('create:war', 'create:utt', 'create:properties', 'clean:war', 'reset:appVersion')
);

/**
 * Build war and deploy war/lang
 */
gulp.task(
  'build:war:deploy',
  gulp.series('build:war:properties', 'deploy:war', 'deploy:lang')
);

/**
 * Create Artifactory build
 */
gulp.task(
  'build:artifactory',
  gulp.series('write:manifest',
    'create:war',
    'create:utt',
    'create:properties',
    'create:release-notes',
    'clean:war',
    'create:artifactory:zip',
    'clean:artifactory',
    'reset:appVersion')
);

/**
 * Create Artifactory build and deploy
 */
gulp.task(
  'build:artifactory:deploy',
  gulp.series('build:artifactory', 'deploy:war:artifactory')
);
