import { supabase } from "@/integrations/supabase/client";

/**
 * Meta Social Nexus Protocol (v1.0)
 * Orchestrates high-fidelity social syndication to Meta platforms.
 */

export interface MetaConfig {
    accessToken: string;
    instagramAccountId?: string;
    facebookPageId?: string;
}

export interface SocialPostResult {
    success: boolean;
    platform: 'instagram' | 'facebook';
    postId?: string;
    error?: string;
}

/**
 * Publishes a high-fidelity asset to Instagram.
 * Requires a Meta Business Account and Instagram Graph API access.
 */
export async function postToInstagram(imageUrl: string, caption: string, config: MetaConfig): Promise<SocialPostResult> {
    try {
        // 1. Create Media Container
        const containerUrl = `https://graph.facebook.com/v19.0/${config.instagramAccountId}/media`;
        const containerRes = await fetch(containerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: imageUrl,
                caption: caption,
                access_token: config.accessToken
            })
        });

        const containerData = await containerRes.json();
        if (!containerRes.ok || !containerData.id) {
            throw new Error(containerData.error?.message || 'Failed to create Instagram media container');
        }

        const creationId = containerData.id;

        // 2. Publish Media Container
        const publishUrl = `https://graph.facebook.com/v19.0/${config.instagramAccountId}/media_publish`;
        const publishRes = await fetch(publishUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: config.accessToken
            })
        });

        const publishData = await publishRes.json();
        if (!publishRes.ok || !publishData.id) {
            throw new Error(publishData.error?.message || 'Failed to publish to Instagram');
        }

        return { success: true, platform: 'instagram', postId: publishData.id };
    } catch (e: any) {
        console.error('Meta Social Nexus Error (Instagram):', e);
        return { success: false, platform: 'instagram', error: e.message };
    }
}

/**
 * Publishes a high-fidelity asset to a Facebook Page.
 */
export async function postToFacebook(imageUrl: string, caption: string, config: MetaConfig): Promise<SocialPostResult> {
    try {
        const url = `https://graph.facebook.com/v19.0/${config.facebookPageId}/photos`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: imageUrl,
                message: caption,
                access_token: config.accessToken
            })
        });

        const data = await res.json();
        if (!res.ok || !data.post_id) {
            throw new Error(data.error?.message || 'Failed to publish to Facebook');
        }

        return { success: true, platform: 'facebook', postId: data.post_id };
    } catch (e: any) {
        console.error('Meta Social Nexus Error (Facebook):', e);
        return { success: false, platform: 'facebook', error: e.message };
    }
}

/**
 * Orchestrates a cross-platform syndication event.
 */
export async function syndicateToMeta(imageUrl: string, caption: string, config: MetaConfig): Promise<SocialPostResult[]> {
    const results: SocialPostResult[] = [];

    if (config.instagramAccountId) {
        results.push(await postToInstagram(imageUrl, caption, config));
    }

    if (config.facebookPageId) {
        results.push(await postToFacebook(imageUrl, caption, config));
    }

    return results;
}
