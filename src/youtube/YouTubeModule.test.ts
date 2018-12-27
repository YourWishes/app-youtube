import { YouTubeModule } from './YouTubeModule';
import { IYouTubeApp } from './../app/';
import { App } from '@yourwishes/app-base';

class SampleAppClass extends App implements IYouTubeApp {
  youtube:YouTubeModule;
}

describe('YouTubeModule', () => {
  it('should require an IYouTubeApp interface app', () => {
    expect(() => new YouTubeModule(null)).toThrow();
  });

  it('should construct a new youtube module', () => {
    let app = new SampleAppClass();
    expect(() => new YouTubeModule(app)).not.toThrow();
  });
});

describe('init', () => {
  it('should expect the config to be setup', async () => {
    let app = new SampleAppClass();
    let module = new YouTubeModule(app);
    await expect(module.init()).rejects.toThrow();
  });

  it('should initialize when the config is correctd', async () => {
    let app = new SampleAppClass();
    let module = new YouTubeModule(app);
    app.config.data = { youtube: { api: 'sample' } };
    await expect(module.init()).resolves.not.toThrow();
  });
});

describe('getVideoIdFromUrl', () => {
  it('should return the id of real urls', () => {
    let app = new SampleAppClass();
    let module = new YouTubeModule(app);

    let tests = {
      //Test passing a few standard IDs as-is
      'SECVGN4Bsgg': 'SECVGN4Bsgg',//Men at Work - Who can it be now
      'MR3uP7IYz44': 'MR3uP7IYz44',//Modjo - Lady, Hear me tonight
      'iq2WJ2r0NkM': 'iq2WJ2r0NkM',//Little River Band - Help is on it's way

      //Test some regular urls, a few different domains, protocols etc
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ': 'dQw4w9WgXcQ',//
      'https://www.youtube.com/watch?v=iNngC1Ea2rA': 'iNngC1Ea2rA',//Nu Shooz - I can't wait
      'https://youtube.com/watch?v=vswLoSCNLlQ': 'vswLoSCNLlQ',//Phil Collins - Something happened on the way to heaven
      'https://youtube.com/watch?v=q9xNhcvZ6UI': 'q9xNhcvZ6UI',//Phil Collins - Sussudio
      'https://youtube.co/watch?v=Iwuy4hHO3YQ': 'Iwuy4hHO3YQ',//The Buggles - Video killed the radio star
      'https://youtube.co.nz/watch?v=vz65vonktMA': 'vz65vonktMA',//The B-52's - Rock Lobster
      'https://youtube.com.au/watch?v=YtOgp40Q4oU': 'YtOgp40Q4oU',//The Bangles - Walk like an Egyptian
      'http://youtube.com/watch?v=kM5dA9lhO-s': 'kM5dA9lhO-s',//Animotion - Obsession
      'http://www.youtube.com/watch?v=DtxBUp6hBaI': 'DtxBUp6hBaI',//Bee Gee's - More than a woman
      'http://www.youtube.co.nz/watch?v=0fAQhSRLQnM': '0fAQhSRLQnM',//Dire Straits - Sultans of Swing

      //Try some with bits of the url missing
      'youtube.com/watch?v=FTQbiNvZqaY': 'FTQbiNvZqaY',//Toto - Africa
      'youtube.co/watch?v=Yf_Lwe6p-Cg': 'Yf_Lwe6p-Cg',//Wham! - Everything she wants
      'www.youtube.com.au/watch?v=dJe1iUuAW4M': 'dJe1iUuAW4M',//Doobey Brothers - What a fool believs

      //Now the youtu.be links
      'https://youtu.be/yPYZpwSpKmA': 'yPYZpwSpKmA',//Rick Astley - Together forever
      'http://youtu.be/PoS_C3XnoFI': 'PoS_C3XnoFI',//Billy Ocean - Carribean Queen
      'http://www.youtu.be/rblt2EtFfC4': 'rblt2EtFfC4',//Prince - 1999
      'https://youtu.be/6JSfs_VPCM4': '6JSfs_VPCM4',//ELO - Livin' thing

      //Embed Link
      'https://www.youtube.com/embed/_r0n9Dv6XnY': '_r0n9Dv6XnY',//Baltimora - Tarzan Boy
      'youtube.com/embed/g4flAZEgtjs': 'g4flAZEgtjs',//Creedence Clearwater - Have you ever seen the rain

      //Now a playlist url
      'https://www.youtube.com/watch?v=DavckVZylkg&index=18&list=PLzOiFuN0VXgm6b4MuHv1Xtawt_vpI-G3T&t=0s': 'DavckVZylkg'//George Duke - Reach out
    };

    let urls = Object.keys(tests);
    urls.forEach(url => {
      let expectedId = tests[url];
      expect(module.getVideoIdFromUrl(url)).toStrictEqual(expectedId);
    });
  });


  it('should return null for invalid urls', () => {
    let app = new SampleAppClass();
    let module = new YouTubeModule(app);

    //These should all be null for various reasons (read comments)
    let tests = [
      //First, just random strings
      '1',
      'a',
      'b32213',
      'password',
      'not a real link',
      'lorem ipsum dolor sit',

      //Now let's try some random urls
      'http://google.com/',
      'https://ebay.com',
      'www.yahoo.com',
      'mail.google.com',
      'https://en.wikipedia.org/wiki/Lasagne',//I'm hungry

      //Now some urls that have a V query param but aren't YouTube
      'https://vimeo.com/watch?v=g4flAZEgtjs',//Not a real url but it's fine

      //Now some YouTube urls that shouldn't be real videos
      'https://www.youtube.com/embed/',
      'http://youtu.be',
      'https://youtube.com/watch',
      'https://youtube.com/JonTronShow',
      'https://www.youtube.com/channel/UCL7DDQWP6x7wy0O6L5ZIgxg',
      'https://www.youtube.com/playlist?list=PL9wV0Fmo7N_hBpF7L970MoOmo-v8Oezdd',

      //Now some really valid urls, but the IDs themselves are invalid
      'https://www.youtube.com/watch?v=dQw4w9WgXc',//Missing a character
      'https://youtu.be/6JSfs$VPCM4',//Invalid $ symbol
      'https://www.youtube.com/embed/_r0n99Dv6XnY'//Extra character
    ];

    tests.forEach(url => {
      expect(module.getVideoIdFromUrl(url)).toBeNull();
    });
  });
});
