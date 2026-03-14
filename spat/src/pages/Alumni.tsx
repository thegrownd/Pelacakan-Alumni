import { useState } from "react";
import { Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight,
  GraduationCap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TagInput } from "@/components/TagInput";
import { 
  useAlumniList, 
  useCreateAlumniMutation, 
  useUpdateAlumniMutation, 
  useDeleteAlumniMutation 
} from "@/hooks/use-spat-api";

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  major: z.string().min(2, "Jurusan diperlukan"),
  graduationYear: z.coerce.number().min(1950).max(2100),
  nameVariations: z.array(z.string()).default([]),
  affiliationKeywords: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

export default function Alumni() {
  const { data: alumni, isLoading } = useAlumniList();
  const createMutation = useCreateAlumniMutation();
  const updateMutation = useUpdateAlumniMutation();
  const deleteMutation = useDeleteAlumniMutation();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      major: "",
      graduationYear: new Date().getFullYear(),
      nameVariations: [],
      affiliationKeywords: [],
    },
  });

  const filteredAlumni = alumni?.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.major.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleOpenEdit = (data: any) => {
    setEditingId(data.id);
    form.reset({
      name: data.name,
      major: data.major,
      graduationYear: data.graduationYear,
      nameVariations: data.nameVariations || [],
      affiliationKeywords: data.affiliationKeywords || [],
    });
    setIsDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    form.reset({
      name: "",
      major: "",
      graduationYear: new Date().getFullYear(),
      nameVariations: [],
      affiliationKeywords: [],
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      createMutation.mutate({ data: values }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Yakin ingin menghapus alumni ini?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Teridentifikasi":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none font-semibold">Teridentifikasi</Badge>;
      case "Perlu Verifikasi Manual":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none font-semibold">Perlu Verifikasi</Badge>;
      default:
        return <Badge variant="secondary" className="font-semibold text-slate-500">Belum Ditemukan</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Kelola Alumni</h1>
          <p className="text-muted-foreground">Manajemen data master alumni dan parameter pencarian.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Alumni
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card rounded-2xl border-border shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">
                {editingId ? "Edit Alumni" : "Tambah Alumni"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-2" placeholder="Cth: Budi Santoso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Lulus</FormLabel>
                        <FormControl>
                          <Input className="rounded-xl border-2" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurusan / Program Studi</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl border-2" placeholder="Cth: Teknik Informatika" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameVariations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variasi Nama (Opsional)</FormLabel>
                      <FormControl>
                        <TagInput 
                          value={field.value} 
                          onChange={field.onChange} 
                          placeholder="Ketik & Enter (cth: B. Santoso)" 
                        />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground mt-1">Membantu sistem melacak nama dengan singkatan atau gelar.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="affiliationKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keyword Afiliasi (Opsional)</FormLabel>
                      <FormControl>
                        <TagInput 
                          value={field.value} 
                          onChange={field.onChange} 
                          placeholder="Ketik & Enter (cth: Telkom, Google)" 
                        />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground mt-1">Perusahaan, institusi, atau lokasi yang diketahui.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto px-8 rounded-xl shadow-md"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Data"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-secondary/20 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama atau jurusan..." 
              className="pl-9 rounded-xl border-border bg-background shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Nama Alumni</TableHead>
                <TableHead className="font-semibold text-foreground hidden sm:table-cell">Jurusan</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Tahun Lulus</TableHead>
                <TableHead className="font-semibold text-foreground">Status Pelacakan</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">Memuat data...</TableCell>
                </TableRow>
              ) : filteredAlumni.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">Tidak ada data alumni.</TableCell>
                </TableRow>
              ) : (
                filteredAlumni.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/40 transition-colors">
                    <TableCell className="font-medium text-foreground flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      {item.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">{item.major}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{item.graduationYear}</TableCell>
                    <TableCell>{getStatusBadge(item.trackingStatus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-slate-500 hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Link href={`/alumni/${item.id}/detail`} className="block">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
