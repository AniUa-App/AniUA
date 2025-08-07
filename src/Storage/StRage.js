import {Storage} from './Storage';

class AnimeStorage_ {
  constructor() {
    this.storage = [];
  }

  getInfos() {
    return this.storage;
  }

  setInfos(infos = {}) {
    this.storage = infos;
  }

  getInfoBySlug(slug) {
    return (
      this.storage[slug] || {
        isFavorite: false,
        watched: {player: '', dubbing: '', episodes: []},
        downloaded: {
          episodes: [
            {
              episode: 0,
              player: '',
              dubbing: '',
              quality: '',
              url: '',
              video_path: '',
              video_type: '',
            },
          ],
        },
      }
    );
  }

  setInfoBySlug(
    slug,
    data = {
      isFavorite: false,
      watched: {player: '', dubbing: '', episodes: []},
      downloaded: {
        episodes: [
          {
            episode: 0,
            player: '',
            dubbing: '',
            quality: '',
            url: '',
            video_path: '',
            video_type: '',
          },
        ],
      },
    },
  ) {
    const existingInfo = this.storage[slug] || {};

    // Зберігаємо існуючі значення, якщо нові не передані
    this.storage[slug] = {
      isFavorite:
        data.isFavorite !== undefined
          ? data.isFavorite
          : existingInfo.isFavorite,
      watched:
        data.watched !== undefined
          ? data.watched
          : existingInfo.watched || {player: '', dubbing: '', episodes: []},
      downloaded:
        data.downloaded !== undefined
          ? data.downloaded
          : existingInfo.downloaded || {
              episodes: [
                {
                  episode: 0,
                  player: '',
                  dubbing: '',
                  quality: '',
                  url: '',
                  video_path: '',
                  video_type: '',
                },
              ],
            },
    };

    this.setInfos(this.storage);
  }

  removeInfoBySlug(slug) {
    delete this.storage[slug];
    this.setInfos(this.storage);
  }
}

export default new AnimeStorage_();
