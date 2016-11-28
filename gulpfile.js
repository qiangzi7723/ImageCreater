// 命令行 运行 npm install 安装
// 安装完毕后 在命令行输入gulp watch即可

var gulp = require('gulp'), // 載入 gulp
    gulpSass = require('gulp-sass'); // 載入 gulp-sass
    livereload=require('gulp-livereload');

gulp.task('watch', function() {
    gulp.watch('./*.scss', ['styles']);
});

gulp.task('styles', function() {
    gulp.src('*.scss') // 指定要處理的 Scss 檔案目錄
        .pipe(gulpSass())
        .pipe(gulpSass({outputStyle: 'expanded'}).on('error', gulpSass.logError))
        .pipe(gulp.dest('./')) // 指定編譯後的 css 檔案目錄
        .pipe(livereload())
});
