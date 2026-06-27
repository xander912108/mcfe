const asset = (fileName: string) => `${import.meta.env.BASE_URL}${fileName}`;

export const images = {
  avatar1: asset('avatar-1.jpg'),
  avatar2: asset('avatar-2.jpg'),
  avatar3: asset('avatar-3.jpg'),
  avatar4: asset('avatar-4.jpg'),
  avatar5: asset('avatar-5.jpg'),
  avatarFounder: asset('avatar-founder.jpg'),
  cardCover: asset('card-cover.jpg'),
  heroCover: asset('hero-cover.jpg'),
  preview1: asset('preview-1.jpg'),
  preview2: asset('preview-2.jpg'),
  preview3: asset('preview-3.jpg'),
  preview4: asset('preview-4.jpg'),
  preview5: asset('preview-5.jpg'),
  preview6: asset('preview-6.jpg'),
  team1: asset('team-1.jpg'),
  team2: asset('team-2.jpg'),
  team3: asset('team-3.jpg'),
  team4: asset('team-4.jpg'),
  team5: asset('team-5.jpg'),
  team6: asset('team-6.jpg'),
  team7: asset('team-7.jpg'),
};

export const avatars = [
  images.avatar1, images.avatar2, images.avatar3,
  images.avatar4, images.avatar5, images.avatarFounder,
];
export const previews = [
  images.preview1, images.preview2, images.preview3,
  images.preview4, images.preview5, images.preview6,
];
export const teams = [
  images.team1, images.team2, images.team3, images.team4,
  images.team5, images.team6, images.team7,
];
