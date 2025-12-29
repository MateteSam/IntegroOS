import { z } from 'zod';

// Brand generation validation schemas
export const brandPromptSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name too long"),
  industry: z.string().min(1, "Industry is required"),
  brandPersonality: z.string().optional(),
  colorPreferences: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  brandStory: z.string().max(2000, "Brand story too long").optional(),
});

export const assetGenerationSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(500, "Prompt too long"),
  assetType: z.enum([
    'logo', 'business-card', 'letterhead', 'poster', 'flyer',
    'social-ig', 'social-fb', 'social-twitter', 'social-linkedin', 
    'social-pinterest', 'social-youtube', 'app-icon', 'email-sig', 
    'mockup', 'packaging', 'tshirt'
  ]),
  variationIndex: z.number().min(0).max(10).optional(),
  referenceImage: z.string().optional(),
});

export const commentSchema = z.object({
  assetId: z.string().uuid(),
  comment: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
  xPosition: z.number().min(0).max(100).optional(),
  yPosition: z.number().min(0).max(100).optional(),
});

export const collectionSchema = z.object({
  name: z.string().min(1, "Collection name required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

// Type exports
export type BrandPromptInput = z.infer<typeof brandPromptSchema>;
export type AssetGenerationInput = z.infer<typeof assetGenerationSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Validation failed" };
  }
}
