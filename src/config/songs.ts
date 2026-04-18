export interface Song {
  title: string;
  src: string;
}

export const playlist: Song[] = [
  { title: "Song 1", src: "/songs/song1.mp3" },
  { title: "Song 2", src: "/songs/song2.mp3" },
  { title: "Song 3", src: "/songs/song3.mp3" },
];
