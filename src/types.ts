export interface Emoticons {
  perm: number;
  emoticon_unique: string;
  emoji: string;
  url: string;
}

export interface EmoticonsMap {
  pkg_id: number;
  pkg_name: string;
  current_cover: string;
  pkg_type: number;
  emoticons: Emoticons[];
}
