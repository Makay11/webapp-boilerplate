"use strict";

const autoprefixer = require("gulp-autoprefixer");
const browserify = require("gulp-browserify2");
const del = require("del");
const embedlr = require("gulp-embedlr");
const filter = require("gulp-filter");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const jade = require("gulp-jade");
const livereload = require("gulp-livereload");
const plumber = require("gulp-plumber");
const runSequence = require("run-sequence");
const stylus = require("gulp-stylus");
const uglify = require("gulp-uglify");

let DEV = false;

const paths = {
  dist: ["client/dist", "server/dist"],

  images: {
    src: "client/src/images/**/*",
    dist: "client/dist/images"
  },
  index: {
    src: "client/src/app/index.jade",
    dist: "client/dist/app"
  },
  scripts: {
    src: "client/src/app/**/*.{js,ls}",
    dist: "client/dist/app",
    entryFile: "client/src/app/app.{js,ls}",
    fileName: "app.js"
  },
  server: {
    src: "server/src/**/*.js",
    dist: "server/dist"
  },
  styles: {
    src: "client/src/styles/**/*.styl",
    dist: "client/dist/styles"
  },
  templates: {
    src: "client/src/app/*/**/*.jade"
  },
  vendor: {
    src: "client/src/vendor/**/*",
    dist: "client/dist/vendor"
  }
};


// MAJOR TASKS ====================================================================================

gulp.task("build", build);
gulp.task("clean", clean);
gulp.task("dev", dev);
gulp.task("test", test);
gulp.task("watch", watch);


//MINOR TASKS =====================================================================================

gulp.task("images", images);
gulp.task("index", index);
gulp.task("scripts", scripts);
gulp.task("server", server);
gulp.task("styles", styles);
gulp.task("vendor", vendor);


// MAJOR TASK FUNCTIONS ===========================================================================

function build(done) {
  runSequence("clean", ["images", "index", "scripts", "server", "styles", "vendor"], done);
}

function clean(done) {
  paths.dist.forEach(function (path) {
    del.sync(path);
  });
  done();
}

function dev(done) {
  DEV = true;
  process.env.NODE_ENV = "development";

  runSequence("build", "watch", function () {
    livereload.listen({quiet: true});
    spawn("nodemon --watch server/dist --ext js --delay 1 server/dist/index.js");
    done();
  });
}

function test(done) {
  runSequence("build", function () {
    const server = spawn("node .", true, "pipe");

    server.stdout.once("data", function () {
      spawn("lab -v").on("exit", function () {
        server.kill();
        done();
      });
    });
  });
}

function watch(done) {
  gulp.watch(paths.images.src, ["images"]);
  gulp.watch(paths.index.src, ["index"]);
  gulp.watch(paths.scripts.src, ["scripts"]);
  gulp.watch(paths.server.src, ["server"]);
  gulp.watch(paths.styles.src, ["styles"]);
  gulp.watch(paths.templates.src, ["scripts"]);
  gulp.watch(paths.vendor.src, ["vendor"]);
  done();
}


// MINOR TASK FUNCTIONS ===========================================================================

function images() {
  del.sync(paths.images.dist);

  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dist))
    .pipe(gulpif(DEV, livereload()));
}

function index() {
  del.sync(paths.index.dist + "/index.html");

  return gulp.src(paths.index.src)
    .pipe(plumber())
    .pipe(jade({pretty: DEV}))
    .pipe(gulpif(DEV, embedlr()))
    .pipe(gulp.dest(paths.index.dist))
    .pipe(gulpif(DEV, livereload()));
}

function scripts(done) {
  del.sync(paths.scripts.dist + "/**/*.js");

  gulp.src(paths.scripts.entryFile)
    .pipe(plumber(function (error) {
      console.error(error.toString());
      done();
    }))
    .pipe(browserify({
      fileName: paths.scripts.fileName,
      transform: [
        require("browserify-ngannotate"),
        require("jadeify")
      ],
      options: {
        extensions: [".jade"]
      }
    }))
    .pipe(gulpif(!DEV, uglify()))
    .pipe(gulp.dest(paths.scripts.dist))
    .pipe(gulpif(DEV, livereload()))
    .on("end", done);
}

function server() {
  del.sync(paths.server.dist + "/**/*.*");

  return gulp.src(paths.server.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.server.dist));
}

function styles() {
  del.sync(paths.styles.dist);

  return gulp.src(paths.styles.src)
    .pipe(plumber())
    .pipe(filter(["*", "!_*.styl"]))
    .pipe(stylus({compress: !DEV}))
    .pipe(autoprefixer({remove: true}))
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(gulpif(DEV, livereload()));
}

function vendor() {
  del.sync(paths.vendor.dist);

  return gulp.src(paths.vendor.src)
    .pipe(gulp.dest(paths.vendor.dist))
    .pipe(gulpif(DEV, livereload()));
}


// HELPER FUNCTIONS ===============================================================================

function spawn(command, exe, stdio) {
  const args = command.split(" ");
  let binary = args.shift();

  if (!exe && process.platform === "win32") {
    binary += ".cmd";
  }

  return require("child_process").spawn(binary, args, {stdio: stdio || "inherit"});
}
