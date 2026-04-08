import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, ListChecks, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getCategories,
  getFeeStructures,
  saveCategories,
  saveFeeStructures,
} from "../store";
import type { FeeCategory, FeeStructure } from "../types";

function fmtAmt(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FeeStructurePage() {
  const [categories, setCategories] = useState<FeeCategory[]>(getCategories);
  const [structures, setStructures] =
    useState<FeeStructure[]>(getFeeStructures);

  // Category dialog
  const [catOpen, setCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<FeeCategory | null>(null);
  const [catForm, setCatForm] = useState({ name: "", description: "" });

  // Structure dialog
  const [strOpen, setStrOpen] = useState(false);
  const [editingStr, setEditingStr] = useState<FeeStructure | null>(null);
  const [strForm, setStrForm] = useState({
    className: "",
    categoryId: "",
    amount: "",
    frequency: "monthly" as FeeStructure["frequency"],
  });

  function openAddCat() {
    setEditingCat(null);
    setCatForm({ name: "", description: "" });
    setCatOpen(true);
  }
  function openEditCat(c: FeeCategory) {
    setEditingCat(c);
    setCatForm({ name: c.name, description: c.description });
    setCatOpen(true);
  }
  function saveCat() {
    if (!catForm.name.trim()) {
      toast.error("Name required");
      return;
    }
    let updated: FeeCategory[];
    if (editingCat) {
      updated = categories.map((c) =>
        c.id === editingCat.id ? { ...c, ...catForm } : c,
      );
    } else {
      const maxId =
        categories.length > 0 ? Math.max(...categories.map((c) => c.id)) : 0;
      updated = [...categories, { id: maxId + 1, ...catForm }];
    }
    saveCategories(updated);
    setCategories(updated);
    setCatOpen(false);
    toast.success(editingCat ? "Category updated" : "Category added");
  }
  function deleteCat(id: number) {
    const updated = categories.filter((c) => c.id !== id);
    saveCategories(updated);
    setCategories(updated);
    toast.success("Category deleted");
  }

  function openAddStr() {
    setEditingStr(null);
    setStrForm({
      className: "",
      categoryId: "",
      amount: "",
      frequency: "monthly",
    });
    setStrOpen(true);
  }
  function openEditStr(s: FeeStructure) {
    setEditingStr(s);
    setStrForm({
      className: s.className,
      categoryId: String(s.categoryId),
      amount: String(s.amount),
      frequency: s.frequency,
    });
    setStrOpen(true);
  }
  function saveStr() {
    if (!strForm.className.trim() || !strForm.categoryId || !strForm.amount) {
      toast.error("All fields required");
      return;
    }
    let updated: FeeStructure[];
    if (editingStr) {
      updated = structures.map((s) =>
        s.id === editingStr.id
          ? {
              ...s,
              className: strForm.className,
              categoryId: Number(strForm.categoryId),
              amount: Number(strForm.amount),
              frequency: strForm.frequency,
            }
          : s,
      );
    } else {
      const maxId =
        structures.length > 0 ? Math.max(...structures.map((s) => s.id)) : 0;
      updated = [
        ...structures,
        {
          id: maxId + 1,
          className: strForm.className,
          categoryId: Number(strForm.categoryId),
          amount: Number(strForm.amount),
          frequency: strForm.frequency,
        },
      ];
    }
    saveFeeStructures(updated);
    setStructures(updated);
    setStrOpen(false);
    toast.success(editingStr ? "Structure updated" : "Structure added");
  }
  function deleteStr(id: number) {
    const updated = structures.filter((s) => s.id !== id);
    saveFeeStructures(updated);
    setStructures(updated);
    toast.success("Structure deleted");
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">
          Fee Structure
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage fee categories and class-wise fee structures
        </p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Fee Categories</CardTitle>
              <Button size="sm" onClick={openAddCat}>
                <PlusCircle className="w-4 h-4 mr-1" /> Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No categories yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditCat(c)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteCat(c.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Class-wise Fee Structures
              </CardTitle>
              <Button size="sm" onClick={openAddStr}>
                <PlusCircle className="w-4 h-4 mr-1" /> Add Structure
              </Button>
            </CardHeader>
            <CardContent>
              {structures.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No structures yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {structures.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Class: {s.className} —{" "}
                          {catMap[s.categoryId] ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtAmt(s.amount)} / {s.frequency}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditStr(s)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deleteStr(s.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCat ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={catForm.name}
                onChange={(e) =>
                  setCatForm({ ...catForm, name: e.target.value })
                }
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={catForm.description}
                onChange={(e) =>
                  setCatForm({ ...catForm, description: e.target.value })
                }
                style={{ color: "black", background: "white" }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCat}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={strOpen} onOpenChange={setStrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStr ? "Edit Structure" : "Add Structure"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Input
                value={strForm.className}
                onChange={(e) =>
                  setStrForm({ ...strForm, className: e.target.value })
                }
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={strForm.categoryId}
                onValueChange={(v) => setStrForm({ ...strForm, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount *</Label>
              <Input
                type="number"
                value={strForm.amount}
                onChange={(e) =>
                  setStrForm({ ...strForm, amount: e.target.value })
                }
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select
                value={strForm.frequency}
                onValueChange={(v) =>
                  setStrForm({
                    ...strForm,
                    frequency: v as FeeStructure["frequency"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStrOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveStr}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
