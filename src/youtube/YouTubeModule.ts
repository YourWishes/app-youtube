// Copyright (c) 2018 Dominic Masters
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import { Module } from '@yourwishes/app-base';
import { IYouTubeApp } from './../app/';
import { YouTube } from 'better-youtube-api';
import * as url from 'url';

const CONFIG_API_KEY = 'youtube.api';

export class YouTubeModule extends Module {
  youtube:YouTube;

  constructor(app:IYouTubeApp) {
    super(app);
  }

  getVideoIdFromUrl(u:string):string {
    //First, is it missing the protocol? Prepend it here
    if(['youtube','youtu.be','m.youtube','www.youtube'].some(e => u.startsWith(e))) {
      u = `https://${u}`;
    }

    //Parse the URL
    let parsed = url.parse(u, true);

    //Get the bits we need
    let { hostname, query, pathname } = parsed;

    //Setup the ID with a default.
    let id:string = null;

    //Was the hostname valid?
    if(hostname) {
      //Remove the final . (E.g. .com, .co, .co.nz etc)
      let hostBits = hostname.split('.');
      let host;
      if(!hostBits.length) {
        host = hostname;
      } else if(hostBits[0] != 'youtube') {
        //yotu.be links
        if(hostBits[hostBits.length-1] == 'be') {
          host = 'youtu.be';
        } else {
          host = hostBits[1];
        }
      } else {
        host = hostBits[0];
      }

      //Now, standard youtube urls are checked
      if([
        'www.youtube', 'youtube', 'm.youtube'
      ].some(e => e === host)) {
        //Is the path /watch (a direct watch url?) if so take the V query param
        if(pathname === '/watch' && query && query['v']) {
          id = query['v'] as string;
        } else if(pathname.startsWith('/embed')) {
          //So this is is an /embed url, we can simply extract the id from the
          //end of the url.
          let bits = pathname.split('/');
          id = bits.length > 1 ? bits[2] : null;
        }
      } else if(host === 'youtu.be') {
        //This is a youtu.be url.
        id = pathname.slice(1);
      }
    }

    //By default let's assume that they're maybe just passed an id directly.
    if(!id) id = u;

    return id && id.length === 11 && /^[a-zA-Z0-9-_]+$/.test(id) ? id : null;
  }

  async init():Promise<void> {
    if(!this.app.config.has(CONFIG_API_KEY)) throw new Error("Missing YouTube API Key in configuration.");
    this.youtube = new YouTube(this.app.config.get(CONFIG_API_KEY));
  }
}
