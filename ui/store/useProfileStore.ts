import { create } from 'zustand';

interface ProfileStore {
  nickname: string;
  introduce: string;
  birthday: string;
  gender: 'MALE' | 'FEMALE' | '';
  mbti: string;
  interests: string[];
  province: string;
  city: string;
  profile_image_url: string | null;
  setProfile: (data: Partial<ProfileStore>) => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  nickname: '',
  introduce: '',
  birthday: '',
  gender: '',
  mbti: '',
  interests: [],
  province: '',
  city: '',
  profile_image_url: null,

  setProfile: (data) => set((state) => ({ ...state, ...data })),

  resetProfile: () =>
    set({
      nickname: '',
      introduce: '',
      birthday: '',
      gender: '',
      mbti: '',
      interests: [],
      province: '',
      city: '',
      profile_image_url: null,
    }),
}));
