import { FileText, Shield, Download } from "lucide-react";

export type ProductDocument = {
  id: string;
  type: "CE" | "FDA" | "ISO" | "MSDS" | "RoHS" | "OTHER";
  title: string;
  fileUrl: string;
  verified?: boolean;
};

type ProductDocumentsProps = {
  documents: ProductDocument[];
};

const documentIcons: Record<string, string> = {
  CE: "CE",
  FDA: "FDA",
  ISO: "ISO",
  MSDS: "MSDS",
  RoHS: "RoHS",
  OTHER: "DOC",
};

export default function ProductDocuments({ documents }: ProductDocumentsProps) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Product Certifications & Documents</h2>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                {documentIcons[doc.type]}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{doc.title}</h3>
                <p className="text-sm text-slate-500">{doc.type} Certificate</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.verified && (
                <span title="Verified">
                  <Shield className="size-4 text-emerald-600" />
                </span>
              )}
              <a
                href={doc.fileUrl}
                download
                className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                aria-label={`Download ${doc.title}`}
              >
                <Download className="size-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}