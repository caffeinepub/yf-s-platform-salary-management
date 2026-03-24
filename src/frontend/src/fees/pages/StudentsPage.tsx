import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, PlusCircle, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getStudents, saveStudents } from "../store";
import type { Student } from "../types";

const EMPTY: Omit<Student, "id"> = {
  name: "",
  rollNo: "",
  className: "",
  phone: "",
  address: "",
  status: "active",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(getStudents);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<Omit<Student, "id">>(EMPTY);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(s: Student) {
    setEditing(s);
    setForm({
      name: s.name,
      rollNo: s.rollNo,
      className: s.className,
      phone: s.phone,
      address: s.address,
      status: s.status,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    let updated: Student[];
    if (editing) {
      updated = students.map((s) =>
        s.id === editing.id ? { ...s, ...form } : s,
      );
      toast.success("Student updated");
    } else {
      const maxId =
        students.length > 0 ? Math.max(...students.map((s) => s.id)) : 0;
      updated = [...students, { id: maxId + 1, ...form }];
      toast.success("Student added");
    }
    saveStudents(updated);
    setStudents(updated);
    setOpen(false);
  }

  function handleDelete(id: number) {
    const updated = students.filter((s) => s.id !== id);
    saveStudents(updated);
    setStudents(updated);
    setConfirmDelete(null);
    toast.success("Student deleted");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Students
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {students.length} students registered
          </p>
        </div>
        <Button onClick={openAdd} data-ocid="fees.students.add.button">
          <PlusCircle className="w-4 h-4 mr-1" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Student List
          </CardTitle>
          <Input
            placeholder="Search by name, class, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2"
            style={{ color: "black", background: "white" }}
            data-ocid="fees.students.search.input"
          />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">
                        {s.rollNo || "—"}
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.className}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            s.status === "active" ? "default" : "secondary"
                          }
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(s)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setConfirmDelete(s.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Student" : "Add Student"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Roll No</Label>
              <Input
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Input
                value={form.className}
                onChange={(e) =>
                  setForm({ ...form, className: e.target.value })
                }
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ color: "black", background: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as "active" | "inactive" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                style={{ color: "black", background: "white" }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmDelete !== null && handleDelete(confirmDelete)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
