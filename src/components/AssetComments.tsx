import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { MessageSquare, X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Comment {
  id: string;
  comment: string;
  x_position: number | null;
  y_position: number | null;
  created_at: string;
  user_id: string;
}

interface AssetCommentsProps {
  assetId: string;
  imageUrl: string;
}

export const AssetComments = ({ assetId, imageUrl }: AssetCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAddingPin, setIsAddingPin] = useState(false);

  useEffect(() => {
    loadComments();
    
    const channel = supabase
      .channel(`asset_comments_${assetId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'asset_comments', filter: `asset_id=eq.${assetId}` },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assetId]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('asset_comments')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setSelectedPosition({ x, y });
    setShowCommentInput(true);
    setIsAddingPin(false);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    const { error } = await supabase.from('asset_comments').insert({
      asset_id: assetId,
      comment: newComment,
      x_position: selectedPosition?.x || null,
      y_position: selectedPosition?.y || null,
      user_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      toast.error('Failed to add comment');
    } else {
      toast.success('Comment added!');
      setNewComment('');
      setShowCommentInput(false);
      setSelectedPosition(null);
    }
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('asset_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      toast.error('Failed to delete comment');
    } else {
      toast.success('Comment deleted');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({comments.length})
        </h3>
        <Button
          variant={isAddingPin ? "default" : "outline"}
          onClick={() => setIsAddingPin(!isAddingPin)}
          className="hover-lift"
        >
          {isAddingPin ? 'Click on Image' : 'Add Pin'}
        </Button>
      </div>

      <div className="relative">
        <div 
          className={`relative ${isAddingPin ? 'cursor-crosshair' : ''}`}
          onClick={handleImageClick}
        >
          <img src={imageUrl} alt="Asset" className="w-full rounded-lg" />
          
          {comments.filter(c => c.x_position !== null).map((comment) => (
            <div
              key={comment.id}
              className="absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce hover:scale-110 transition-transform cursor-pointer"
              style={{
                left: `${comment.x_position}%`,
                top: `${comment.y_position}%`,
                transform: 'translate(-50%, -50%)'
              }}
              title={comment.comment}
            >
              <MessageSquare className="w-4 h-4" />
            </div>
          ))}
          
          {selectedPosition && showCommentInput && (
            <div
              className="absolute w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white animate-pulse"
              style={{
                left: `${selectedPosition.x}%`,
                top: `${selectedPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>
      </div>

      {showCommentInput && (
        <Card className="p-4 space-y-3">
          <Textarea
            placeholder="Add your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={addComment} className="flex-1 gradient-primary">
              <Send className="w-4 h-4 mr-2" />
              Add Comment
            </Button>
            <Button variant="outline" onClick={() => {
              setShowCommentInput(false);
              setSelectedPosition(null);
              setNewComment('');
            }}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <div className="bg-gradient-to-br from-primary to-accent w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  U
                </div>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">{comment.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteComment(comment.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
