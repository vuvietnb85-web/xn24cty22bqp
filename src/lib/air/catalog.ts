export type AirKind = "hls" | "audio";

export type AirChannel = {
  id: string;
  name: string;
  group: "VOV" | "Toàn cầu" | "Hình";
  src: string;
  kind: AirKind;
  kbps: number;
  picture: boolean;
};

/** Official public streams only. Nominal kbps is the published ladder, used for the data budget. */
export const AIR_CHANNELS: AirChannel[] = [
  {
    id: "vov1",
    name: "VOV1",
    group: "VOV",
    src: "https://str.vov.gov.vn/vovlive/vov1vov5Vietnamese.sdp_aac/playlist.m3u8",
    kind: "hls",
    kbps: 256,
    picture: false,
  },
  {
    id: "vov2",
    name: "VOV2",
    group: "VOV",
    src: "https://str.vov.gov.vn/vovlive/vov2.sdp_aac/playlist.m3u8",
    kind: "hls",
    kbps: 256,
    picture: false,
  },
  {
    id: "vov3",
    name: "VOV3",
    group: "VOV",
    src: "https://str.vov.gov.vn/vovlive/vov3.sdp_aac/playlist.m3u8",
    kind: "hls",
    kbps: 256,
    picture: false,
  },
  {
    id: "vov5",
    name: "VOV5 đối ngoại",
    group: "VOV",
    src: "https://str.vov.gov.vn/vovlive/vov5.sdp_aac/playlist.m3u8",
    kind: "hls",
    kbps: 256,
    picture: false,
  },
  {
    id: "vov-gthn",
    name: "VOV Giao thông Hà Nội",
    group: "VOV",
    src: "https://play.vovgiaothong.vn/live/gthn/playlist.m3u8",
    kind: "hls",
    kbps: 231,
    picture: false,
  },
  {
    id: "vov-gthcm",
    name: "VOV Giao thông TP.HCM",
    group: "VOV",
    src: "https://play.vovgiaothong.vn/live/gthcm/playlist.m3u8",
    kind: "hls",
    kbps: 231,
    picture: false,
  },
  {
    id: "rfi",
    name: "RFI Tiếng Việt",
    group: "Toàn cầu",
    src: "https://rfienvietnamien64k.ice.infomaniak.ch/rfienvietnamien-64.mp3",
    kind: "audio",
    kbps: 64,
    picture: false,
  },
  {
    id: "rva",
    name: "RVA Tiếng Việt",
    group: "Toàn cầu",
    src: "https://livestream.rvasia.org:8443/Vietnamese.mp3",
    kind: "audio",
    kbps: 64,
    picture: false,
  },
  {
    id: "th-cantho",
    name: "TH Cần Thơ",
    group: "Hình",
    src: "https://live.canthotv.vn/live/tv/playlist.m3u8",
    kind: "hls",
    kbps: 3390,
    picture: true,
  },
];

export function mbPerHour(kbps: number): number {
  if (!kbps) return 0;
  return (kbps * 3600) / 8 / 1000;
}
