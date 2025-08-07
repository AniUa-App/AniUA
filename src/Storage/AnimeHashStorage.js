import {Storage} from './Storage';

class AnimeHashStorage extends Storage {
  storageKey = 'animeHash';
  constructor() {
    super();
  }

  getHash() {
    return this.getItem(this.storageKey, {});
  }

  setHash(hash = {}) {
    this.setItem(this.storageKey, hash);
  }

  getHashBySlug(slug) {
    return this.getItem(this.storageKey, {})[slug] || {};
  }

  addHash(slug, data = {}) {
    const animeList = this.getItem(this.storageKey, {});
    animeList[slug] = data;
    this.setItem(this.storageKey, animeList);
  }

  removeHashBySlug(slug) {
    const animeList = this.getItem(this.storageKey, {});

    delete animeList[slug];

    this.setItem(this.storageKey, animeList);
  }

  clearHash() {
    this.setItem(this.storageKey, {});
  }

  isHash(slug) {
    const animeList = this.getItem(this.storageKey, {});
    return animeList[slug] !== undefined;
  }

  isEmpty() {
    const animeList = this.getItem(this.storageKey, {});
    return Object.keys(animeList).length === 0;
  }

  getHashLength() {
    const animeList = this.getItem(this.storageKey, {});
    return Object.keys(animeList).length;
  }
}

export default new AnimeHashStorage();
