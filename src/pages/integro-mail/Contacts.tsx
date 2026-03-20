import { useState } from "react";
import { AppLayout } from "@/components/integro-mail/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  MoreHorizontal,
  Mail,
  Tag,
  Loader,
  Trash2,
  Edit2,
} from "lucide-react";
import { useContacts, useDeleteContact, Contact } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { CreateContactDialog } from "@/components/integro-mail/dialogs/CreateContactDialog";
import { EditContactDialog } from "@/components/integro-mail/dialogs/EditContactDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Contacts = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { data: contacts = [], isLoading, refetch } = useContacts(search);
  const { mutate: deleteContact } = useDeleteContact();
  const { toast } = useToast();

  const handleDelete = (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    deleteContact(contactId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
        refetch();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete contact",
          variant: "destructive",
        });
      },
    });
  };

  const handleEditClick = (contact: Contact) => {
    setSelectedContact(contact);
    setEditDialogOpen(true);
  };
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your subscriber lists and contact segments.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 text-white border-0" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="glass">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">8,432</p>
              <p className="text-sm text-muted-foreground">Total Contacts</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-success">7,891</p>
              <p className="text-sm text-muted-foreground">Subscribed</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-destructive">541</p>
              <p className="text-sm text-muted-foreground">Unsubscribed</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-warning">12</p>
              <p className="text-sm text-muted-foreground">Bounced</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/50 border-border"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No contacts found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox />
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{contact.name}</h4>
                        <Badge
                          variant={contact.status === "subscribed" ? "default" : "secondary"}
                          className={
                            contact.status === "subscribed"
                              ? "bg-success/20 text-success"
                              : "bg-destructive/20 text-destructive"
                          }
                        >
                          {contact.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </span>
                      </div>
                    </div>
                    <div className="hidden lg:flex gap-1">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground hidden md:block">
                      {contact.createdAt}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(contact)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>Add to List</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CreateContactDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={() => refetch()}
        />
        {selectedContact && (
          <EditContactDialog
            contact={selectedContact}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={() => {
              refetch();
              setSelectedContact(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Contacts;
