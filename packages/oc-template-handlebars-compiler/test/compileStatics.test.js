jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

const path = require('path');
const fs = require('fs-extra');
const nodeDir = require('node-dir');

const compileStatics = require('../lib/compileStatics.js');
const componentPath = path.join(
  __dirname,
  '../../../mocks/handlebars-component'
);
const publishPath = path.join(componentPath, '_compile-static-package');
const publishFileName = 'template.js';
const withStatic = (staticFiles, minify) => ({
  componentPackage: {
    oc: {
      files: {
        static: staticFiles
      }
    }
  },
  publishPath,
  componentPath,
  minify: minify || false
});

afterEach(() => {
  fs.emptyDirSync(publishPath + '/assets');
});

test('when oc.files.static is empty', done => {
  compileStatics(withStatic([]), (error, result) => {
    expect(error).toBeNull();
    expect(result).toBe('ok');
    done();
  });
});

test('when oc.files.static contains a folder that doesnt exist', done => {
  compileStatics(withStatic(['src']), (error, result) => {
    expect(error).toContain('not found');
    expect(result).toBeUndefined();
    done();
  });
});

test('when oc.files.static contain reference to a non-folder', done => {
  compileStatics(withStatic(['template.hbs']), (error, result) => {
    expect(error).toContain('must be a directory');
    expect(result).toBeUndefined();
    done();
  });
});

test('compile statics when oc.files.static contains valid folder and minify is false', done => {
  compileStatics(withStatic(['assets']), (error, result) => {
    expect(error).toBeNull();
    expect(result).toBe('ok');
    nodeDir.paths(publishPath + '/assets', (err, res) => {
      const files = res.files.sort();
      expect(
        files.map(file => path.relative(__dirname, file))
      ).toMatchSnapshot();
      files.forEach(file => {
        if (!/.png$/.test(file)) {
          expect(fs.readFileSync(file, 'UTF8')).toMatchSnapshot();
        }
      });
      done();
    });
  });
});

test('compile statics when oc.files.static contains valid folder and minify is true', done => {
  const minify = true;
  compileStatics(withStatic(['assets'], minify), (error, result) => {
    expect(error).toBeNull();
    expect(result).toBe('ok');
    nodeDir.paths(publishPath + '/assets', (err, res) => {
      const files = res.files.sort();
      expect(
        files.map(file => path.relative(__dirname, file))
      ).toMatchSnapshot();
      files.forEach(file => {
        if (!/.png$/.test(file)) {
          expect(fs.readFileSync(file, 'UTF8')).toMatchSnapshot();
        }
      });
      done();
    });
  });
});

test('When static files writing fails should return error', done => {
  const original = fs.ensureDir;
  fs.ensureDir = jest.fn((a, cb) => cb('sorry I failed'));

  const minify = true;
  compileStatics(withStatic(['assets'], minify), err => {
    expect(err).toMatchSnapshot();
    fs.ensureDir = original;
    done();
  });
});

test('When static file fails to be read should return error', done => {
  const original = fs.readFile;
  fs.readFile = jest.fn((a, cb) => cb('sorry I failed'));

  const minify = true;
  compileStatics(withStatic(['assets'], minify), err => {
    expect(err).toMatchSnapshot();
    fs.readFile = original;
    done();
  });
});
