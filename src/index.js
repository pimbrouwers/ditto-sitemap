/*
 * Ditto JSON Middleware
 */

const events = require('events'),
  fs = require('fs-extra'),
  path = require('path'),
  sm = require('sitemap'),
  util = require('util');

module.exports = DittoSitemap;

function DittoSitemap(opt) {
  this.opt = opt || {
    filename: "/sitemap.xml",
    sitemapOptions: {
      hostname: "http://mysite.com"
    }
  };

  this.filename = null;
  this.urls = [];
};

/* Inherit Event Emitter prototype */
util.inherits(DittoSitemap, events.EventEmitter);

DittoSitemap.prototype.run = function(files, Ditto, done) {
  this.filename = path.resolve(Ditto._destination, this.opt.filename);
  this.discoverUrls(files);

  try {
    //kickoff build
    this.renderSitemap();
  } catch (err) {
    console.error(err);
    throw err;
  }

  //register listener
  this.on("done", done);
};

DittoSitemap.prototype.discoverUrls = function(files) {
  let self = this;

  Object.keys(files).forEach(function(filepath) {
    let htmlFilePath = files[filepath].path,
      url = "/"

    if (htmlFilePath.indexOf("/index.html") >= 0) {
      url = htmlFilePath.replace("/index.html", "");
    }

    self.urls.push({
      url: url
    });
  });
};

DittoSitemap.prototype.renderSitemap = function() {
  let self = this;

  self.opt.sitemapOptions.urls = self.urls;

  let sitemap = sm.createSitemap(self.opt.sitemapOptions);

  fs.outputFile(self.filename, sitemap.toString(), function(err) {
    if (err) throw err;

    self.emit("done");
  });
};