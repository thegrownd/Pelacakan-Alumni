import { useRoute } from "wouter";
import { useAlumniDetail, useVerifyCandidateMutation, useRejectCandidateMutation } from "@/hooks/use-spat-api";
import { 
  ArrowLeft, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  BookOpen, 
  Building2,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

const getSignalIcon = (type: string) => {
  switch(type) {
    case 'job_title': return <Briefcase className="h-3 w-3" />;
    case 'company': return <Building2 className="h-3 w-3" />;
    case 'location': return <MapPin className="h-3 w-3" />;
    case 'education': return <GraduationCap className="h-3 w-3" />;
    case 'publication': return <BookOpen className="h-3 w-3" />;
    default: return <Briefcase className="h-3 w-3" />;
  }
};

export default function AlumniDetail() {
  const [match, params] = useRoute("/alumni/:id/detail");
  const id = parseInt(params?.id || "0");

  const { data: alumni, isLoading } = useAlumniDetail(id);
  const verifyMutation = useVerifyCandidateMutation();
  const rejectMutation = useRejectCandidateMutation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!alumni) {
    return <div className="text-center py-20 text-muted-foreground font-medium">Alumni tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <Link href="/alumni">
        <Button variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Data Alumni
        </Button>
      </Link>

      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-8 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <GraduationCap className="h-48 w-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
              {alumni.trackingStatus}
            </Badge>
            <span className="text-primary-foreground/80 text-sm font-medium">ID: #{alumni.id}</span>
          </div>
          <h1 className="text-4xl font-display font-bold mb-2">{alumni.name}</h1>
          <p className="text-xl text-primary-foreground/90 font-medium">
            {alumni.major} • Angkatan {alumni.graduationYear}
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            {alumni.affiliationKeywords?.length > 0 && (
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
                <div className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Target Afiliasi</div>
                <div className="flex flex-wrap gap-2">
                  {alumni.affiliationKeywords.map((kw, i) => (
                    <Badge key={i} className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-normal">{kw}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <h2 className="text-2xl font-display font-bold text-foreground">Cross-Validation Evidence</h2>
        <span className="text-muted-foreground text-sm font-medium">{alumni.candidates?.length || 0} Kandidat Ditemukan</span>
      </div>

      {alumni.candidates?.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">Sistem belum menemukan data pelacakan yang relevan di web.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {alumni.candidates?.map((candidate) => (
            <div key={candidate.id} className={`
              bg-card rounded-2xl border shadow-sm flex flex-col
              ${candidate.status === 'verified' ? 'border-emerald-500 shadow-emerald-500/10' : 
                candidate.status === 'rejected' ? 'border-red-200 opacity-60' : 'border-border'}
            `}>
              <div className="p-5 border-b border-border/50 flex justify-between items-start bg-secondary/10 rounded-t-2xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{candidate.source}</h3>
                    {candidate.sourceUrl && (
                      <a href={candidate.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">Confidence: {candidate.confidenceScore.toFixed(0)}%</span>
                    {candidate.status === 'verified' && <Badge className="bg-emerald-500">Verified</Badge>}
                    {candidate.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                    {candidate.status === 'pending' && <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending</Badge>}
                  </div>
                </div>
                
                {candidate.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => rejectMutation.mutate({ id: candidate.id })}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                      onClick={() => verifyMutation.mutate({ id: candidate.id })}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1">
                <p className="text-sm italic text-muted-foreground mb-4 border-l-2 border-primary/30 pl-3 py-1">
                  "{candidate.snippet}"
                </p>

                {candidate.signals && candidate.signals.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sinyal Terekstrak</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.signals.map((sig) => (
                        <Badge key={sig.id} variant="outline" className="bg-background flex items-center gap-1.5 py-1">
                          <span className="text-muted-foreground">{getSignalIcon(sig.signalType)}</span>
                          <span className="font-medium">{sig.value}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 mt-auto">
                  <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                    <div className="text-[10px] text-muted-foreground font-bold mb-1">NAMA</div>
                    <div className="text-sm font-semibold">{candidate.nameMatchScore}%</div>
                    <ConfidenceBar score={candidate.nameMatchScore} />
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                    <div className="text-[10px] text-muted-foreground font-bold mb-1">AFILIASI</div>
                    <div className="text-sm font-semibold">{candidate.affiliationScore}%</div>
                    <ConfidenceBar score={candidate.affiliationScore} />
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                    <div className="text-[10px] text-muted-foreground font-bold mb-1">JURUSAN</div>
                    <div className="text-sm font-semibold">{candidate.majorScore}%</div>
                    <ConfidenceBar score={candidate.majorScore} />
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                    <div className="text-[10px] text-muted-foreground font-bold mb-1">TAHUN</div>
                    <div className="text-sm font-semibold">{candidate.timelineScore}%</div>
                    <ConfidenceBar score={candidate.timelineScore} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
