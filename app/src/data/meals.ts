// MVP meal set — five plates with hand-picked actual macro values.
// In a real build these would come from a content service backed by
// either a labelled image dataset or a vision model. For now: stubs.

export type Meal = {
  id: string;
  photo: string; // remote URI; Image source={{uri}} works in Expo
  caption: string;
  calories: number; // kcal
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
};

export const meals: Meal[] = [
  {
    id: 'avo-toast',
    photo:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
    caption: 'Sourdough · avocado · two eggs · cherry tomatoes',
    calories: 488,
    protein: 17,
    carbs: 38,
    fat: 28,
  },
  {
    id: 'poke-bowl',
    photo:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    caption: 'Salmon poke bowl · rice · edamame · avocado',
    calories: 562,
    protein: 34,
    carbs: 61,
    fat: 18,
  },
  {
    id: 'chicken-rice',
    photo:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',
    caption: 'Grilled chicken · jasmine rice · broccoli',
    calories: 624,
    protein: 48,
    carbs: 58,
    fat: 19,
  },
  {
    id: 'pasta-tomato',
    photo:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
    caption: 'Spaghetti pomodoro · basil · parmesan',
    calories: 712,
    protein: 24,
    carbs: 92,
    fat: 26,
  },
  {
    id: 'greek-salad',
    photo:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
    caption: 'Greek salad · feta · olives · olive oil',
    calories: 320,
    protein: 11,
    carbs: 14,
    fat: 26,
  },
];
