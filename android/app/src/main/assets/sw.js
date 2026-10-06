/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "8defb892e92d2e9e73587da8081ac2f7"
  }, {
    "url": "pwa-512x512.png",
    "revision": "da5d9b35c97cc129006d56df1a783045"
  }, {
    "url": "pwa-192x192.png",
    "revision": "8e1c212e3cdc59f66b06620fb0969a01"
  }, {
    "url": "index.html",
    "revision": "8f2e410f63257e3ac540382adca50ba3"
  }, {
    "url": "icon.svg",
    "revision": "3245a6a1f608d48811751ab0231f6979"
  }, {
    "url": "favicon.png",
    "revision": "64e074315a194c175ecfc19d9d90798f"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "7420fa67dc45205e9d69f371a536e60e"
  }, {
    "url": "assets/index-Dpy3ErJr.css",
    "revision": null
  }, {
    "url": "assets/index-DDKNJ7Fy.js",
    "revision": null
  }, {
    "url": "LectorZews.apk",
    "revision": "0d82dd7a2921be646cc976239b7c77c3"
  }, {
    "url": "app-ads.txt",
    "revision": "2bf629b74c07705eb4d344506932425a"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "7420fa67dc45205e9d69f371a536e60e"
  }, {
    "url": "favicon.png",
    "revision": "64e074315a194c175ecfc19d9d90798f"
  }, {
    "url": "icon.svg",
    "revision": "3245a6a1f608d48811751ab0231f6979"
  }, {
    "url": "lectorzews-android-project.zip",
    "revision": "be2f84ce278251ab407d42f49640f70c"
  }, {
    "url": "pwa-192x192.png",
    "revision": "8e1c212e3cdc59f66b06620fb0969a01"
  }, {
    "url": "pwa-512x512.png",
    "revision": "da5d9b35c97cc129006d56df1a783045"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "8defb892e92d2e9e73587da8081ac2f7"
  }, {
    "url": "manifest.json",
    "revision": "5215ea72c9e2aecfdbc58e7f144a1b22"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
