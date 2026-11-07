/** National VTV channels the public VTVgo catalog marks as free (mustLogin: false). */
export const VTV_CHANNELS: { id: string; name: string }[] = [
  { id: "1", name: "VTV1" },
  { id: "2", name: "VTV2" },
  { id: "3", name: "VTV3" },
  { id: "4", name: "VTV4" },
  { id: "5", name: "VTV5" },
  { id: "7", name: "VTV5 Tây Nam Bộ" },
  { id: "163", name: "VTV5 Tây Nguyên" },
  { id: "13", name: "VTV6" },
  { id: "27", name: "VTV7" },
  { id: "36", name: "VTV8" },
  { id: "39", name: "VTV9" },
  { id: "6", name: "VTV10" },
  { id: "vietnamtoday", name: "Vietnam Today" },
];

export const VTV_IDS = new Set(VTV_CHANNELS.map((channel) => channel.id));
