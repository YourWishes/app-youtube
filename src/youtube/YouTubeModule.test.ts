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

describe('loadPackage', () => {
  it('should load the package data', () => {
    expect(new YouTubeModule(new SampleAppClass()).package).toHaveProperty('name', '@yourwishes/app-youtube');
  });
});
