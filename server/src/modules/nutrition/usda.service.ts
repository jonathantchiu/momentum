interface FoodSearchResult {
  fdcId: string;
  description: string;
  brandOwner?: string;
}

interface NutrientData {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
};

export class UsdaService {
  private baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  private apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';

  async searchFoods(query: string, pageSize = 10): Promise<FoodSearchResult[]> {
    try {
      const url = `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.foods || []).map((f: Record<string, unknown>) => ({
        fdcId: String(f.fdcId),
        description: String(f.description || ''),
        brandOwner: f.brandOwner ? String(f.brandOwner) : undefined,
      }));
    } catch {
      return [];
    }
  }

  async getNutrients(fdcId: string): Promise<NutrientData | null> {
    try {
      const url = `${this.baseUrl}/food/${fdcId}?api_key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const nutrients = data.foodNutrients || [];
      const get = (id: number): number => {
        const n = nutrients.find(
          (n: Record<string, unknown>) =>
            (n.nutrient as Record<string, unknown>)?.number === String(id) ||
            (n.nutrient as Record<string, unknown>)?.id === id
        );
        return n ? Number(n.amount || 0) : 0;
      };
      return {
        calories: get(NUTRIENT_IDS.calories),
        proteinG: get(NUTRIENT_IDS.protein),
        carbsG: get(NUTRIENT_IDS.carbs),
        fatG: get(NUTRIENT_IDS.fat),
        fiberG: get(NUTRIENT_IDS.fiber),
      };
    } catch {
      return null;
    }
  }
}
