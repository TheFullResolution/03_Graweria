/* global UNKNOWN */

"use strict";
var gulp = require('gulp'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        maps = require('gulp-sourcemaps'),
        cssnano = require('gulp-cssnano'),
        htmlreplace = require('gulp-html-replace'),
        del = require('del'),
        imageResize = require('gulp-image-resize'),
        imagemin = require('gulp-imagemin'),
        changed = require('gulp-changed'),
        pngquant = require('imagemin-pngquant'),
        chmod = require('gulp-chmod'),
        fs = require('fs'),
        postcss = require('gulp-postcss'),
        autoprefixer = require('autoprefixer'),
        mqpacker = require('css-mqpacker'),
        cssnext = require('postcss-cssnext'),
        path = require('path'),
        folders = require('gulp-folders'),
        pathExists = require('path-exists'),
        merge = require('merge-stream')
        ;



/********************SCRIPTS FOR IMAGES***************************/

var resizeImagesRun = function (folder, options) {
    var pathtoresize = path.join(folder, 'new');

    return gulp.src(path.join(pathtoresize, '*.{jpg,JPG}'))
            .pipe(imageResize({width: options.width}))
            .pipe(imagemin({
                progressive: true,
                interlaced: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
            .pipe(gulp.dest(path.join(folder, options.folder)));
};


var resizeImages = function (folder) {
    var small = {
        width: 420,
        folder: '/small'
    };
    var medium = {
        width: 620,
        folder: '/mid'
    };
    var zoom = {
        width: 1080,
        folder: '/zoom'
    };
    return resizeImagesRun(folder, small),
            resizeImagesRun(folder, medium),
            resizeImagesRun(folder, zoom);
};

var jpgNameCheck = function (subfolder, folder) {
    var startPath = path.join('img/new', subfolder, folder);

    var endPath = path.join('img/offer', subfolder, folder);
    var checkPath = path.join(endPath, 'zoom');
    var index = 1, prename = '';

    pathExists(checkPath).then(function (exists) {
        var files = fs.readdirSync(checkPath);
        files.forEach(function (currentFile) {
            var currentIndex = (/^([0-9]+)\.jpg$/i.exec(currentFile) || [, false])[1];
            if (currentIndex && parseInt(currentIndex) >= index) {
                index = ++currentIndex;
            }
        });
    });

    var name = function () {
        if (index < 10) {
            prename = '000';
        } else if (index < 100 && index >= 10) {
            prename = '00';
        } else if (index >= 100) {
            prename = '0';
        }
        return prename + index++;
    };
    return gulp.src(path.join(startPath, '*.{jpg,JPG}'))
            .pipe(chmod(666))
            .pipe(rename(function (path) {
                path.basename = name();
                path.dirname += '/new';
                path.extname = ".jpg";
                return path;
            }))
            .pipe(gulp.dest(endPath));
};


function getFolders(dir) {
    return fs.readdirSync(dir)
            .filter(function (file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
}



gulp.task('images-new', function () {
    var newPath = 'img/new';
    var folders = getFolders(newPath);

    var tasks = folders.map(function (folder) {
        var subfolders = getFolders(path.join(newPath, folder));
        subfolders.map(function (subfolder) {
            return jpgNameCheck(folder, subfolder);
        });
    });
    return tasks;
});


gulp.task('images-resize', function () {
    var offerPath = 'img/offer';
    var folders = getFolders(offerPath);

    var tasks = folders.map(function (folder) {
        var subfolders = getFolders(path.join(offerPath, folder));
        subfolders.map(function (subfolder) {
            var pathResize = path.join(offerPath, folder, subfolder);
            return resizeImages(pathResize);
        });
    });
    return tasks;
});

gulp.task('images-clean', function () {
    var offerPath = 'img/offer';
    var newPath = 'img/new';

    var foldersOffer = getFolders(offerPath);
    var foldersNew = getFolders(newPath);

    var tasksCleanOffer = foldersOffer.map(function (folder) {
        var subfolders = getFolders(path.join(offerPath, folder));
        subfolders.map(function (subfolder) {
            var pathToClean = path.join(offerPath, folder, subfolder, 'new');
            return del(pathToClean);
        });
    });

    return tasksCleanOffer;
});


gulp.task('images-clean-new', function () {
    var offerPath = 'img/offer';
    var newPath = 'img/new';

    var foldersOffer = getFolders(offerPath);
    var foldersNew = getFolders(newPath);

    var tasksCleanNew = foldersNew.map(function (folder) {
        var subfolders = path.join(newPath, folder, '/**/*');
        return del(subfolders);
    });


    return tasksCleanNew;
});



/********************SCRIPTS FOR CODE***************************/

gulp.task("concatScripts", function () {
    return gulp.src([
        'js/jquery-2.2.1.js',
        'js/hammer.min.js',
        'js/vue.min.js',
        'js/vue-router.min.js',
        'js/app.js'
    ])
            .pipe(maps.init())
            .pipe(concat('app.concat.js'))
            .pipe(gulp.dest('js'));
});
gulp.task("minifyScripts", ["concatScripts"], function () {
    return gulp.src("js/app.concat.js")
            .pipe(uglify())
            .pipe(rename('app.min.js'))
            .pipe(gulp.dest('js'));
});
gulp.task("concatCSS", function () {
    return gulp.src([
        'css/normalize.css',
        'css/app.css'
    ])
            .pipe(maps.init())
            .pipe(concat('app.concat.css'))
            .pipe(maps.write('./'))
            .pipe(gulp.dest('css'));
});
gulp.task("minifyCSS", ["concatCSS"], function () {
    return gulp.src("css/app.concat.css")
            .pipe(cssnano({compatibility: 'ie8'}))
            .pipe(rename('app.min.css'))
            .pipe(gulp.dest('css'));
});
gulp.task("build", ['minifyScripts', 'minifyCSS'], function () {
    return gulp.src(["css/app.min.css", "js/app.min.js",
        "img/**", "fonts/**", "favicon.ico", "js/lazysizes.min.js",
        "js/offer.json", "video/**"], {base: './'})
            .pipe(gulp.dest('dist'));
});

gulp.task("buildEn", ['build'], function () {
    return gulp.src(["css/app.min.css", "js/app.min.js",
        "img/**", "fonts/**", "favicon.ico", "js/lazysizes.min.js",
        "js/offer.json", "video/**"], {base: './'})
            .pipe(gulp.dest('dist/en'));
});


gulp.task('replace', function () {
    gulp.src('index.html')
            .pipe(htmlreplace({
                'css': 'css/app.min.css',
                'js': 'js/app.min.js'
            }))
            .pipe(gulp.dest('dist'));
});

gulp.task('replace2', function () {
    gulp.src('en/index.html')
            .pipe(htmlreplace({
                'css': 'css/app.min.css',
                'js': 'js/app.min.js'
            }))
            .pipe(gulp.dest('dist/en'));
});



gulp.task('clean', ['replace', 'replace2'], function () {
    del(['css/app.*.css*', 'js/app.*.js*']);
});
gulp.task("default", ['buildEn'], function () {
    gulp.start('clean');
});



gulp.task('postcss', function () {
    var processors = [
        autoprefixer({browsers: ['last 2 versions', '> 5%']}),
        mqpacker,
        cssnext()
    ];
    return gulp.src('css/app.css')
            .pipe(postcss(processors))
            .pipe(rename('app.post.css'))
            .pipe(gulp.dest('css/'));
});