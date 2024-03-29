const gulp = require('gulp');
const plugins = require('gulp-load-plugins');
const browser = require('browser-sync');
const rimraf = require('rimraf');
const panini = require('panini');
const lazypipe = require('lazypipe');
const inky = require('inky');
const fs = require('fs');
const siphon = require('siphon-media-query');
const postcss = require('gulp-postcss');
const sass = require('gulp-dart-sass');

const $ = plugins();

// Build the "dist" folder by running all of the below tasks
gulp.task(
	'build',
	gulp.series(
		clean,
		pages,
		buildSass,
		inline,
		copyThemeFile,
		copyNewTheme,
		copyOldTheme
	)
);

// Build emails, run the server, and watch for file changes
gulp.task('watch',
	gulp.series('build', server, watch));

// Default (fallback for the watch command)
gulp.task('default',
	gulp.series('watch'));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
	rimraf('dist', done);
}

// Compile layouts, pages, and partials into flat HTML files
// Then parse using Inky templates
function pages() {
	return gulp.src(['src/pages/**/*.html', '!src/pages/archive/**/*.html'])
		.pipe(panini({
			root: 'src/pages',
			layouts: 'src/layouts',
			partials: 'src/modules',
			helpers: 'src/helpers',
			pageLayouts: {
				'helpers': 'helper'
			}
		}))
		.pipe(inky())
		.pipe(gulp.dest('dist'));
}

function helpers() {
	return gulp.src(['src/pages/helpers/**/*.html'])
		.pipe(panini({
			root: 'src/pages',
			layouts: 'src/layouts',
			partials: 'src/modules',
			helpers: 'src/helpers',
			pageLayouts: {
				'helpers': 'helper'
			}
		}))
		.pipe(inky())
		.pipe(gulp.dest('dist'));
}

// Reset Panini's cache of layouts and partials
function resetPages(done) {
	panini.refresh();
	done();
}

// Compile Sass into CSS
function buildSass() {
	return gulp.src('src/assets/scss/app.scss')
		.pipe($.sourcemaps.init())
		.pipe(sass({
			includePaths: ['node_modules/foundation-emails/scss']
		}).on('error', sass.logError))
		.pipe(postcss([require('postcss-uncss')({ html: ['dist/**/*.html'] })]))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('dist/css'));
}

// Inline CSS and minify HTML
function inline() {
	return gulp.src('dist/**/*.html')
		.pipe(inliner('dist/css/app.css'))
		.pipe(gulp.dest('dist'));
}

// Start a server with LiveReload to preview the site in
function server(done) {
	browser.init({
		server: 'dist'
	});
	done();
}

function copyThemeFile() {
	return gulp.src('theme.xml')
		.pipe(gulp.dest('dist'));
}

function copyNewTheme() {
	return gulp.src('dist/**/*')
		.pipe(gulp.dest('../../public/themes/email/mycashflow-2018/'));
}

function copyOldTheme() {
	return gulp.src('../../public/templates/emails/**/*')
		.pipe(gulp.dest('../../public/themes/email/mycashflow-2012/'))
		.pipe(gulp.src('../../public/templates/i/email*.gif'))
		.pipe(gulp.dest('../../public/themes/email/mycashflow-2012/i'));
}

// Watch for file changes
function watch() {
	gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, inline, copyNewTheme, browser.reload));
	gulp.watch(['src/layouts/**/*', 'src/modules/**/*']).on('all', gulp.series(resetPages, pages, inline, copyNewTheme, browser.reload));
	gulp.watch(['../scss/**/*.scss', 'src/assets/scss/**/*.scss']).on('all', gulp.series(resetPages, buildSass, pages, inline, copyNewTheme, browser.reload));
}

// Inlines CSS into HTML, adds media query CSS into the <style> tag of the email, and compresses the HTML
function inliner(css) {
	var css = fs.readFileSync(css).toString();
	var mqCss = siphon(css);

	return lazypipe()
		.pipe($.inlineCss, {
			applyStyleTags: false,
			removeStyleTags: false,
			preserveMediaQueries: true,
			removeLinkTags: true
		})
		.pipe($.replace, '<!-- <style> -->', `<style>${mqCss}</style>`)
		.pipe($.replace, '<link rel="stylesheet" type="text/css" href="css/app.css">', '')
		.pipe($.htmlmin, {
			collapseWhitespace: true,
			minifyCSS: true
		})();
}
