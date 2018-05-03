const gulp = require("gulp"),
    babel = require("gulp-babel"),
    stylus = require("gulp-stylus"),
    del = require("del")

gulp.task("clean", function () {
    return del(["dist"])
})

gulp.task("styles", function () {
    return gulp.src("src/*.styl")
        .pipe(stylus())
        .pipe(gulp.dest("dist"))
})

gulp.task("scripts", function () {
    return gulp.src("src/*.js")
        .pipe(babel())
        .pipe(gulp.dest("dist"))
})

gulp.task("copy", function () {
    return gulp.src(["src/manifest.json", "src/*.html"])
        .pipe(gulp.dest("dist"))
})

gulp.task("resources", function () {
    return gulp.src("src/resources/**/*")
        .pipe(gulp.dest("dist/resources"))
})

gulp.task("watch", function () {
    gulp.watch("src/*.styl", ["styles"])
    gulp.watch("src/*.js", ["scripts"])
    gulp.watch(["src/manifest.json", "src/*.html"], ["copy"])
    gulp.watch("src/resources/**/*", ["resources"])
})

gulp.task("default", ["clean", "styles", "scripts", "copy", "resources", "watch"])
