import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Hash,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Institute,
  useAddInstitute,
  useDeleteInstitute,
  useGetAllInstitutes,
  useUpdateInstitute,
} from "../hooks/useQueries";

interface InstituteForm {
  name: string;
  code: string;
  shortCode: string;
  location: string;
}

const EMPTY_FORM: InstituteForm = {
  name: "",
  code: "",
  shortCode: "",
  location: "",
};

export default function InstituteManagementPage() {
  const { data: institutes = [], isLoading } = useGetAllInstitutes();
  const addMutation = useAddInstitute();
  const updateMutation = useUpdateInstitute();
  const deleteMutation = useDeleteInstitute();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Institute | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Institute | null>(null);
  const [form, setForm] = useState<InstituteForm>(EMPTY_FORM);

  const filtered = institutes.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (inst: Institute) => {
    setEditTarget(inst);
    setForm({
      name: inst.name,
      code: inst.code,
      shortCode: (inst as any).shortCode || "",
      location: inst.location,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      toast.error("Name and location are required");
      return;
    }
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, ...form });
        toast.success("Institute updated successfully");
      } else {
        await addMutation.mutateAsync(form);
        toast.success("Institute added successfully");
      }
      setFormOpen(false);
    } catch {
      toast.error("Operation failed. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Institute deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Delete failed. Please try again.");
    }
  };

  const isBusy = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6" data-ocid="institutes.page">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">
            Institute Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage branches and institutions
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gradient-primary text-white border-0 glow-primary gap-2"
          data-ocid="institutes.add_button"
        >
          <Plus className="w-4 h-4" />
          Add Institute
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, or location..."
          className="pl-9 bg-card/60 border-border/60"
          data-ocid="institutes.search_input"
        />
        {search && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch("")}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="institutes.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
          data-ocid="institutes.empty_state"
        >
          <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-display font-semibold text-muted-foreground">
            {search ? "No institutes found" : "No institutes yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search
              ? "Try a different search term"
              : 'Click "Add Institute" to get started'}
          </p>
        </motion.div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          data-ocid="institutes.list"
        >
          {filtered.map((inst, idx) => (
            <motion.div
              key={inst.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              data-ocid={`institutes.item.${idx + 1}`}
            >
              <Card className="gradient-card hover:scale-[1.02] transition-transform duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-display">
                          {inst.name}
                        </CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inst.code && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-muted/60"
                            >
                              <Hash className="w-3 h-3 mr-1" />
                              {inst.code}
                            </Badge>
                          )}
                          {(inst as any).shortCode && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-primary/10 text-primary border-primary/30"
                            >
                              {(inst as any).shortCode}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{inst.location}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(inst)}
                      className="flex-1 gap-1.5 text-primary hover:bg-primary/10 hover:text-primary"
                      data-ocid={`institutes.edit_button.${idx + 1}`}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(inst)}
                      className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      data-ocid={`institutes.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="bg-card border-border/60 sm:max-w-md"
          data-ocid="institutes.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-gradient">
              {editTarget ? "Edit Institute" : "Add New Institute"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {editTarget
                ? "Update institute details"
                : "Fill in the details to add a new institute"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <Building2 className="w-3.5 h-3.5" /> Institute Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g., St. Xavier's College"
                className="bg-input/60 border-border/60 text-foreground font-medium"
                data-ocid="institutes.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <Hash className="w-3.5 h-3.5" /> Institute Code
                <span className="text-xs text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="e.g., SXC001 (optional)"
                className="bg-input/60 border-border/60 text-foreground font-medium"
                data-ocid="institutes.code.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <Hash className="w-3.5 h-3.5" /> Short Code
                <span className="text-xs text-muted-foreground font-normal">
                  (used in reports, e.g., BSM)
                </span>
              </Label>
              <Input
                value={form.shortCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shortCode: e.target.value }))
                }
                placeholder="e.g., BSM, VHSS (optional)"
                className="bg-input/60 border-border/60 text-foreground font-medium"
                data-ocid="institutes.shortCode.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm">
                <MapPin className="w-3.5 h-3.5" /> Location
              </Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g., Mumbai, Maharashtra"
                className="bg-input/60 border-border/60 text-foreground font-medium"
                data-ocid="institutes.location.input"
              />
            </div>
            <DialogFooter className="gap-2 mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormOpen(false)}
                className="text-muted-foreground"
                data-ocid="institutes.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isBusy}
                className="gradient-primary text-white border-0"
                data-ocid="institutes.save_button"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editTarget ? (
                  "Update"
                ) : (
                  "Add Institute"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="bg-card border-border/60"
          data-ocid="institutes.delete_dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-destructive">
              Delete Institute?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border/60"
              data-ocid="institutes.delete_dialog.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="institutes.delete_dialog.confirm_button"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
