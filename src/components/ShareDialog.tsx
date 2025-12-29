import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Copy, Check, Share2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShareDialogProps {
  collectionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareDialog = ({ collectionId, isOpen, onClose }: ShareDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('share-collection', {
        body: { collectionId, makePublic: isPublic }
      });

      if (error) throw error;

      setShareUrl(data.shareUrl);
      toast.success('Share link generated!');
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-switch">Make collection public</Label>
            <Switch
              id="public-switch"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {!shareUrl ? (
            <Button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="w-full gradient-primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Share Link'
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view {isPublic ? 'this' : 'the'} collection
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};