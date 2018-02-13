import gulp				from 'gulp';
import plugins		from 'gulp-load-plugins';
import browser		from 'browser-sync';
import rimraf			from 'rimraf';
import panini			from 'panini';
import lazypipe		from 'lazypipe';
import inky				from 'inky';
import fs					from 'fs';
import siphon			from 'siphon-media-query';
import path				from 'path';
import merge			from 'merge-stream';
import beep				from 'beepbeep';
import colors			from 'colors';

const $ = plugins();


// Build the "dist" folder by running all of the below tasks
gulp.task('build',
	gulp.series(clean, pages, sass, inline));

// Build emails, run the server, and watch for file changes
gulp.task('default',
	gulp.series('build', server, watch));

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
function sass() {
	return gulp.src('src/assets/scss/app.scss')
		.pipe($.sourcemaps.init())
		.pipe($.sass({
			includePaths: ['node_modules/foundation-emails/scss']
		}).on('error', $.sass.logError))
		.pipe($.uncss(
			{
				html: ['dist/**/*.html']
			}))
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

// Watch for file changes
function watch() {
	gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages, inline, browser.reload));
	gulp.watch(['src/layouts/**/*', 'src/modules/**/*']).on('all', gulp.series(resetPages, pages, inline, browser.reload));
	gulp.watch(['../scss/**/*.scss', 'src/assets/scss/**/*.scss']).on('all', gulp.series(resetPages, sass, pages, inline, browser.reload));
}

// Inlines CSS into HTML, adds media query CSS into the <style> tag of the email, and compresses the HTML
function inliner(css) {
	var css = fs.readFileSync(css).toString();
	var mqCss = siphon(css);

	var pipe = lazypipe()
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
		});

	return pipe();
}

// Copy and compress into Zip
function zip() {
	var dist = 'dist';
	var ext = '.html';

	function getHtmlFiles(dir) {
		return fs.readdirSync(dir)
			.filter(function(file) {
				var fileExt = path.join(dir, file);
				var isHtml = path.extname(fileExt) == ext;
				return fs.statSync(fileExt).isFile() && isHtml;
			});
	}

	var htmlFiles = getHtmlFiles(dist);

	var moveTasks = htmlFiles.map(function(file){
		var sourcePath = path.join(dist, file);
		var fileName = path.basename(sourcePath, ext);

		var moveHTML = gulp.src(sourcePath)
			.pipe($.rename(function (path) {
				path.dirname = fileName;
				return path;
			}));

		return merge(moveHTML)
			.pipe($.zip(fileName+ '.zip'))
			.pipe(gulp.dest('dist'));
	});

	return merge(moveTasks);
}
