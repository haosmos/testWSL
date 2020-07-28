// 'use strict'

let project_folder = "build";
let source_folder = "dev"

let path = {
    build:{
        html: project_folder + "/",
        css: project_folder + "/css",
        js: project_folder + "/js",
        img: project_folder + "/img",
        fonts: project_folder + "/fonts",
    },
    src: {
        html: [source_folder + "/!*.html", source_folder + "/[^_]*.html"]
        /*[source_folder + "/!*.html", "!" + source_folder + "/!*_.html"]*/,
        css: source_folder + "/scss/main.scss",
        js: source_folder + "/script.js",
        img: source_folder + "/img/**/*.{jpg,png,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp');
let gulp = require('gulp');
let browserSync = require('browser-sync').create();
let reload      = browserSync.reload;
let fileinclude = require('gulp-file-include');
let scss = require('gulp-dart-sass');
let debug = require('gulp-debug');
let htmlbeautify = require('gulp-html-beautify');
let del = require('del');
let plumber = require('gulp-plumber');
let sourcemaps = require('gulp-sourcemaps');
let autoprefixer = require('autoprefixer');
let cleanCSS = require('gulp-clean-css');
let htmlmin = require('gulp-htmlmin');
let rename = require('gulp-rename');
let cachebust = require('gulp-cache-bust');
let size = require('gulp-size');
let group_media = require('gulp-group-css-media-queries');
let postcss = require('gulp-postcss');
let changed = require('gulp-changed');


function autoReload(params) {
    browserSync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        //browser: "chrome",
        notify: false
    });
}

function html() {
    return src(path.src.html)
        //.pipe(changed(path.build.html))
        .pipe(plumber())
        .pipe(fileinclude())
        .pipe(htmlbeautify())
        .pipe(htmlmin({
            collapseWhitespace: true,
            ignoreCustomFragments: [ /<br>\s/gi ] /* Не убираем пробел после
             <br> */
        }))
        .pipe(cachebust({
            type: 'timestamp'
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(changed(path.build.css))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(scss())
        .pipe(postcss([
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        ]))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(rename("style.min.css"))
        .pipe(size({
            showFiles: true }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream())
}

function watcher(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
}

function cleaning(params) {
    return del([path.clean]);
}

let build = gulp.series(cleaning, gulp.parallel(css, html));
let watch = gulp.parallel(build, watcher, autoReload);

/*
watch('app/!**!/!*.html').on('change', browserSync.reload);
*/

exports.css = css;
exports.build = build;
exports.html = html;
exports.watch = watch;
exports.default = watch;

/*
const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-dart-sass');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const includefile = require('gulp-file-include');
const htmlbeautify = require('gulp-html-beautify');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');



// Определяем логику работы Browsersync
function browsersync() {
	browserSync.init({ // Инициализация Browsersync
		server: { baseDir: 'app/' }, // Указываем папку сервера
		notify: false, // Отключаем уведомления
		online: true // Режим работы: true или false
	})
}

function scripts() {
	return src([ // Берём файлы из источников
		'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
		'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
	])
		.pipe(concat('app.min.js')) // Конкатенируем в один файл
		.pipe(uglify()) // Сжимаем JavaScript
		.pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
		.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function styles() {
	return src('app/main.scss') // Выбираем источник:
		//"app/sass/main.sass" или "app/less/main.less"
		//.pipe(eval(preprocessor)()) // Преобразуем значение переменной
		// "preprocessor" в функцию
		.pipe(concat('app.min.css')) // Конкатенируем в файл app.min.js
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
		.pipe(cleancss( { level: { 1: { specialComments: 0 } }/!* , format: 'beautify' *!/ } )) // Минифицируем стили
		.pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
		.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function images() {
	return src('app/images/src/!**!/!*') // Берём все изображения из папки источника
		.pipe(newer('app/images/dest/')) // Проверяем, было ли изменено (сжато) изображение ранее
		.pipe(imagemin()) // Сжимаем и оптимизируем изображеня
		.pipe(dest('app/images/dest/')) // Выгружаем оптимизированные изображения в папку назначения
}

function cleanimg() {
	return del('app/images/dest/!**!/!*', { force: true }) // Удаляем всё содержимое папки "app/images/dest/"
}

function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/css/!**!/!*.min.css',
		'app/js/!**!/!*.min.js',
		'app/images/dest/!**!/!*',
		'app/!**!/!*.html',
	], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
		.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function cleandist() {
	return del('dist/!**!/!*', { force: true }) // Удаляем всё содержимое папки "dist/"
}

function startwatch() {

	// Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
	watch(['app/!**!/!*.js', '!app/!**!/!*.min.js'], scripts);

	// Мониторим файлы препроцессора на изменения
	watch('app/!**!/!*.scss', styles);

	// Мониторим файлы HTML на изменения
	watch('app/!**!/!*.html').on('change', browserSync.reload);

	// Мониторим папку-источник изображений и выполняем images(), если есть изменения
	watch('app/images/src/!**!/!*', images);

}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспорт функции images() в таск images
exports.images = images;

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;

// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleandist, styles, scripts, images, buildcopy);

// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, browsersync, startwatch);*/
