import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Asset {
  id: string;
  title: string;
  asset_type: string;
  data: { url?: string; imageUrl?: string };
  created_at: string;
}

interface ComparisonViewProps {
  assets: Asset[];
  isOpen: boolean;
  onClose: () => void;
}

export const ComparisonView = ({ assets, isOpen, onClose }: ComparisonViewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Compare Assets</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="p-4 space-y-3">
              <img
                src={asset.data?.url || asset.data?.imageUrl}
                alt={asset.title}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold">{asset.title}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{asset.asset_type}</Badge>
                  <Badge variant="outline">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};