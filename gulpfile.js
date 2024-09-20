import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import imagemin from 'gulp-imagemin';
import autoprefixer from 'gulp-autoprefixer';
import { deleteAsync } from 'del';
import concat from 'gulp-concat';
import ghPages from 'gulp-gh-pages';

const sass = gulpSass(dartSass);
const bs = browserSync.create();

// Clean dist folder
async function clean() {
	await deleteAsync(['dist']);
}

// Deploy to GitHub Pages
function deploy() {
	return gulp.src("./dist/**/*")
		.pipe(ghPages({
			branch: 'gh-pages',
			remoteUrl: 'https://github.com/official-artem/evoplay.git',
		}));
}

// Compile SCSS to CSS, add prefixes, minify, and create sourcemaps
function styles() {
	return gulp.src(['src/style.scss'])
		.pipe(sourcemaps.init())
		.pipe(sass({
			includePaths: ['src/styles'],
			outputStyle: 'compressed',
		}).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cleanCSS())
		.pipe(concat('style.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist/styles'))
		.pipe(bs.stream());
}

// Minify HTML
function html() {
	return gulp.src('src/**/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('dist'))
		.pipe(bs.stream());
}

// Optimize and minify images
function images() {
	return gulp
		.src('src/assets/images/**/*', { encoding: false})
		.pipe(imagemin())
		.pipe(gulp.dest('dist/assets/images'))
		.pipe(bs.stream());
}

function assets() {
	return gulp.src(['src/**/*', '!src/**/*.html', '!src/**/*.scss', '!src/assets/images/**/*'])
		.pipe(gulp.dest('dist'))
		.pipe(bs.stream());
}

function serve(done) {
	bs.init({
		server: {
			baseDir: './dist'
		}
	});

	gulp.watch('src/**/*.scss', styles);
	gulp.watch('src/**/*.html', html);
	gulp.watch('src/assets/**/*', images);
	gulp.watch(['src/**/*', '!src/**/*.html', '!src/**/*.scss', '!src/assets/**/*'], assets);
	done();
}

const build = gulp.series(clean, gulp.parallel(styles, html, images, assets));
const dev = gulp.series(build, serve);

export { clean, styles, html, images, assets, build, dev, deploy };
export default dev;
