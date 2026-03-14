import { useState } from "react";
import { Link } from "wouter";
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Linkedin,
  BookOpen,
  Search,
  Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCandidateList, useVerifyCandidateMutation, useRejectCandidateMutation } from "@/hooks/use-spat-api";

// Simple progress bar helper
function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1 font-medium">
        <span>Confidence</span>
        <span className={score >= 70 ? 'text-emerald-700' : score >= 40 ? 'text-amber-700' : 'text-red-700'}>
          {score.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'LinkedIn': return <Linkedin className="h-5 w-5 text-[#0A66C2]" />;
    case 'Google Scholar': return <BookOpen className="h-5 w-5 text-[#4285F4]" />;
    default: return <Search className="h-5 w-5 text-slate-500" />;
  }
};

export default function Tracking() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  
  const { data: candidates, isLoading } = useCandidateList({ 
    status: statusFilter === "semua" ? undefined : statusFilter 
  });
  
  const verifyMutation = useVerifyCandidateMutation();
  const rejectMutation = useRejectCandidateMutation();

  const handleVerify = (id: number) => {
    verifyMutation.mutate({ id });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate({ id });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Hasil Tracking</h1>
          <p className="text-muted-foreground">Verifikasi kandidat profil alumni dari berbagai sumber web.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border/50 shadow-sm">
          <Filter className="h-4 w-4 text-muted-foreground ml-2" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-none bg-transparent focus:ring-0 shadow-none">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="pending">Perlu Verifikasi</SelectItem>
              <SelectItem value="verified">Diverifikasi</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-card border border-border/50 animate-pulse"></div>
          ))}
        </div>
      ) : candidates?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-foreground">Tidak Ada Kandidat</h3>
          <p className="text-muted-foreground">Tidak ada kandidat dengan status yang dipilih.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {candidates?.map((candidate) => (
            <div key={candidate.id} className="bg-card rounded-2xl border border-border/60 shadow-md shadow-black/5 overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow">
              {/* Left Info Section */}
              <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {getSourceIcon(candidate.source)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                      Kandidat untuk Alumni #{candidate.alumniId}
                      {candidate.status === 'verified' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Verified</Badge>}
                      {candidate.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                    </h3>
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      {candidate.source}
                      {candidate.sourceUrl && (
                        <a href={candidate.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center">
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-foreground/80 leading-relaxed border border-slate-100 relative">
                  <span className="absolute -top-3 left-4 bg-slate-50 px-2 text-xs font-bold text-slate-400 tracking-wider uppercase">Snippet</span>
                  "{candidate.snippet}"
                </div>
              </div>
              
              {/* Right Score & Action Section */}
              <div className="p-6 md:w-1/3 flex flex-col justify-between bg-secondary/10">
                <div className="space-y-4">
                  <ConfidenceBar score={candidate.confidenceScore} />
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama (40%)</span>
                      <span className="font-medium">{candidate.nameMatchScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Afiliasi (30%)</span>
                      <span className="font-medium">{candidate.affiliationScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jurusan (20%)</span>
                      <span className="font-medium">{candidate.majorScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tahun (10%)</span>
                      <span className="font-medium">{candidate.timelineScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link href={`/alumni/${candidate.alumniId}/detail`} className="flex-1">
                    <Button variant="outline" className="w-full bg-white">Detail</Button>
                  </Link>
                  {candidate.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleReject(candidate.id)}
                        disabled={rejectMutation.isPending}
                        variant="outline" 
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Tolak
                      </Button>
                      <Button 
                        onClick={() => handleVerify(candidate.id)}
                        disabled={verifyMutation.isPending}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verifikasi
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
