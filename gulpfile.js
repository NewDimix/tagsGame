const gulp = require('gulp');
const fileinclude = require('gulp-file-include'); // модульный html
const stylus = require('gulp-stylus'); // преобразует из .styl в .css
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer'); // добавляет автопрефиксы, настройки указаны в browserslist в package.json
const pcmq = require('postcss-combine-media-query'); // сливает одинаковые медиазапросы в один
const psmq = require('postcss-sort-media-queries'); // сортирует медиазапросы
const csso = require('postcss-csso'); // сжатие css файлов
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const htmlmin = require('gulp-htmlmin'); // сжатие html файлов
const strip = require('gulp-strip-comments'); // удаляет комментарии
const csscomb = require('gulp-csscomb'); // расставляет свойства по порядку

const imagemin = require('gulp-imagemin');

var workDir = './';

const path = {
    app: {
        js: workDir + 'app/js/**/*.js',
        style: workDir + 'app/stylus/*.styl',
        img: workDir + 'app/img/**/*.*',
        html: workDir + 'app/html/*.html'
    },
    dist: {
        js: workDir + 'dist/js/',
        css: workDir + 'dist/css/',
        img: workDir + 'dist/img/',
        html: workDir + 'dist/'
    },
    watch: {
        js: workDir + 'app/js/**/*.js',
        style: workDir + 'app/stylus/**/*.styl',
        img: workDir + 'app/img/**/*.*',
        html: workDir + 'app/html/**/*.html'
    }
};

function html() {
    return gulp.src(path.app.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(path.dist.html))
        .pipe(browserSync.stream());
}
gulp.task(html);

function htmlProd() {
    return gulp.src('dist/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(path.dist.html))
};
gulp.task(htmlProd);

function css() {
    const plugins = [
        autoprefixer({
            cascade: false
        }),
        pcmq(),
//        psmq()
    ];

    return gulp.src(['node_modules/normalize.css/normalize.css', path.app.style])
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write())
        .pipe(concat('style.css'))
        .pipe(gulp.dest(path.dist.css))
        .pipe(browserSync.stream());
};
gulp.task(css);

function cssProd() {
    const plugins = [
        csso()
    ];

    return gulp.src(['dist/css/style.css'])
        .pipe(csscomb())
        .pipe(postcss(plugins))
        .pipe(concat('style.css'))
        .pipe(gulp.dest(path.dist.css));
};
gulp.task(cssProd);

// function cssVendors() {
//     const plugins = [
//         csso()
//     ];

//     return gulp.src([
//         'node_modules/normalize.css/normalize.css'
//     ])
//         .pipe(csscomb())
//         .pipe(postcss(plugins))
//         .pipe(concat('vendors.min.css'))
//         .pipe(gulp.dest(path.dist.css))
//         .pipe(browserSync.stream());
// };
// gulp.task(cssVendors);

function js() {
    return gulp.src(path.app.js)
        .pipe(sourcemaps.init())
        //        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist.js))
        .pipe(browserSync.stream());
};
gulp.task(js);

function jsProd() {
    return gulp.src('dist/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.js));
};
gulp.task(jsProd);

function img() {
    return gulp.src(path.app.img)
        .pipe(imagemin())
        .pipe(gulp.dest(path.dist.img));
};
gulp.task(img);

function watcher() {
    gulp.watch(path.watch.html, html);
    gulp.watch(path.watch.style, css);
    gulp.watch(path.watch.js, js);
};

function sync() {
    browserSync.init({
        server: {
            baseDir: path.dist.html
        },
        port: 8080
    });
};

const dev = gulp.series(html, css, img, js, gulp.parallel(watcher, sync));
const prod = gulp.series(htmlProd, cssProd, jsProd);

gulp.task('default', dev);
gulp.task('prod', prod);
