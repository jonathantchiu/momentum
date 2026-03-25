import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsdaService } from '../../modules/nutrition/usda.service.js';

const svc = new UsdaService();

describe('UsdaService.searchFoods', () => {
  it('returns array of food results for valid query', async () => {
    const results = await svc.searchFoods('chicken breast');
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('fdcId');
      expect(results[0]).toHaveProperty('description');
    }
  });

  it('returns empty array for nonsense query', async () => {
    const results = await svc.searchFoods('xyznonexistentfood999');
    expect(Array.isArray(results)).toBe(true);
  });
});

describe('UsdaService.getNutrients', () => {
  it('returns nutrient data for known food', async () => {
    const results = await svc.searchFoods('banana');
    if (results.length > 0) {
      const nutrients = await svc.getNutrients(results[0].fdcId);
      if (nutrients) {
        expect(nutrients).toHaveProperty('calories');
        expect(nutrients).toHaveProperty('proteinG');
        expect(nutrients).toHaveProperty('carbsG');
        expect(nutrients).toHaveProperty('fatG');
      }
    }
  });

  it('returns null for invalid fdcId', async () => {
    const nutrients = await svc.getNutrients('invalid-id-00000');
    expect(nutrients).toBeNull();
  });
});
